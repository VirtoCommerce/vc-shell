import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";
import { SYMBOL_TO_ENTRY } from "../utils/import-rewriter.js";

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  let modified = false;

  frameworkImports.forEach((importPath) => {
    const specifiers = importPath.node.specifiers ?? [];
    const toMove = new Map<string, Array<{ imported: string; local: string }>>();
    const toKeep: typeof specifiers = [];

    for (const spec of specifiers) {
      if (spec.type !== "ImportSpecifier") {
        toKeep.push(spec);
        continue;
      }
      const importedName = spec.imported.type === "Identifier" ? spec.imported.name : "";
      const localName = (spec.local as any)?.name ?? importedName;
      const targetEntry = SYMBOL_TO_ENTRY.get(importedName);

      if (targetEntry) {
        if (!toMove.has(targetEntry)) toMove.set(targetEntry, []);
        toMove.get(targetEntry)!.push({ imported: importedName, local: localName });
      } else {
        toKeep.push(spec);
      }
    }

    if (toMove.size === 0) return;
    modified = true;

    // Insert new import declarations for each sub-entry point after current import
    for (const [entryPoint, symbols] of toMove) {
      const newSpecifiers = symbols.map((s) => {
        const spec = j.importSpecifier(j.identifier(s.imported));
        if (s.local !== s.imported) {
          spec.local = j.identifier(s.local);
        }
        return spec;
      });
      const newImport = j.importDeclaration(newSpecifiers, j.literal(entryPoint));
      j(importPath).insertAfter(newImport);
    }

    // Update or remove original import
    if (toKeep.length === 0) {
      j(importPath).remove();
    } else {
      importPath.node.specifiers = toKeep;
    }
  });

  if (!modified) return null;
  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
