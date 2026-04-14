import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Detect non-lucide icons (material-, bi-, fa-) and report them for AI migration.
 * Does NOT suggest replacements — the AI migration-agent picks the best lucide
 * equivalent based on context and icon semantics.
 */

const FA_PATTERN = /\b(?:fas?|far|fal|fab)\s+(fa-[\w-]+)/g;
const MATERIAL_PATTERN = /["'](material-[\w-]+)["']/g;
const BI_PATTERN = /["'](bi-[\w-]+)["']/g;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const text = fileInfo.source;
  const icons: Array<{ icon: string; pack: string }> = [];

  FA_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FA_PATTERN.exec(text)) !== null) {
    icons.push({ icon: match[1], pack: "Font Awesome" });
  }

  MATERIAL_PATTERN.lastIndex = 0;
  while ((match = MATERIAL_PATTERN.exec(text)) !== null) {
    icons.push({ icon: match[1], pack: "Material" });
  }

  BI_PATTERN.lastIndex = 0;
  while ((match = BI_PATTERN.exec(text)) !== null) {
    icons.push({ icon: match[1], pack: "Bootstrap" });
  }

  if (icons.length > 0) {
    for (const { icon, pack } of icons) {
      api.report(`${fileInfo.path}: [${pack}] ${icon} → replace with lucide- equivalent`);
    }
  }

  return null; // diagnostic-only — never modify
};

export default transform;
export const parser = "tsx";
