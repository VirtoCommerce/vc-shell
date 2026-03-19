import { SyntaxKind } from "ts-morph";
import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

const OLD_NAME = "useNotifications";
const NEW_NAME = "useBladeNotifications";

export function runNotificationMigration(
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

    let hasTarget = false;

    for (const importDecl of importDeclarations) {
      for (const namedImport of importDecl.getNamedImports()) {
        if (namedImport.getName() === OLD_NAME) {
          hasTarget = true;
          break;
        }
      }
      if (hasTarget) break;
    }

    if (!hasTarget) {
      result.filesSkipped.push(sourceFile.getFilePath());
      continue;
    }

    // Rename all identifiers with the old name throughout the file
    const identifiers = sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((id) => id.getText() === OLD_NAME);

    for (const id of identifiers) {
      id.replaceWithText(NEW_NAME);
    }

    result.filesModified.push(sourceFile.getFilePath());
  }

  return result;
}
