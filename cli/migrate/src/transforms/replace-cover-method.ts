import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Replace openBlade({ ..., replaceCurrentBlade: true }) → coverWith({ ... })
 *
 * The old replaceCurrentBlade option in openBlade() is now a separate coverWith() method.
 * If replaceWith() is already used — don't touch it (already migrated).
 *
 * Also adds coverWith to useBlade() destructuring if needed.
 */

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Only process files that use openBlade with replaceCurrentBlade
  const openBladeCalls = root.find(j.CallExpression, { callee: { name: "openBlade" } });
  if (openBladeCalls.size() === 0) return null;

  let modified = false;

  openBladeCalls.forEach((path) => {
    const args = path.node.arguments;
    if (args.length === 0) return;

    // Handle both direct object and first positional arg
    const firstArg = args[0];
    if (firstArg.type !== "ObjectExpression") return;

    // Find replaceCurrentBlade property
    const replaceIdx = firstArg.properties.findIndex(
      (p: any) =>
        p.type === "ObjectProperty" &&
        p.key.type === "Identifier" &&
        p.key.name === "replaceCurrentBlade",
    );

    if (replaceIdx === -1) return;

    const replaceProp = firstArg.properties[replaceIdx] as any;

    // Only transform if value is `true`
    const isTrue =
      (replaceProp.value.type === "BooleanLiteral" && replaceProp.value.value === true) ||
      (replaceProp.value.type === "Literal" && replaceProp.value.value === true);

    if (!isTrue) return;

    // Remove replaceCurrentBlade property
    firstArg.properties.splice(replaceIdx, 1);

    // Also remove isWorkspace if present (second positional arg in legacy openBlade)
    // Legacy: openBlade(event, isWorkspace?) — but with replaceCurrentBlade it's inside event obj

    // Rename openBlade → coverWith
    if (path.node.callee.type === "Identifier") {
      path.node.callee.name = "coverWith";
    }

    modified = true;
  });

  if (!modified) return null;

  // Add coverWith to useBlade() destructuring if not already there
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
      const hasCoverWith = decl.id.properties.some(
        (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "coverWith",
      );
      if (!hasCoverWith) {
        const prop = j.objectProperty(j.identifier("coverWith"), j.identifier("coverWith"));
        (prop as any).shorthand = true;
        decl.id.properties.push(prop);
      }

      // Remove openBlade from destructuring if no longer used anywhere
      const remainingOpenBlade = root
        .find(j.CallExpression, { callee: { name: "openBlade" } })
        .size();
      if (remainingOpenBlade === 0) {
        const openBladeIdx = decl.id.properties.findIndex(
          (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "openBlade",
        );
        if (openBladeIdx !== -1) {
          decl.id.properties.splice(openBladeIdx, 1);
        }
      }
    }
  }

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
