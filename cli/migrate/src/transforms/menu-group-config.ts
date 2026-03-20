import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

const DEPRECATED_PROPS = ["groupIcon", "inGroupPriority"];
const GROUP_STRING_PATTERN = /\bgroup\s*:\s*["'`]/;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const text = fileInfo.source;
  const issues: string[] = [];

  for (const prop of DEPRECATED_PROPS) {
    if (text.includes(prop)) {
      issues.push(prop);
    }
  }

  if (GROUP_STRING_PATTERN.test(text)) {
    issues.push("group (string)");
  }

  if (issues.length > 0) {
    api.report(
      `${fileInfo.path}: Found deprecated menu properties: ${issues.join(", ")}. ` +
      `Migrate to groupConfig: { id, title, icon, priority, permissions }.`,
    );
  }

  return null; // Never modify
};

export default transform;
export const parser = "tsx";
