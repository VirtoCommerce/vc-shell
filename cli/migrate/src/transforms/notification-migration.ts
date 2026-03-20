import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const RENAME_MAP: Record<string, string> = {
  useNotifications: "useBladeNotifications",
};

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  const renames: Array<{ old: string; new: string }> = [];
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
    if (RENAME_MAP[name]) {
      renames.push({ old: name, new: RENAME_MAP[name] });
    }
  });
  if (renames.length === 0) return null;

  for (const r of renames) {
    root.find(j.Identifier, { name: r.old }).forEach((path) => {
      path.node.name = r.new;
    });
  }

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
