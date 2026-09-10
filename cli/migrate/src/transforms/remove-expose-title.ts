import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Remove `title` from `exposeToChildren({...})` calls.
 *
 * v2 exposeToChildren is function-only. A reactive `title` trips the
 * `(...args: any[]) => any` signature check, and the blade chrome no longer reads it.
 *
 * Removes the whole call when `title` is its only property, otherwise just the key.
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
