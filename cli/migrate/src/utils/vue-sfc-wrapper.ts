import { parse as parseSFC } from "@vue/compiler-sfc";
import type { Transform } from "../transforms/types.js";

/**
 * Wraps a script-only jscodeshift transform to handle Vue SFC files.
 * For .ts files: passes through directly.
 * For .vue files: extracts <script setup> or <script> content, transforms it,
 * then reconstructs the SFC using offset-based splicing.
 */
export function wrapForSFC(coreTransform: Transform): Transform {
  return (fileInfo, api, options) => {
    if (!fileInfo.path.endsWith(".vue")) {
      return coreTransform(fileInfo, api, options);
    }
    const { descriptor } = parseSFC(fileInfo.source, { filename: fileInfo.path });
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
    if (!scriptBlock) return null;

    const scriptResult = coreTransform(
      { ...fileInfo, source: scriptBlock.content },
      api,
      options,
    );
    if (scriptResult == null) return null;

    // Offset-based splicing — safe with $ characters
    const start = scriptBlock.loc.start.offset;
    const end = scriptBlock.loc.end.offset;
    return (
      fileInfo.source.substring(0, start) +
      scriptResult +
      fileInfo.source.substring(end)
    );
  };
}

/**
 * Wraps a template-only transform for Vue SFC files.
 * Returns null for non-.vue files.
 */
export function wrapForSFCTemplate(
  templateTransform: (template: string, filePath: string) => { content: string; changed: boolean },
): Transform {
  return (fileInfo, _api, _options) => {
    if (!fileInfo.path.endsWith(".vue")) return null;
    const { descriptor } = parseSFC(fileInfo.source, { filename: fileInfo.path });
    if (!descriptor.template) return null;

    const result = templateTransform(descriptor.template.content, fileInfo.path);
    if (!result.changed) return null;

    const start = descriptor.template.loc.start.offset;
    const end = descriptor.template.loc.end.offset;
    return (
      fileInfo.source.substring(0, start) +
      result.content +
      fileInfo.source.substring(end)
    );
  };
}

/**
 * Wraps both a script transform and a template transform for Vue SFC files.
 * Script transform runs first, then template transform on the (possibly modified) SFC.
 */
export function wrapForSFCBoth(
  scriptTransform: Transform,
  templateTransform: (template: string, filePath: string) => { content: string; changed: boolean },
): Transform {
  return (fileInfo, api, options) => {
    let afterScript: string | null = null;
    try {
      afterScript = wrapForSFC(scriptTransform)(fileInfo, api, options);
    } catch (err) {
      api.report(
        `${fileInfo.path}: Script transform failed (${err instanceof Error ? err.message : String(err)}), ` +
        `attempting template-only transform`
      );
    }
    const source = afterScript ?? fileInfo.source;
    const afterTemplate = wrapForSFCTemplate(templateTransform)(
      { ...fileInfo, source },
      api,
      options,
    );
    return afterTemplate ?? afterScript;
  };
}
