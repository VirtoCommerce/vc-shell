import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

function coreTransform(fileInfo: FileInfo, api: API, options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Check for createAppModule import from @vc-shell/framework
  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });

  const createAppModuleSpecifiers = frameworkImports.find(j.ImportSpecifier, {
    imported: { name: "createAppModule" },
  });

  if (createAppModuleSpecifiers.size() === 0) return null;

  // Find createAppModule() calls
  const calls = root.find(j.CallExpression, {
    callee: { name: "createAppModule" },
  });

  if (calls.size() === 0) return null;

  let modified = false;

  calls.forEach((path) => {
    const args = path.node.arguments;

    if (args.length === 2) {
      // 2-arg: defineAppModule({ blades: pages, locales: locales })
      const properties = [
        j.property("init", j.identifier("blades"), args[0] as any),
        j.property("init", j.identifier("locales"), args[1] as any),
      ];
      // Use shorthand only for locales if identifier matches key name
      if (args[1].type === "Identifier" && args[1].name === "locales") {
        properties[1].shorthand = true;
      }
      const obj = j.objectExpression(properties);
      const replacement = j.callExpression(j.identifier("defineAppModule"), [obj]);
      j(path).replaceWith(replacement);
      modified = true;
    } else if (args.length >= 3) {
      // 3+ args: defineAppModule({ blades, locales, notifications/notificationTemplates })
      const notifArg = args[2];
      let autoMigrated = false;

      // Try auto-migration with notifyTypeMap
      const notifyTypeMap = options.notifyTypeMap as Record<string, Record<string, string>> | undefined;

      if (notifyTypeMap && notifArg.type === "Identifier") {
        // Find the namespace import source for the notifications identifier
        let notifImportSource: string | null = null;
        let notifEntries: Record<string, string> | null = null;

        root.find(j.ImportDeclaration).forEach((imp) => {
          const specs = imp.node.specifiers || [];
          const hasNs = specs.some(
            (s) => s.type === "ImportNamespaceSpecifier" && s.local?.name === (notifArg as any).name,
          );
          if (hasNs && imp.node.source.value) {
            const src = String(imp.node.source.value);
            if (notifyTypeMap[src]) {
              notifImportSource = src;
              notifEntries = notifyTypeMap[src];
            }
          }
        });

        if (notifEntries && notifImportSource) {
          const entries = Object.entries(notifEntries);
          const capturedSource = notifImportSource;

          // Replace namespace import with individual default imports
          const oldImport = root
            .find(j.ImportDeclaration)
            .filter(
              (imp) =>
                String(imp.node.source.value) === capturedSource &&
                (imp.node.specifiers || []).some(
                  (s: any) => s.type === "ImportNamespaceSpecifier" && s.local?.name === (notifArg as any).name,
                ),
            );

          // Insert new imports after old one (reverse iterate for correct order)
          for (let i = entries.length - 1; i >= 0; i--) {
            const [eventName, fileName] = entries[i];
            const importPath = `${capturedSource}/${fileName}`;
            oldImport.insertAfter(
              j.importDeclaration([j.importDefaultSpecifier(j.identifier(eventName))], j.literal(importPath)),
            );
          }
          oldImport.remove();

          // Build notifications object
          const notifProperties = entries.map(([eventName]) => {
            const templateProp = j.property("init", j.identifier("template"), j.identifier(eventName));
            const toastProp = j.property(
              "init",
              j.identifier("toast"),
              j.objectExpression([j.property("init", j.identifier("mode"), j.literal("auto"))]),
            );
            return j.property("init", j.identifier(eventName), j.objectExpression([templateProp, toastProp]));
          });

          const properties = [
            j.property("init", j.identifier("blades"), args[0] as any),
            j.property("init", j.identifier("locales"), args[1] as any),
          ];
          if (args[1].type === "Identifier" && args[1].name === "locales") {
            properties[1].shorthand = true;
          }
          properties.push(j.property("init", j.identifier("notifications"), j.objectExpression(notifProperties)));

          const obj = j.objectExpression(properties);
          j(path).replaceWith(j.callExpression(j.identifier("defineAppModule"), [obj]));

          autoMigrated = true;
          api.report(
            `${fileInfo.path}: Auto-migrated notifications. ` +
              `Review toast.severity — defaulting to mode: "auto" only.`,
          );
        }
      }

      if (!autoMigrated) {
        // Fallback: keep notificationTemplates as deprecated key (skip if undefined)
        const properties = [
          j.property("init", j.identifier("blades"), args[0] as any),
          j.property("init", j.identifier("locales"), args[1] as any),
        ];
        if (args[1].type === "Identifier" && args[1].name === "locales") {
          properties[1].shorthand = true;
        }

        // Only add notificationTemplates if it's not `undefined`
        const isUndefinedArg = args[2].type === "Identifier" && (args[2] as any).name === "undefined";
        if (!isUndefinedArg) {
          properties.push(j.property("init", j.identifier("notificationTemplates"), args[2] as any));
          if (args[2].type === "Identifier" && args[2].name === "notificationTemplates") {
            properties[2].shorthand = true;
          }
        }
        const obj = j.objectExpression(properties);
        j(path).replaceWith(j.callExpression(j.identifier("defineAppModule"), [obj]));

        api.report(
          `${fileInfo.path}: Migrated ${args.length}-arg createAppModule. ` +
            `notificationTemplates is deprecated — migrate to new notifications config format.`,
        );
      }

      // Remove dead imports for unused args (e.g. `import * as components`)
      if (args.length >= 4) {
        for (let i = 3; i < args.length; i++) {
          const droppedArg = args[i];
          if (droppedArg.type === "Identifier") {
            const droppedName = droppedArg.name;
            root.find(j.ImportDeclaration).forEach((imp: any) => {
              const specs = imp.node.specifiers || [];
              const nsIdx = specs.findIndex(
                (s: any) => s.type === "ImportNamespaceSpecifier" && s.local?.name === droppedName,
              );
              if (nsIdx !== -1) {
                const usages = root.find(j.Identifier, { name: droppedName }).size();
                if (usages <= 1) {
                  j(imp).remove();
                }
              }
            });
          }
        }
      }

      modified = true;
    }
  });

  if (!modified) return null;

  // Rename import specifier
  createAppModuleSpecifiers.forEach((specPath) => {
    specPath.node.imported = j.identifier("defineAppModule");
  });

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
