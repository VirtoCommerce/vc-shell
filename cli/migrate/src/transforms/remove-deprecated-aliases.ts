import { SyntaxKind } from "ts-morph";
import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

const ALIAS_MAP: Record<string, string> = {
  navigationViewLocation: "NavigationViewLocationKey",
  BladeInstance: "BladeInstanceKey",
  NotificationTemplatesSymbol: "NotificationTemplatesKey",
  BLADE_BACK_BUTTON: "BladeBackButtonKey",
  TOOLBAR_SERVICE: "ToolbarServiceKey",
  EMBEDDED_MODE: "EmbeddedModeKey",
};

export function runRemoveDeprecatedAliases(
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
    // Find import declarations from @vc-shell/framework
    const importDeclarations = sourceFile
      .getImportDeclarations()
      .filter((d) => d.getModuleSpecifierValue() === "@vc-shell/framework");

    // Collect which deprecated aliases are used in this file
    const aliasesToRename: Array<{ oldName: string; newName: string }> = [];

    for (const importDecl of importDeclarations) {
      for (const namedImport of importDecl.getNamedImports()) {
        const name = namedImport.getName();
        if (ALIAS_MAP[name]) {
          aliasesToRename.push({ oldName: name, newName: ALIAS_MAP[name] });
        }
      }
    }

    if (aliasesToRename.length === 0) {
      result.filesSkipped.push(sourceFile.getFilePath());
      continue;
    }

    // For each alias to rename, replace all identifier usages first, then rename the import
    for (const { oldName, newName } of aliasesToRename) {
      // Replace all identifiers with the old name throughout the file
      const identifiers = sourceFile
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((id) => id.getText() === oldName);

      for (const id of identifiers) {
        id.replaceWithText(newName);
      }
    }

    result.filesModified.push(sourceFile.getFilePath());
  }

  return result;
}
