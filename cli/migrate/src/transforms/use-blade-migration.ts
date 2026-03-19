import { SyntaxKind, Node } from "ts-morph";
import type { Project } from "ts-morph";
import type { TransformOptions, TransformResult } from "./types.js";

const OLD_NAME = "useBladeNavigation";
const NEW_NAME = "useBlade";

export function runUseBladeMigration(
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

    let modified = false;

    // Step 1: Rename all useBladeNavigation identifiers to useBlade
    const identifiers = sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((id) => id.getText() === OLD_NAME);

    for (const id of identifiers) {
      id.replaceWithText(NEW_NAME);
      modified = true;
    }

    // Step 2: Find onBeforeClose callback calls and invert return values
    const callExprs = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === "onBeforeClose");

    for (const call of callExprs) {
      const args = call.getArguments();
      if (args.length === 0) continue;

      const callback = args[0];

      // callback should be arrow function or function expression
      if (
        !Node.isArrowFunction(callback) &&
        !Node.isFunctionExpression(callback)
      ) {
        result.warnings.push(
          `${sourceFile.getFilePath()}: onBeforeClose with non-inline callback, manual review needed`,
        );
        continue;
      }

      const returnStatements = callback.getDescendantsOfKind(
        SyntaxKind.ReturnStatement,
      );

      if (returnStatements.length === 0) continue;

      if (returnStatements.length > 1) {
        result.warnings.push(
          `${sourceFile.getFilePath()}: Complex onBeforeClose callback with multiple returns detected, manual review needed`,
        );
        continue;
      }

      // Single return — invert it
      const returnStmt = returnStatements[0];
      const expr = returnStmt.getExpression();
      if (expr) {
        const exprText = expr.getText();
        // For simple true/false literals, just prefix with !
        if (exprText === "true" || exprText === "false") {
          expr.replaceWithText(`!${exprText}`);
        } else {
          expr.replaceWithText(`!(${exprText})`);
        }
        modified = true;
      }
    }

    if (modified) {
      result.filesModified.push(sourceFile.getFilePath());
    }
  }

  return result;
}
