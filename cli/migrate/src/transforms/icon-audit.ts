import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const ICON_SUGGESTIONS: Record<string, string> = {
  "fa-check": "check (Material Symbols)",
  "fa-times": "close (Material Symbols)",
  "fa-plus": "add (Material Symbols)",
  "fa-edit": "edit (Material Symbols)",
  "fa-trash": "delete (Material Symbols)",
  "fa-trash-alt": "delete (Material Symbols)",
  "fa-search": "search (Material Symbols)",
  "fa-save": "save (Material Symbols)",
  "fa-cog": "settings (Material Symbols)",
  "fa-user": "person (Material Symbols)",
  "fa-download": "download (Material Symbols)",
  "fa-upload": "upload (Material Symbols)",
  "fa-chevron-right": "chevron_right (Material Symbols)",
  "fa-chevron-left": "chevron_left (Material Symbols)",
  "fa-arrow-left": "arrow_back (Material Symbols)",
};

const FA_PATTERN = /\b(?:fas?|far|fal|fab)\s+(fa-[\w-]+)/g;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const text = fileInfo.source;
  FA_PATTERN.lastIndex = 0;
  const icons: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = FA_PATTERN.exec(text)) !== null) {
    icons.push(match[1]);
  }
  if (icons.length > 0) {
    for (const icon of icons) {
      const suggestion = ICON_SUGGESTIONS[icon];
      const hint = suggestion ? ` → suggested: ${suggestion}` : "";
      api.report(`${fileInfo.path}: ${icon}${hint}`);
    }
  }
  return null; // Never modify
};

export default transform;
export const parser = "tsx";
