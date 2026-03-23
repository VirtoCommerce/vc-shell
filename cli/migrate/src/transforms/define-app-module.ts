import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
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
      // 3+ args: defineAppModule({ blades: arg0, locales: arg1, notificationTemplates?: arg2 })
      // arg3+ (components etc.) dropped — not needed in new API
      const properties = [
        j.property("init", j.identifier("blades"), args[0] as any),
        j.property("init", j.identifier("locales"), args[1] as any),
      ];
      if (args[1].type === "Identifier" && args[1].name === "locales") {
        properties[1].shorthand = true;
      }
      properties.push(j.property("init", j.identifier("notificationTemplates"), args[2] as any));
      if (args[2].type === "Identifier" && args[2].name === "notificationTemplates") {
        properties[2].shorthand = true;
      }
      const obj = j.objectExpression(properties);
      const replacement = j.callExpression(j.identifier("defineAppModule"), [obj]);
      j(path).replaceWith(replacement);

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

      api.report(
        `${fileInfo.path}: Migrated ${args.length}-arg createAppModule. ` +
        `notificationTemplates is deprecated — migrate to new notifications config format.`,
      );
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
