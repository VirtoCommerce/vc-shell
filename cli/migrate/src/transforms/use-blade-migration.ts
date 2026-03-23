import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const OLD_NAME = "useBladeNavigation";
const NEW_NAME = "useBlade";

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  const hasTarget = frameworkImports.find(j.ImportSpecifier, { imported: { name: OLD_NAME } }).size() > 0;
  if (!hasTarget) return null;

  // Step 1: Rename all useBladeNavigation identifiers
  root.find(j.Identifier, { name: OLD_NAME }).forEach((path) => {
    path.node.name = NEW_NAME;
  });

  // Step 2: Find onBeforeClose callbacks and invert returns
  root.find(j.CallExpression, { callee: { name: "onBeforeClose" } }).forEach((callPath) => {
    const args = callPath.node.arguments;
    if (args.length === 0) return;

    const callback = args[0];
    // Must be inline arrow/function
    if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") {
      api.report(`${fileInfo.path}: onBeforeClose with non-inline callback, manual review needed`);
      return;
    }

    // Find return statements inside this callback
    const callbackCollection = j(callback);
    const returnStatements = callbackCollection.find(j.ReturnStatement);

    if (returnStatements.size() === 0) return;

    if (returnStatements.size() > 1) {
      api.report(`${fileInfo.path}: Complex onBeforeClose callback with multiple returns, manual review needed`);
      return;
    }

    // Single return — invert it
    returnStatements.forEach((retPath) => {
      const arg = retPath.node.argument;
      if (!arg) return;

      // Wrap with unary negation: !expr or !(expr)
      retPath.node.argument = j.unaryExpression("!", arg);
    });
  });

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
