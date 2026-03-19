import { SyntaxKind } from "ts-morph";
import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

export function runDefineAppModule(
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
    let modified = false;

    // Find imports from @vc-shell/framework containing createAppModule
    const importDeclarations = sourceFile
      .getImportDeclarations()
      .filter((d) => d.getModuleSpecifierValue() === "@vc-shell/framework");

    const hasCreateAppModule = importDeclarations.some((d) =>
      d.getNamedImports().some((n) => n.getName() === "createAppModule"),
    );

    if (!hasCreateAppModule) {
      result.filesSkipped.push(sourceFile.getFilePath());
      continue;
    }

    // Find all call expressions of createAppModule BEFORE renaming the import
    const callExpressions = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === "createAppModule");

    for (const call of callExpressions) {
      const args = call.getArguments();

      if (args.length === 2) {
        const arg0 = args[0].getText();
        const arg1 = args[1].getText();
        // Replace positional args with named object shorthand
        call.replaceWithText(`defineAppModule({ ${arg0}, ${arg1} })`);
        modified = true;
      } else {
        // Rename the call to defineAppModule but emit a warning
        call.getExpression().replaceWithText("defineAppModule");
        result.warnings.push(
          `${sourceFile.getFilePath()}: defineAppModule called with ${args.length} argument(s) — expected 2 (pages, locales). Manual review required.`,
        );
        modified = true;
      }
    }

    // Now rename the import specifier
    for (const importDecl of importDeclarations) {
      const namedImport = importDecl
        .getNamedImports()
        .find((n) => n.getName() === "createAppModule");

      if (namedImport) {
        namedImport.setName("defineAppModule");
        modified = true;
      }
    }

    if (modified) {
      result.filesModified.push(sourceFile.getFilePath());
    }
  }

  return result;
}
