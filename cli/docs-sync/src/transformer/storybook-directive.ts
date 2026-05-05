const DIRECTIVE_RE = /^::storybook\s+([^\n]+)$/gm;
const ATTR_RE = /(\w+)="([^"]*)"/g;

export interface DirectiveContext {
  storybookUrl: string;
  knownIds: Set<string>;
  sourcePath: string;
}

export class UnknownStoryError extends Error {
  constructor(
    public readonly id: string,
    public readonly source: string,
  ) {
    super(`[${source}] unknown storybook id: "${id}"`);
    this.name = "UnknownStoryError";
  }
}

export function expandStorybookDirectives(body: string, ctx: DirectiveContext): string {
  return body.replace(DIRECTIVE_RE, (_match, attrsStr: string) => {
    const attrs = parseAttrs(attrsStr);
    const id = attrs.id;
    if (!id) throw new Error(`[${ctx.sourcePath}] ::storybook missing id attribute`);
    if (!ctx.knownIds.has(id)) throw new UnknownStoryError(id, ctx.sourcePath);

    const height = parseInt(attrs.height ?? "400", 10);
    const theme = attrs.theme;
    const globals = theme && theme !== "auto" ? `&globals=theme:${theme}` : "";

    const iframeSrc = `${ctx.storybookUrl}/iframe.html?id=${id}&viewMode=story${globals}`;
    const linkHref = `${ctx.storybookUrl}/?path=/story/${id}`;
    const titleText = attrs.title ?? id;

    return [
      `<div class="vc-storybook-embed" style="--height: ${height}px">`,
      `  <iframe`,
      `    src="${iframeSrc}"`,
      `    loading="lazy"`,
      `    title="${titleText}"`,
      `  ></iframe>`,
      `  <a href="${linkHref}" target="_blank" rel="noopener">Open in Storybook ↗</a>`,
      `</div>`,
    ].join("\n");
  });
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of s.matchAll(ATTR_RE)) {
    out[match[1]] = match[2];
  }
  return out;
}
