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

    // Split off any #fragment / ?query so the bare path can be resolved against
    // the source-to-target map; re-append it to the rewritten output verbatim.
    const suffixMatch = href.match(/[#?].*$/);
    const suffix = suffixMatch ? suffixMatch[0] : "";
    const bareHref = suffix ? href.slice(0, href.length - suffix.length) : href;
    if (!bareHref) return full; // pure fragment/query with no path

    const resolved = ctx.resolveTarget(ctx.sourcePath, bareHref);
    if (!resolved) return full;

    // Compute relative path from current target to the resolved target.
    const fromDir = path.posix.dirname(ctx.targetPath);
    const rel = path.posix.relative(fromDir, resolved);
    const normalized = rel.startsWith(".") ? rel : `./${rel}`;
    return `[${text}](${normalized}${suffix})`;
  });
}
