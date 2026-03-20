import { wrapForSFCTemplate } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const VARIANT_MAP: Record<string, string> = {
  "light-danger": "danger",
  "info-dark": "info",
  "primary": "info",
};

function templateTransform(template: string, _filePath: string): { content: string; changed: boolean } {
  const tagRe = /(<(?:VcBanner|vc-banner)\b[^>]*?)(variant="(?:light-danger|info-dark|primary)")/gs;
  const modified = template.replace(tagRe, (_match, before, variantAttr) => {
    for (const [oldVariant, newVariant] of Object.entries(VARIANT_MAP)) {
      if (variantAttr === `variant="${oldVariant}"`) {
        return before + `variant="${newVariant}"`;
      }
    }
    return before + variantAttr;
  });
  return { content: modified, changed: modified !== template };
}

export default wrapForSFCTemplate(templateTransform) as Transform;
export const parser = "tsx";
