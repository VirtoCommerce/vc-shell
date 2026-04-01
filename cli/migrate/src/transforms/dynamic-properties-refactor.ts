import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Migrate useDynamicProperties consumers from positional args to options object.
 *
 * Before:
 *   useDynamicProperties<A, B, C, D, E>(searchFn, PropertyValueFactory, PropertyDictionaryItemFactory, measureFn)
 *
 * After:
 *   useDynamicProperties({ searchDictionary: searchFn, searchMeasurements: measureFn })
 *
 * Also removes:
 *   - class PropertyValueFactory { ... }
 *   - class PropertyDictionaryItemFactory { ... }
 *   - Generic type parameters from the call
 */

const FACTORY_CLASS_NAMES = new Set(["PropertyValueFactory", "PropertyDictionaryItemFactory"]);

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find useDynamicProperties calls
  const calls = root.find(j.CallExpression, {
    callee: { name: "useDynamicProperties" },
  });

  if (calls.size() === 0) return null;

  let modified = false;

  // --- Step 1: Rewrite useDynamicProperties calls from positional to options ---
  calls.forEach((callPath) => {
    const node = callPath.node;
    const args = node.arguments;

    // Only transform if using positional args (not already an object)
    // Old API: useDynamicProperties(searchFn, Class1, Class2, measureFn)
    // The old API has 2-4 positional arguments; new API has 1 object argument
    if (args.length < 2) return;

    // If first arg is already an ObjectExpression, skip (already migrated)
    if (args.length === 1 && args[0].type === "ObjectExpression") return;

    const properties: Array<ReturnType<typeof j.objectProperty>> = [];

    // First arg: searchDictionary function
    if (args[0] && args[0].type !== "ClassExpression") {
      properties.push(j.objectProperty(j.identifier("searchDictionary"), args[0] as any));
    }

    // args[1] and args[2] are factory classes — skip them

    // Fourth arg (index 3): searchMeasurements function
    if (args.length >= 4 && args[3] && args[3].type !== "ClassExpression") {
      properties.push(j.objectProperty(j.identifier("searchMeasurements"), args[3] as any));
    }

    // Replace arguments with single options object
    node.arguments = [j.objectExpression(properties)];

    // Remove generic type parameters
    if ("typeParameters" in node && node.typeParameters) {
      (node as any).typeParameters = null;
    }

    modified = true;
  });

  // --- Step 2: Remove factory class declarations ---
  root.find(j.ClassDeclaration).forEach((classPath) => {
    const id = classPath.node.id;
    const name = id && id.type === "Identifier" ? id.name : undefined;
    if (name && FACTORY_CLASS_NAMES.has(name)) {
      j(classPath).remove();
      modified = true;
    }
  });

  // Also remove class expressions assigned to variables
  root.find(j.VariableDeclarator).forEach((declPath) => {
    const init = declPath.node.init;
    if (
      init &&
      init.type === "ClassExpression" &&
      declPath.node.id.type === "Identifier" &&
      FACTORY_CLASS_NAMES.has(declPath.node.id.name)
    ) {
      const declaration = declPath.parent;
      if (declaration.node.type === "VariableDeclaration" && declaration.node.declarations.length === 1) {
        j(declaration).remove();
      } else {
        j(declPath).remove();
      }
      modified = true;
    }
  });

  // --- Step 3: Remove factory class imports if they exist ---
  root.find(j.ImportDeclaration).forEach((importPath) => {
    const specifiers = importPath.node.specifiers ?? [];
    const remaining = specifiers.filter((spec) => {
      if (spec.type !== "ImportSpecifier") return true;
      const name = spec.imported.type === "Identifier" ? spec.imported.name : "";
      return !FACTORY_CLASS_NAMES.has(name);
    });

    if (remaining.length === 0 && specifiers.length > 0) {
      // Check if ALL specifiers were factory classes
      const allFactory = specifiers.every((spec) => {
        if (spec.type !== "ImportSpecifier") return false;
        const name = spec.imported.type === "Identifier" ? spec.imported.name : "";
        return FACTORY_CLASS_NAMES.has(name);
      });
      if (allFactory) {
        j(importPath).remove();
        modified = true;
      }
    } else if (remaining.length < specifiers.length) {
      importPath.node.specifiers = remaining;
      modified = true;
    }
  });

  if (modified) {
    console.log(`  ✅  ${fileInfo.path}: Migrated useDynamicProperties() to options API`);
  }

  if (!modified) return null;
  return root.toSource();
}

const transform: Transform = wrapForSFC(coreTransform) as Transform;
export default transform;
export const parser = "tsx";
