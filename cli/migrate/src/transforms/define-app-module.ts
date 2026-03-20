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
      // 2-arg: defineAppModule({ pages, locales })
      // Use shorthand properties
      const properties = args.map((arg) => {
        if (arg.type === "Identifier") {
          const prop = j.property("init", j.identifier(arg.name), j.identifier(arg.name));
          prop.shorthand = true;
          return prop;
        }
        // For non-identifier args, use the arg as-is with a generic key
        return j.property("init", j.identifier("arg"), arg as any);
      });
      const obj = j.objectExpression(properties);
      const replacement = j.callExpression(j.identifier("defineAppModule"), [obj]);
      j(path).replaceWith(replacement);
      modified = true;
    } else if (args.length === 3) {
      // 3-arg: defineAppModule({ blades: pages, locales: locales, notificationTemplates: notificationTemplates })
      const properties = [
        j.property("init", j.identifier("blades"), args[0] as any),
        j.property("init", j.identifier("locales"), args[1] as any),
        j.property("init", j.identifier("notificationTemplates"), args[2] as any),
      ];
      const obj = j.objectExpression(properties);
      const replacement = j.callExpression(j.identifier("defineAppModule"), [obj]);
      j(path).replaceWith(replacement);
      api.report(
        `${fileInfo.path}: Migrated 3-arg createAppModule with notificationTemplates. ` +
        `Consider restructuring to the new notifications config format (see MIGRATION_GUIDE.md "Notifications System Redesign").`,
      );
      modified = true;
    } else {
      // 4+ args: just rename the callee
      if (path.node.callee.type === "Identifier") {
        path.node.callee.name = "defineAppModule";
      }
      api.report(
        `${fileInfo.path}: defineAppModule called with ${args.length} argument(s) — manual review required.`,
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
