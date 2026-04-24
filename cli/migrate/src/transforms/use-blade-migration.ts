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
  const hasOldName = frameworkImports.find(j.ImportSpecifier, { imported: { name: OLD_NAME } }).size() > 0;
  const hasResolve = root.find(j.Identifier, { name: "resolveBladeByName" }).size() > 0;

  if (!hasOldName && !hasResolve) return null;

  let modified = false;

  // Step 1: Rename useBladeNavigation → useBlade
  if (hasOldName) {
    root.find(j.Identifier, { name: OLD_NAME }).forEach((path) => {
      path.node.name = NEW_NAME;
    });
    modified = true;
  }

  // Step 2: Rewrite openBlade({ blade: resolveBladeByName("X")!, ... }) → openBlade({ name: "X", ... })
  root.find(j.CallExpression, { callee: { name: "openBlade" } }).forEach((callPath) => {
    const args = callPath.node.arguments;
    if (args.length === 0) return;

    const firstArg = args[0];
    if (firstArg.type !== "ObjectExpression") return;

    const bladeIdx = firstArg.properties.findIndex(
      (p) =>
        (p.type === "Property" || p.type === "ObjectProperty") &&
        p.key.type === "Identifier" &&
        (p.key as any).name === "blade",
    );
    if (bladeIdx === -1) return;

    const bladeProp = firstArg.properties[bladeIdx] as any;
    let bladeValue = bladeProp.value;

    // Unwrap non-null assertion: resolveBladeByName("X")!
    if (bladeValue.type === "TSNonNullExpression") {
      bladeValue = bladeValue.expression;
    }

    // Match resolveBladeByName("StringLiteral")
    if (
      bladeValue.type === "CallExpression" &&
      bladeValue.callee.type === "Identifier" &&
      bladeValue.callee.name === "resolveBladeByName" &&
      bladeValue.arguments.length === 1 &&
      bladeValue.arguments[0].type === "StringLiteral"
    ) {
      const bladeName = bladeValue.arguments[0].value;
      firstArg.properties[bladeIdx] = j.property("init", j.identifier("name"), j.literal(bladeName));
      modified = true;
    }

    // Remove second boolean argument (legacy isWorkspace/replace flag)
    if (args.length > 1 && args[1].type === "BooleanLiteral") {
      callPath.node.arguments = [firstArg];
      modified = true;
    }
  });

  // Step 3: Remove resolveBladeByName from destructuring
  if (hasResolve) {
    root.find(j.VariableDeclarator).forEach((declPath) => {
      const id = declPath.node.id;
      if (id.type !== "ObjectPattern") return;
      const init = declPath.node.init;
      if (!init || init.type !== "CallExpression") return;
      if (init.callee.type !== "Identifier" || init.callee.name !== "useBlade") return;

      const propsBefore = id.properties.length;
      id.properties = id.properties.filter((prop) => {
        if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
          return (prop.key as any).name !== "resolveBladeByName";
        }
        return true;
      });
      if (id.properties.length !== propsBefore) {
        modified = true;
      }
    });
  }

  // Step 4: Invert onBeforeClose returns
  root.find(j.CallExpression, { callee: { name: "onBeforeClose" } }).forEach((callPath) => {
    const args = callPath.node.arguments;
    if (args.length === 0) return;

    const callback = args[0];
    if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") {
      api.report(`${fileInfo.path}: onBeforeClose with non-inline callback, manual review needed`);
      return;
    }

    const callbackCollection = j(callback);
    const returnStatements = callbackCollection.find(j.ReturnStatement);

    if (returnStatements.size() === 0) return;

    if (returnStatements.size() > 1) {
      api.report(`${fileInfo.path}: Complex onBeforeClose callback with multiple returns, manual review needed`);
      return;
    }

    const isAsync = (callback as any).async === true;

    returnStatements.forEach((retPath) => {
      const arg = retPath.node.argument;
      if (!arg) return;

      if (isAsync && arg.type !== "AwaitExpression") {
        retPath.node.argument = j.unaryExpression("!", j.awaitExpression(arg));
      } else if (arg.type === "AwaitExpression") {
        retPath.node.argument = j.unaryExpression("!", arg);
      } else {
        retPath.node.argument = j.unaryExpression("!", arg);
      }
    });

    modified = true;
  });

  if (!modified) return null;
  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
