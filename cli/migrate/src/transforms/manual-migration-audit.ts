import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /\buseExternalWidgets\b/,
    message: "useExternalWidgets is removed. Replace with module-specific widget composable (e.g. useOfferWidgets, useOrderWidgets).",
  },
  {
    pattern: /\bimport\s+moment\b/,
    message: "moment.js is deprecated. Replace with formatDateWithPattern from @vc-shell/framework.",
  },
  {
    pattern: /\buseFunctions\b/,
    message: "useFunctions() is removed. Replace debounce with useDebounceFn from @vueuse/core.",
  },
  {
    pattern: /\bcloseBlade\s*\(/,
    message: "closeBlade() is removed. Use closeSelf() from useBlade() instead.",
  },
];

function checkDoubleUseBlade(source: string, filePath: string, api: API): void {
  const matches = source.match(/\buseBlade\s*\(\s*\)/g);
  if (matches && matches.length > 1) {
    api.report(`${filePath}: Multiple useBlade() calls detected — consolidate into one destructuring.`);
  }
}

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const source = fileInfo.source;

  for (const { pattern, message } of PATTERNS) {
    if (pattern.test(source)) {
      api.report(`${fileInfo.path}: ${message}`);
    }
  }

  checkDoubleUseBlade(source, fileInfo.path, api);

  // Diagnostic only — never modify files
  return null;
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
