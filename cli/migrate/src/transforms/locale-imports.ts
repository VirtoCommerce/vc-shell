import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const OLD_PREFIX = "@vc-shell/framework/dist/locales/";

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;

  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (typeof source !== "string") return;
    if (!source.startsWith(OLD_PREFIX)) return;

    const filename = source.slice(OLD_PREFIX.length);
    const localeName = filename.replace(/\.json$/, "");
    path.node.source.value = `@vc-shell/framework/locales/${localeName}`;
    modified = true;
  });

  if (!modified) return null;
  return root.toSource();
};

export default transform;
export const parser = "tsx";
