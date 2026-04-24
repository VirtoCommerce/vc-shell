import { parse as parseSFC } from "@vue/compiler-sfc";
import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Convert `<VcBlade v-loading="X">` to `<VcBlade :loading="X">`.
 *
 * Details/list blades should use the VcBlade built-in `:loading` prop instead
 * of the global `v-loading` directive. The prop renders the blade's built-in
 * skeleton/spinner and coordinates with the form lifecycle; `v-loading` just
 * overlays a generic spinner.
 *
 * Only touches `<VcBlade>` opening tags — `v-loading` on other elements
 * (inner widgets, cards, sections) is left alone.
 *
 * If, after the rewrite, `v-loading` is no longer used anywhere in the
 * template, the `vLoading` specifier is also removed from the
 * `@vc-shell/framework/ui` import (best-effort cleanup).
 */

// Match a single <VcBlade ...> opening tag (self-closing allowed). Non-greedy
// [^>]* keeps each match confined to one tag.
const VCBLADE_TAG_RE = /<VcBlade(\s[^>]*?)?(\s*\/?)>/g;

// Match v-loading="...", v-loading:arg="...", v-loading.modifier="..." (quoted value only).
// Vue directive arguments (e.g. v-loading:1001) and modifiers are stripped —
// the :loading prop doesn't use them.
const V_LOADING_RE = /(\s)v-loading(?::[^\s="']+)?(?:\.[^\s="']+)*\s*=(["'])([^"']*)\2/;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  if (!fileInfo.path.endsWith(".vue")) return null;

  const { descriptor } = parseSFC(fileInfo.source, { filename: fileInfo.path });
  if (!descriptor.template) return null;

  const templateStart = descriptor.template.loc.start.offset;
  const templateEnd = descriptor.template.loc.end.offset;
  const template = descriptor.template.content;

  let changed = false;
  const newTemplate = template.replace(VCBLADE_TAG_RE, (match, attrs: string | undefined, selfClose: string) => {
    if (!attrs) return match;
    const replaced = attrs.replace(V_LOADING_RE, (_m, leading: string, quote: string, value: string) => {
      return `${leading}:loading=${quote}${value}${quote}`;
    });
    if (replaced === attrs) return match;
    changed = true;
    return `<VcBlade${replaced}${selfClose}>`;
  });

  // Splice the rewritten template back into the source (or keep original if no rewrite).
  let result = changed
    ? fileInfo.source.substring(0, templateStart) + newTemplate + fileInfo.source.substring(templateEnd)
    : fileInfo.source;

  // Cleanup: if the template does not use `v-loading` anywhere, drop the
  // orphaned `vLoading` specifier from the framework/ui import. This runs
  // even when no rewrite happened, so it cleans up files a previous migration
  // step already converted but left the orphan import behind.
  const templateForCheck = changed ? newTemplate : template;
  let importCleaned = false;

  if (!/v-loading\b/.test(templateForCheck)) {
    const { descriptor: after } = parseSFC(result, { filename: fileInfo.path });
    const scriptBlock = after.scriptSetup ?? after.script;
    if (scriptBlock) {
      const j = api.jscodeshift;
      const root = j(scriptBlock.content);
      let scriptChanged = false;

      root.find(j.ImportDeclaration).forEach((path) => {
        if (path.node.source.value !== "@vc-shell/framework/ui") return;
        const specs = path.node.specifiers || [];
        const filtered = specs.filter(
          (s) => !(s.type === "ImportSpecifier" && s.imported.type === "Identifier" && s.imported.name === "vLoading"),
        );
        if (filtered.length !== specs.length) {
          if (filtered.length === 0) {
            j(path).remove();
          } else {
            path.node.specifiers = filtered;
          }
          scriptChanged = true;
          importCleaned = true;
        }
      });

      if (scriptChanged) {
        const newScript = root.toSource();
        result =
          result.substring(0, scriptBlock.loc.start.offset) + newScript + result.substring(scriptBlock.loc.end.offset);
      }
    }
  }

  if (!changed && !importCleaned) return null;
  return result;
};

export default transform;
export const parser = "tsx";
