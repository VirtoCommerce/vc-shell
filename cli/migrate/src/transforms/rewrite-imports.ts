import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";
import { SYMBOL_TO_ENTRY } from "../utils/import-rewriter.js";

export function runRewriteImports(
  project: Project,
  options: TransformOptions,
): TransformResult {
  const result: TransformResult = {
    filesModified: [],
    filesSkipped: [],
    warnings: [],
    errors: [],
  };

  for (const sourceFile of project.getSourceFiles()) {
    const importDeclarations = sourceFile
      .getImportDeclarations()
      .filter((d) => d.getModuleSpecifierValue() === "@vc-shell/framework");

    if (importDeclarations.length === 0) {
      result.filesSkipped.push(sourceFile.getFilePath());
      continue;
    }

    let fileModified = false;

    for (const importDecl of importDeclarations) {
      const namedImports = importDecl.getNamedImports();

      // Group specifiers by their target entry point
      const toMove = new Map<string, string[]>(); // entryPoint -> symbols[]
      const toKeep: string[] = [];

      for (const namedImport of namedImports) {
        const name = namedImport.getName();
        const alias = namedImport.getAliasNode()?.getText();
        const targetEntry = SYMBOL_TO_ENTRY.get(name);

        if (targetEntry) {
          if (!toMove.has(targetEntry)) {
            toMove.set(targetEntry, []);
          }
          // Preserve alias if present
          toMove.get(targetEntry)!.push(alias ? `${name} as ${alias}` : name);
        } else {
          toKeep.push(alias ? `${name} as ${alias}` : name);
        }
      }

      if (toMove.size === 0) {
        // Nothing to move in this import declaration
        continue;
      }

      fileModified = true;

      // Add new import declarations for each sub-entry point
      for (const [entryPoint, symbols] of toMove) {
        sourceFile.addImportDeclaration({
          namedImports: symbols,
          moduleSpecifier: entryPoint,
        });
      }

      // Either update or remove the original import declaration
      if (toKeep.length === 0) {
        importDecl.remove();
      } else {
        // Remove moved specifiers from original; keep only the remaining ones
        // We rebuild by removing all named imports and re-adding the kept ones
        for (const namedImport of importDecl.getNamedImports()) {
          namedImport.remove();
        }
        for (const kept of toKeep) {
          // kept may be "name" or "name as alias"
          const parts = kept.split(" as ");
          if (parts.length === 2) {
            importDecl.addNamedImport({ name: parts[0].trim(), alias: parts[1].trim() });
          } else {
            importDecl.addNamedImport(kept.trim());
          }
        }
      }
    }

    if (fileModified) {
      result.filesModified.push(sourceFile.getFilePath());
    } else {
      result.filesSkipped.push(sourceFile.getFilePath());
    }
  }

  return result;
}
