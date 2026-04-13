import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Remove the catch-all `/:pathMatch(.*)*` route entry from router/routes.ts.
 * The framework now handles this internally.
 *
 * Targets:
 * ```ts
 * {
 *   path: "/:pathMatch(.*)*",
 *   component: App,
 *   beforeEnter: async (to) => { ... },
 * }
 * ```
 */

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  // Only process route files
  if (!fileInfo.path.includes("route")) return null;

  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let modified = false;

  // Find array elements that are ObjectExpressions with path: "/:pathMatch(.*)*"
  root.find(j.ObjectExpression).forEach((path) => {
    const props = path.node.properties;
    const pathProp = props.find(
      (p: any) =>
        p.type === "ObjectProperty" &&
        p.key.type === "Identifier" &&
        p.key.name === "path" &&
        p.value.type === "StringLiteral" &&
        p.value.value.includes(":pathMatch"),
    );

    if (!pathProp) return;

    // Remove this element from parent array
    const parent = path.parent;
    if (parent.node.type === "ArrayExpression") {
      const idx = parent.node.elements.indexOf(path.node);
      if (idx !== -1) {
        parent.node.elements.splice(idx, 1);
        modified = true;
      }
    }
  });

  if (!modified) return null;

  // Clean up: remove unused imports that were only used in the pathMatch route
  // Common: useBlade, routeResolver
  const source = root.toSource();

  // Re-parse to check for unused imports
  const root2 = j(source);

  // Check if useBlade is still used anywhere besides import
  const useBladeUsages = root2
    .find(j.Identifier, { name: "useBlade" })
    .filter((p) => p.parent.node.type !== "ImportSpecifier");

  if (useBladeUsages.size() === 0) {
    // Remove useBlade from framework import
    root2.find(j.ImportDeclaration, { source: { value: "@vc-shell/framework" } }).forEach((importPath) => {
      const specifiers = importPath.node.specifiers ?? [];
      const remaining = specifiers.filter((spec) => {
        if (spec.type !== "ImportSpecifier") return true;
        const name = spec.imported.type === "Identifier" ? spec.imported.name : "";
        return name !== "useBlade";
      });
      if (remaining.length === 0) {
        j(importPath).remove();
      } else {
        importPath.node.specifiers = remaining;
      }
    });
  }

  return root2.toSource();
};

export default transform;
export const parser = "tsx";
