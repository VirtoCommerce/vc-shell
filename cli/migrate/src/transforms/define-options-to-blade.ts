import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const BLADE_FIELDS = ["url", "isWorkspace", "menuItem", "routable", "permissions"];

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  if (!fileInfo.path.endsWith(".vue")) return null;

  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const calls = root.find(j.CallExpression, {
    callee: { name: "defineOptions" },
  });

  if (calls.size() === 0) return null;

  let modified = false;

  calls.forEach((path) => {
    const args = path.node.arguments;
    if (args.length !== 1 || args[0].type !== "ObjectExpression") return;

    const obj = args[0];

    const hasBlade = obj.properties.some(
      (p: any) =>
        p.type === "ObjectProperty" &&
        p.key.type === "Identifier" &&
        BLADE_FIELDS.includes(p.key.name),
    );

    if (!hasBlade) return;

    // Remove notifyType property
    obj.properties = obj.properties.filter(
      (p: any) =>
        !(p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "notifyType"),
    );

    // Rename defineOptions → defineBlade
    if (path.node.callee.type === "Identifier") {
      path.node.callee.name = "defineBlade";
    }

    modified = true;
  });

  if (!modified) return null;
  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
