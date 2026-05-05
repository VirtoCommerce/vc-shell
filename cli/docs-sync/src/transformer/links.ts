import path from "node:path";

export interface LinkRewriteContext {
  sourcePath: string; // relative path of source *.docs.md inside vc-shell
  targetPath: string; // relative path of output inside vc-docs
  resolveTarget(sourcePath: string, href: string): string | null;
}

// Match [text](href) but NOT image refs (preceded by `!`) and NOT external URLs.
// Group 1: link text. Group 2: href.
const LINK_RE = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;

export function rewriteCrossDocLinks(body: string, ctx: LinkRewriteContext): string {
  return body.replace(LINK_RE, (full, text: string, href: string) => {
    if (/^[a-z]+:/i.test(href) || href.startsWith("//")) return full; // external
    if (href.startsWith("#")) return full; // anchor

    const resolved = ctx.resolveTarget(ctx.sourcePath, href);
    if (!resolved) return full;

    // Compute relative path from current target to the resolved target.
    const fromDir = path.posix.dirname(ctx.targetPath);
    const rel = path.posix.relative(fromDir, resolved);
    const normalized = rel.startsWith(".") ? rel : `./${rel}`;
    return `[${text}](${normalized})`;
  });
}
