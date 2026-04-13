import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  const hasReplaceWith = root.find(j.Identifier, { name: "replaceWith" }).size() > 0;
  if (!hasReplaceWith) return null;

  api.report(
    `${fileInfo.path}: replaceWith() semantics changed — now truly replaces (destroys old blade). ` +
      `If you relied on the old blade staying alive underneath, use coverWith() instead. See migration guide #12.`,
  );

  return null;
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
