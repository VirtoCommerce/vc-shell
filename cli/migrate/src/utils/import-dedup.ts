import type { JSCodeshift } from "jscodeshift";

/** Regex that matches a full import statement (possibly spanning multiple lines via line continuation). */
const _IMPORT_LINE_RE = /^(\s*import\s+(?:[^'"]*?\s+from\s+)?['"][^'"]+['"]\s*;?\s*)$/;

/** Extracts the source module string from an import statement line. */
function extractSource(importLine: string): string | null {
  const m = importLine.match(/from\s+['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

/** Extracts named specifiers from `{ foo, bar as baz }` portion. Returns null if no named block. */
function extractNamedBlock(importLine: string): { before: string; inner: string; after: string } | null {
  const m = importLine.match(/^(import\s+(?:[^{]*?)?)\{([^}]*)\}([\s\S]*)$/);
  if (!m) return null;
  return { before: m[1], inner: m[2], after: m[3] };
}

/** Parses named specifiers string into array of trimmed specifier strings. */
function parseSpecifiers(inner: string): string[] {
  return inner
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Returns the local binding name for a specifier like "foo" or "foo as bar". */
function localName(spec: string): string {
  const asMatch = spec.match(/\bas\s+(\w+)$/);
  return asMatch ? asMatch[1] : spec.trim();
}

/**
 * Pure text/regex based deduplication of import specifiers.
 *
 * Handles two cases:
 * 1. Duplicate specifiers within a single import declaration.
 * 2. Multiple import declarations from the same source module — merges them
 *    into the first declaration and removes subsequent ones.
 *
 * Imports from different sources are left completely independent (even if they
 * bind the same local name, which is a real semantic conflict — not our problem).
 *
 * Returns the original source string unchanged if no modifications are needed.
 */
function textDedup(source: string): { result: string; modified: boolean } {
  const lines = source.split("\n");

  // Map: source-module → { lineIndex, specifiers[] }
  // We process line by line, tracking import declarations.
  // Multi-line imports (with line-continuation) are not supported here — they are
  // uncommon in generated transform output. We handle single-line imports only.

  interface ImportRecord {
    lineIndex: number;
    specifiers: string[]; // current deduplicated specifiers for this source
    originalLine: string;
    before: string; // text before `{`
    after: string; // text after `}`
    hasNamedBlock: boolean;
  }

  const bySource = new Map<string, ImportRecord>();
  const deletedLines = new Set<number>();
  const replacements = new Map<number, string>(); // line index → replacement text

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*import\s/.test(line)) continue;

    const src = extractSource(line);
    if (src === null) continue; // side-effect import or malformed

    const named = extractNamedBlock(line);

    if (!bySource.has(src)) {
      // First occurrence
      const record: ImportRecord = {
        lineIndex: i,
        specifiers: named ? parseSpecifiers(named.inner) : [],
        originalLine: line,
        before: named?.before ?? "",
        after: named?.after ?? "",
        hasNamedBlock: named !== null,
      };

      // Deduplicate within the first occurrence itself
      if (named) {
        const seen = new Set<string>();
        const deduped: string[] = [];
        for (const spec of record.specifiers) {
          const name = localName(spec);
          if (!seen.has(name)) {
            seen.add(name);
            deduped.push(spec);
          }
        }
        if (deduped.length !== record.specifiers.length) {
          record.specifiers = deduped;
          replacements.set(i, `${record.before}{ ${deduped.join(", ")} }${record.after}`);
        }
      }

      bySource.set(src, record);
    } else {
      // Duplicate source — merge into existing record
      const record = bySource.get(src)!;
      const existingNames = new Set(record.specifiers.map(localName));

      if (named) {
        const incoming = parseSpecifiers(named.inner);
        let added = false;
        for (const spec of incoming) {
          const name = localName(spec);
          if (!existingNames.has(name)) {
            existingNames.add(name);
            record.specifiers.push(spec);
            added = true;
          }
        }

        if (added || incoming.length > 0) {
          // Rebuild the first occurrence line with merged specifiers
          replacements.set(record.lineIndex, `${record.before}{ ${record.specifiers.join(", ")} }${record.after}`);
        }
      }

      // Delete this duplicate declaration line
      deletedLines.add(i);
    }
  }

  if (replacements.size === 0 && deletedLines.size === 0) {
    return { result: source, modified: false };
  }

  const resultLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (deletedLines.has(i)) continue;
    if (replacements.has(i)) {
      resultLines.push(replacements.get(i)!);
    } else {
      resultLines.push(lines[i]);
    }
  }

  return { result: resultLines.join("\n"), modified: true };
}

/**
 * Remove duplicate import specifiers within each ImportDeclaration,
 * and merge specifiers from duplicate ImportDeclarations with the same source.
 *
 * Must receive the same jscodeshift instance (with parser) that the transform used.
 *
 * Strategy:
 * - Phase 1: Pure text/regex deduplication (handles AST-unparseable duplicates).
 * - Phase 2: AST pass via jscodeshift for any remaining cross-declaration merges
 *   and to normalise output formatting when changes were made.
 */
export function deduplicateImportSpecifiers(source: string, j: JSCodeshift): string {
  // Phase 1: text-level dedup (handles syntax-invalid inputs that parsers reject)
  const { result: textResult, modified: textModified } = textDedup(source);

  if (!textModified) {
    // Source was already clean — return as-is (preserves exact formatting)
    return source;
  }

  // Phase 2: AST pass to merge any remaining same-source declarations and
  // deduplicate after merge (in case Phase 1 missed anything across non-adjacent lines)
  try {
    const root = j(textResult);
    let astModified = false;

    const bySource = new Map<string, any[]>();
    root.find(j.ImportDeclaration).forEach((path) => {
      const src = (path.node.source as any).value as string;
      if (!bySource.has(src)) bySource.set(src, []);
      bySource.get(src)!.push(path);
    });

    for (const [, paths] of bySource) {
      if (paths.length <= 1) continue;
      const target = paths[0];
      for (let i = 1; i < paths.length; i++) {
        const specs = paths[i].node.specifiers ?? [];
        target.node.specifiers = [...(target.node.specifiers ?? []), ...specs];
        j(paths[i]).remove();
        astModified = true;
      }
    }

    root.find(j.ImportDeclaration).forEach((path) => {
      const seen = new Set<string>();
      const original = path.node.specifiers?.length ?? 0;
      path.node.specifiers = path.node.specifiers?.filter((spec) => {
        if (spec.type !== "ImportSpecifier") return true;
        const name = spec.imported.type === "Identifier" ? spec.imported.name : "";
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
      if ((path.node.specifiers?.length ?? 0) < original) astModified = true;
    });

    return astModified ? root.toSource() : textResult;
  } catch {
    // If AST parse still fails for any reason, return the text-deduplicated result
    return textResult;
  }
}
