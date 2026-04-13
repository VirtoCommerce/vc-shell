import jscodeshift from "jscodeshift";
import { parse as parseSFC } from "@vue/compiler-sfc";
import { deduplicateImportSpecifiers } from "./utils/import-dedup.js";

/**
 * Collapse multi-line import statements into single lines so the
 * text-based dedup can process them. Only affects import blocks.
 */
export function collapseMultiLineImports(script: string): string {
  return script.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/gs, (match) =>
    match.replace(/\s*\n\s*/g, " "),
  );
}

/**
 * Pre-dedup source before passing to transform.
 * For .vue files: extract script block, dedup, splice back.
 * For .ts files: dedup directly.
 */
export function preDedupSource(source: string, filePath: string, j: any): string {
  if (filePath.endsWith(".vue")) {
    const { descriptor } = parseSFC(source, { filename: filePath });
    const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
    if (!scriptBlock) return source;

    // Collapse multi-line imports so text-based dedup can handle them
    const collapsed = collapseMultiLineImports(scriptBlock.content);
    const deduped = deduplicateImportSpecifiers(collapsed, j);
    if (deduped === scriptBlock.content) return source;

    const start = scriptBlock.loc.start.offset;
    const end = scriptBlock.loc.end.offset;
    return source.substring(0, start) + deduped + source.substring(end);
  }
  return deduplicateImportSpecifiers(source, j);
}

export function parseValidate(filePath: string, source: string, parser: string): string | null {
  try {
    if (filePath.endsWith(".vue")) {
      const { descriptor, errors } = parseSFC(source, { filename: filePath });
      if (errors.length > 0) {
        return `SFC parse error: ${errors[0].message}`;
      }
      const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
      if (scriptBlock) {
        jscodeshift.withParser(parser)(scriptBlock.content);
      }
    } else {
      jscodeshift.withParser(parser)(source);
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}
