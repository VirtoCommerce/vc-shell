import { wrapForSFCTemplate } from "../utils/vue-sfc-wrapper.js";
import { removeAttributesFromTag } from "../utils/template-transform.js";
import type { Transform } from "./types.js";

const ATTR_PATTERNS = [/\s+:?use-container(?:="[^"]*")?/g, /\s+:?useContainer(?:="[^"]*")?/g];

function templateTransform(template: string, _filePath: string): { content: string; changed: boolean } {
  let modified = removeAttributesFromTag(template, "VcIcon", ATTR_PATTERNS);
  modified = removeAttributesFromTag(modified, "vc-icon", ATTR_PATTERNS);
  return { content: modified, changed: modified !== template };
}

export default wrapForSFCTemplate(templateTransform) as Transform;
export const parser = "tsx";
