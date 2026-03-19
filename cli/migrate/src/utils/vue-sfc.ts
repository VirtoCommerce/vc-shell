export interface ScriptBlock {
  type: "setup" | "options";
  lang: string | null;
  content: string;
  startLine: number;
  startOffset: number;
  endOffset: number;
}

const SCRIPT_RE = /<script(\s[^>]*)?>([^]*?)<\/script>/gi;
const SETUP_RE = /\bsetup\b/;
const LANG_RE = /\blang\s*=\s*["'](\w+)["']/;

export function extractScriptBlocks(
  source: string,
  warnings: string[] = [],
): ScriptBlock[] {
  const blocks: ScriptBlock[] = [];
  let match: RegExpExecArray | null;
  SCRIPT_RE.lastIndex = 0;

  while ((match = SCRIPT_RE.exec(source)) !== null) {
    const attrs = match[1] || "";
    const content = match[2];
    const langMatch = attrs.match(LANG_RE);
    const lang = langMatch ? langMatch[1] : null;

    if (lang !== "ts" && lang !== "typescript") {
      warnings.push(
        "Skipping script block: JavaScript script blocks not supported, manual migration needed",
      );
      continue;
    }

    const isSetup = SETUP_RE.test(attrs);
    const contentStart = match.index + match[0].indexOf(content);
    const startLine = source.substring(0, contentStart).split("\n").length;

    blocks.push({
      type: isSetup ? "setup" : "options",
      lang,
      content,
      startLine,
      startOffset: contentStart,
      endOffset: contentStart + content.length,
    });
  }

  return blocks;
}

export function writeBackScriptBlock(
  source: string,
  blockIndex: number,
  newContent: string,
): string {
  const blocks = extractScriptBlocks(source);
  if (blockIndex >= blocks.length) {
    throw new Error(
      "Block index " + blockIndex + " out of range (" + blocks.length + " blocks)",
    );
  }
  const block = blocks[blockIndex];
  return (
    source.substring(0, block.startOffset) +
    newContent +
    source.substring(block.endOffset)
  );
}
