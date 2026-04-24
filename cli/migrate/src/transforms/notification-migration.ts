import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const RETURN_RENAMES: Record<string, string> = {
  moduleNotifications: "messages",
  notifications: "messages",
};

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  const hasOldImport = frameworkImports.find(j.ImportSpecifier, { imported: { name: "useNotifications" } }).size() > 0;
  if (!hasOldImport) return null;

  // Collect local variable renames: old local name → new name
  const localRenames = new Map<string, string>();

  // Step 1: Rename import specifier
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    if (path.node.imported.type === "Identifier" && path.node.imported.name === "useNotifications") {
      path.node.imported = j.identifier("useBladeNotifications");
      if (path.node.local?.name === "useNotifications") {
        path.node.local = j.identifier("useBladeNotifications");
      }
    }
  });

  // Step 2: Convert call sites and collect renames
  root.find(j.CallExpression, { callee: { name: "useNotifications" } }).forEach((callPath) => {
    (callPath.node.callee as any).name = "useBladeNotifications";

    const args = callPath.node.arguments;

    // Convert arguments
    if (args.length === 0) {
      callPath.node.arguments = [
        j.objectExpression([j.property("init", j.identifier("types"), j.arrayExpression([]))]),
      ];
    } else if (args.length === 1 && args[0].type === "StringLiteral") {
      const typeName = args[0].value;
      callPath.node.arguments = [
        j.objectExpression([j.property("init", j.identifier("types"), j.arrayExpression([j.literal(typeName)]))]),
      ];
    }

    // Collect destructured property renames
    const parent = callPath.parent;
    if (parent?.node?.type === "VariableDeclarator" && parent.node.id?.type === "ObjectPattern") {
      for (const prop of parent.node.id.properties) {
        if (prop.type !== "ObjectProperty" && prop.type !== "Property") continue;
        const key = prop.key;
        if (key.type !== "Identifier") continue;

        const newName = RETURN_RENAMES[key.name];
        if (!newName) continue;

        // Get the local variable name (might differ from key if aliased)
        const localName =
          (prop as any).shorthand || prop.value.type !== "Identifier" ? key.name : (prop.value as any).name;

        localRenames.set(localName, newName);

        // Update the destructuring pattern
        key.name = newName;
        if ((prop as any).shorthand) {
          // Shorthand stays shorthand with new name
          if (prop.value.type === "Identifier") {
            (prop.value as any).name = newName;
          }
        } else if (prop.value.type === "Identifier" && RETURN_RENAMES[(prop.value as any).name]) {
          // { moduleNotifications: moduleNotifications } → make shorthand
          (prop.value as any).name = newName;
          (prop as any).shorthand = true;
        }
      }
    }
  });

  // Step 3: Rename all downstream usages of collected local variables
  for (const [oldName, newName] of localRenames) {
    root.find(j.Identifier, { name: oldName }).forEach((idPath) => {
      // Skip import specifiers
      if (idPath.parent?.node?.type === "ImportSpecifier") return;
      // Skip object pattern keys/values (already handled)
      if (idPath.parent?.node?.type === "ObjectProperty" || idPath.parent?.node?.type === "Property") {
        const parentProp = idPath.parent.node as any;
        if (parentProp.key === idPath.node || parentProp.value === idPath.node) {
          // Check if this is inside the destructuring we already handled
          const grandparent = idPath.parent?.parent?.node;
          if (grandparent?.type === "ObjectPattern") return;
        }
      }
      idPath.node.name = newName;
    });
  }

  // Step 4: Detect watch(messages/moduleNotifications, ...) patterns.
  // These require manual migration to onMessage — emit a diagnostic.
  const watchedNames = new Set([...localRenames.values(), ...Object.keys(RETURN_RENAMES)]);
  root.find(j.CallExpression, { callee: { name: "watch" } }).forEach((watchPath) => {
    const args = watchPath.node.arguments;
    if (args.length < 2) return;
    const watched = args[0];
    if (watched.type === "Identifier" && watchedNames.has(watched.name)) {
      api.report(
        `${fileInfo.path}: watch(${watched.name}, ...) with manual toast management must be replaced with onMessage option in useBladeNotifications. ` +
          `Extract data-reload logic into onMessage, delete the watch block and all notification()/notification.update() calls. ` +
          `See migration guide: 14-notifications.md Step 4.`,
      );
    }
  });

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
