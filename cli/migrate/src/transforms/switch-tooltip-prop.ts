import { wrapForSFCTemplate } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

function templateTransform(template: string, _filePath: string): { content: string; changed: boolean } {
  const tagRe = /(<(?:VcSwitch|vc-switch)\b[^>]*?)((?::)?tooltip=)/gs;
  const modified = template.replace(tagRe, (_match, before, attr) => {
    const replacement = attr.startsWith(":") ? ":hint=" : "hint=";
    return before + replacement;
  });
  return { content: modified, changed: modified !== template };
}

export default wrapForSFCTemplate(templateTransform) as Transform;
export const parser = "tsx";
