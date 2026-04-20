import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Remove `title` property from `exposeToChildren({...})` calls.
 *
 * In v2, exposeToChildren is function-only — it registers callable methods in
 * the blade messaging system. Passing a reactive `title` (ComputedRef<string>)
 * trips the TS signature `(...args: any[]) => any` check, and the value is no
 * longer used by the blade chrome anyway.
 *
 * If `title` is the only property, the entire exposeToChildren() call is
 * removed. Otherwise, only the `title` key is stripped.
 */

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const calls = root.find(j.CallExpression, { callee: { name: "exposeToChildren" } });
  if (calls.size() === 0) return null;

  let modified = false;

  calls.forEach((path) => {
    const args = path.node.arguments;
    if (args.length === 0) return;

    const arg = args[0];
    if (arg.type !== "ObjectExpression") return;

    const titleIdx = arg.properties.findIndex(
      (p: any) =>
        (p.type === "ObjectProperty" || p.type === "Property") &&
        p.key?.type === "Identifier" &&
        p.key.name === "title",
    );

    if (titleIdx === -1) return;

    arg.properties.splice(titleIdx, 1);
    modified = true;

    // If nothing else remains, remove the whole statement
    if (arg.properties.length === 0) {
      // Walk up to the enclosing ExpressionStatement (if any) and remove it
      let parent = path.parent;
      while (parent && parent.node.type !== "ExpressionStatement" && parent.node.type !== "Program") {
        parent = parent.parent;
      }
      if (parent && parent.node.type === "ExpressionStatement") {
        j(parent).remove();
      }
    }
  });

  if (!modified) return null;
  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
