import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Remove blade lifecycle events from ALL .vue files:
 *   @parent:call, @close:blade, @collapse:blade, @expand:blade
 *
 * Also removes the corresponding Emits interface and defineEmits call
 * if they only contained blade events.
 */

const BLADE_EVENT_PATTERNS = [
  /\s*@parent:call="[^"]*"\n?/g,
  /\s*@close:blade="[^"]*"\n?/g,
  /\s*@collapse:blade="[^"]*"\n?/g,
  /\s*@expand:blade="[^"]*"\n?/g,
];

const BLADE_ONLY_EMITS_BLOCK =
  /export\s+interface\s+Emits\s*\{[^}]*?\(event:\s*"(?:parent:call|close:blade|collapse:blade|expand:blade)"[^}]*?\}\s*\n?/gs;

const DEFINE_EMITS_PATTERN = /defineEmits<Emits>\(\);\s*\n?/g;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  if (!fileInfo.path.endsWith(".vue")) return null;

  let source = fileInfo.source;
  let modified = false;

  for (const pattern of BLADE_EVENT_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) {
      pattern.lastIndex = 0;
      source = source.replace(pattern, "");
      modified = true;
    }
  }

  BLADE_ONLY_EMITS_BLOCK.lastIndex = 0;
  const emitsMatch = BLADE_ONLY_EMITS_BLOCK.exec(source);
  if (emitsMatch) {
    const block = emitsMatch[0];
    const eventLines = block.match(/\(event:\s*"[^"]+"/g) || [];
    const bladeEvents = ["parent:call", "close:blade", "collapse:blade", "expand:blade"];
    const allBlade = eventLines.every((line) => bladeEvents.some((e) => line.includes(`"${e}"`)));

    if (allBlade) {
      BLADE_ONLY_EMITS_BLOCK.lastIndex = 0;
      source = source.replace(BLADE_ONLY_EMITS_BLOCK, "");
      source = source.replace(DEFINE_EMITS_PATTERN, "");
      modified = true;
    }
  }

  if (!modified) return null;

  api.report(`${fileInfo.path}: Removed blade lifecycle events`);
  return source;
};

export default transform;
export const parser = "tsx";
