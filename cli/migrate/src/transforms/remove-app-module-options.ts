import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Remove `{ router }` second argument from `.use(SomeAppModule, { router })`.
 *
 * `defineAppModule()` in v2 returns `{ install(app: App): void }` — it takes
 * NO options. The legacy `{ router }` argument is a leftover from the older
 * module shape and now causes a TS2769 overload error.
 *
 * Narrow match: only when the second argument is an ObjectExpression with a
 * single property named `router` (shorthand or explicit). This avoids
 * touching framework-style calls like `.use(VirtoShellFramework, { router, i18n: {...} })`
 * which legitimately accept multi-key options.
 */

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  if (!fileInfo.path.endsWith(".ts")) return null;

  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;

  root.find(j.CallExpression).forEach((path) => {
    const callee = path.node.callee;
    // Match `<something>.use(X, Y)` — callee is MemberExpression with property `.use`
    if (callee.type !== "MemberExpression") return;
    if (callee.property.type !== "Identifier" || callee.property.name !== "use") return;

    const args = path.node.arguments;
    if (args.length !== 2) return;

    const secondArg = args[1];
    if (secondArg.type !== "ObjectExpression") return;
    if (secondArg.properties.length !== 1) return;

    const prop = secondArg.properties[0] as any;
    const isProperty = prop.type === "ObjectProperty" || prop.type === "Property";
    if (!isProperty) return;
    if (prop.key?.type !== "Identifier" || prop.key.name !== "router") return;

    // Remove the second argument — .use(X, { router }) → .use(X)
    path.node.arguments = [args[0]];
    modified = true;
  });

  if (!modified) return null;
  return root.toSource();
};

export default transform;
export const parser = "tsx";
