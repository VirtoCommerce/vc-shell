import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Replace defineExpose({...}) with exposeToChildren({...}) from useBlade() in blade pages.
 *
 * defineExpose is a Vue macro for parent→child component access.
 * In the blade system, parent→child communication uses exposeToChildren()
 * from useBlade(), which registers methods in the blade messaging system.
 *
 * Only transforms files that have defineOptions/defineBlade (blade pages).
 */

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Only process blade pages
  const isBladePage =
    root.find(j.CallExpression, { callee: { name: "defineOptions" } }).size() > 0 ||
    root.find(j.CallExpression, { callee: { name: "defineBlade" } }).size() > 0;

  if (!isBladePage) return null;

  // Find defineExpose calls
  const exposes = root.find(j.CallExpression, { callee: { name: "defineExpose" } });
  if (exposes.size() === 0) return null;

  let modified = false;

  // Replace defineExpose → exposeToChildren
  exposes.forEach((path) => {
    if (path.node.callee.type === "Identifier") {
      path.node.callee.name = "exposeToChildren";
      modified = true;
    }
  });

  if (!modified) return null;

  // Add exposeToChildren to useBlade() destructuring if not already there
  const useBladeDecls = root.find(j.VariableDeclaration).filter((path) => {
    return (
      j(path)
        .find(j.CallExpression, { callee: { name: "useBlade" } })
        .size() > 0
    );
  });

  if (useBladeDecls.size() > 0) {
    const decl = useBladeDecls.at(0).get().node.declarations[0];
    if (decl.id.type === "ObjectPattern") {
      const hasExposeToChildren = decl.id.properties.some(
        (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "exposeToChildren",
      );
      if (!hasExposeToChildren) {
        const prop = j.objectProperty(j.identifier("exposeToChildren"), j.identifier("exposeToChildren"));
        (prop as any).shorthand = true;
        decl.id.properties.push(prop);
      }
    }
  } else {
    // No useBlade() call exists — need to add import + call
    // Add to framework import
    const frameworkImports = root.find(j.ImportDeclaration, {
      source: { value: "@vc-shell/framework" },
    });

    let hasUseBlade = false;
    frameworkImports.forEach((path) => {
      const specifiers = path.node.specifiers || [];
      if (specifiers.some((s: any) => s.type === "ImportSpecifier" && s.imported?.name === "useBlade")) {
        hasUseBlade = true;
      }
    });

    if (!hasUseBlade && frameworkImports.size() > 0) {
      const firstImport = frameworkImports.at(0).get();
      const specifiers = firstImport.node.specifiers || [];
      specifiers.push(j.importSpecifier(j.identifier("useBlade")));
    }

    // Add const { exposeToChildren } = useBlade(); after last import
    const imports = root.find(j.ImportDeclaration);
    if (imports.size() > 0) {
      const prop = j.objectProperty(j.identifier("exposeToChildren"), j.identifier("exposeToChildren"));
      (prop as any).shorthand = true;
      const decl = j.variableDeclaration("const", [
        j.variableDeclarator(
          j.objectPattern([prop]),
          j.callExpression(j.identifier("useBlade"), []),
        ),
      ]);
      j(imports.at(-1).get()).insertAfter(decl);
    }
  }

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
