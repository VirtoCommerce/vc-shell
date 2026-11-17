import { createElement as h, Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CodeOrSourceMdx,
  Controls,
  Description,
  Heading,
  Markdown,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";
import { addons } from "storybook/preview-api";
import { SELECT_STORY } from "storybook/internal/core-events";
import { buildDocsPages, guideKeyForStories, resolveGuideLink, type LinkContext } from "./guide-links";

/**
 * Autodocs page with the component's `*.docs.md` guide appended.
 *
 * `*.docs.md` is the source of truth for vc-docs and for the vc-app skill. Showing it here
 * means the Storybook docs page, the public docs and the AI knowledge base read the same text,
 * instead of a second, hand-maintained description drifting next to it.
 */

// Two constraints pull in opposite directions:
// - The table of contents is built once, ~100 ms after a docs page mounts, so a guide that
//   arrives later is missing from it. The guides must already be in memory.
// - preview.ts runs in every story iframe, and a docs page with `inline: false` (VcDataTable)
//   opens one iframe per story. Bundling the guides into preview made that page parse them
//   14+ times and freeze.
// So the guides are a separate chunk, prefetched as soon as preview loads, but only in the
// top-level preview frame. Nested story iframes never request it.
let loaded: LinkContext | undefined;
let loading: Promise<LinkContext> | undefined;

async function fetchDocsEntries() {
  try {
    // index.json sits next to iframe.html, in dev and in the static build.
    const res = await fetch(new URL("index.json", window.location.href));
    const index = (await res.json()) as { entries: Record<string, { id: string; type: string; importPath: string }> };
    return Object.values(index.entries);
  } catch {
    return []; // Without it, cross-links fall back to the docs site.
  }
}

function loadContext(): Promise<LinkContext> {
  loading ??= Promise.all([import("./docs-guides"), fetchDocsEntries()]).then(([{ guides }, entries]) => {
    loaded = { guides, docsPages: buildDocsPages(guides, entries) };
    return loaded;
  });
  return loading;
}

const isTopLevelPreview = typeof window !== "undefined" && (window === window.top || window.parent === window.top);
// Story tests (Vitest browser mode) also run one level deep and never show a docs page.
if (isTopLevelPreview && !import.meta.env.VITEST) void loadContext();

const GUIDE_ID = "usage-guide";

/**
 * mkdocs admonitions (`!!! tip "Title"`) become a GitHub-style alert quote (`> [!TIP] Title`),
 * which GuideBlockquote draws as a callout. The body is either indented by four spaces (mkdocs)
 * or, in some guides, the unindented paragraph right below.
 */
export function admonitionsToQuotes(markdown: string): string {
  const out: string[] = [];
  const lines = markdown.split("\n");
  let i = 0;
  let fence = false;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const head = fence ? null : /^(!!!|\?\?\?\+?)\s*(\w+)(?:\s+"([^"]*)")?\s*$/.exec(line);
    if (!head) {
      out.push(line);
      i++;
      continue;
    }
    out.push(`> [!${head[2].toUpperCase()}] ${head[3] ?? ""}`.trimEnd(), ">");
    i++;
    const indented = /^( {4}|\t)/.test(lines[i] ?? "");
    while (i < lines.length) {
      const body = lines[i];
      if (indented) {
        // Blank lines stay inside while the next text line is still indented.
        if (body.trim() === "" && /^( {4}|\t)/.test(lines[i + 1] ?? "")) out.push(">");
        else if (/^( {4}|\t)/.test(body)) out.push(`> ${body.replace(/^( {4}|\t)/, "")}`);
        else break;
      } else if (body.trim() !== "") out.push(`> ${body}`);
      else break;
      i++;
    }
  }
  return out.join("\n");
}

/** Strips or converts what only vc-docs understands: frontmatter, the H1 (the page has a title), `::storybook` embeds, admonitions. */
export function prepareGuide(markdown: string): string {
  return admonitionsToQuotes(markdown)
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^#\s+.*\n/m, "")
    .replace(/^::storybook\b.*$\n?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function useGuide(): { key: string; text: string; ctx: LinkContext } | undefined {
  const meta = useOf("meta", ["meta"]);
  const fileName = meta.preparedMeta.parameters?.fileName as string | undefined;
  // Usually already loaded by the prefetch above, so the guide is part of the first render.
  const [ctx, setCtx] = useState(loaded);

  useEffect(() => {
    if (ctx) return;
    let alive = true;
    loadContext().then((c) => alive && setCtx(c));
    return () => {
      alive = false;
    };
  }, [ctx]);

  if (!ctx || !fileName) return undefined;
  const key = guideKeyForStories(ctx.guides, fileName);
  return key ? { key, text: prepareGuide(ctx.guides[key]), ctx } : undefined;
}

// ```mermaid blocks: vc-docs draws them, so the guide must too. Mermaid is large; it loads only
// on a page that has a diagram.
let mermaid: Promise<typeof import("mermaid").default> | undefined;
let diagramCount = 0;

function loadMermaid() {
  mermaid ??= import("mermaid").then(({ default: m }) => {
    m.initialize({ startOnLoad: false, securityLevel: "strict" });
    return m;
  });
  return mermaid;
}

function MermaidDiagram({ source }: { source: string }) {
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    let alive = true;
    loadMermaid()
      .then((m) => m.render(`vc-docs-mermaid-${++diagramCount}`, source))
      .then((result) => alive && setSvg(result.svg))
      .catch(() => undefined); // invalid diagram: its source stays on the page
    return () => {
      alive = false;
    };
  }, [source]);

  return svg
    ? h("div", { className: "vc-docs-mermaid", dangerouslySetInnerHTML: { __html: svg } })
    : h("pre", null, h("code", null, source));
}

/** A fenced block: a diagram for ```mermaid, Storybook's code block for everything else. */
function GuidePre({ children, ...props }: { children?: ReactNode }) {
  const code = children as { props?: { className?: string; children?: unknown } } | undefined;
  if (code?.props?.className?.split(" ").includes("lang-mermaid") && typeof code.props.children === "string") {
    return h(MermaidDiagram, { source: code.props.children });
  }
  return h("pre", props, children);
}

// Callout colours of the docs site (mkdocs material).
const CALLOUT_COLORS: Record<string, string> = {
  note: "#448aff",
  info: "#00b8d4",
  tip: "#00bfa5",
  success: "#00c853",
  question: "#64dd17",
  warning: "#ff9100",
  caution: "#ff9100",
  danger: "#ff1744",
  error: "#ff1744",
  example: "#7c4dff",
  quote: "#9e9e9e",
};

type Element = { props?: { children?: ReactNode } };

/** `> [!TIP] Title` quotes become callouts; other quotes stay quotes. */
function GuideBlockquote({ children, ...props }: { children?: ReactNode }) {
  const items = (Array.isArray(children) ? children : [children]) as unknown[];
  const first = items[0] as Element | undefined;
  const text = first?.props?.children;
  const lead = typeof text === "string" ? text : Array.isArray(text) && typeof text[0] === "string" ? text[0] : "";
  const alert = /^\[!(\w+)\]\s*(.*)$/.exec(lead);
  if (!alert) return h("blockquote", props, children);

  const kind = alert[1].toLowerCase();
  const color = CALLOUT_COLORS[kind] ?? CALLOUT_COLORS.note;
  const title = alert[2] || kind[0].toUpperCase() + kind.slice(1);
  return h(
    "div",
    {
      className: `vc-docs-callout vc-docs-callout--${kind}`,
      role: "note",
      style: {
        margin: "16px 0",
        padding: "0 16px 4px",
        borderInlineStart: `4px solid ${color}`,
        borderRadius: 4,
        background: `${color}14`,
        boxShadow: `0 0 0 1px ${color}33`,
      },
    },
    h(
      "p",
      {
        style: {
          margin: "0 -16px 8px",
          padding: "8px 16px",
          fontWeight: 700,
          background: `${color}1f`,
          color: "inherit",
        },
      },
      title,
    ),
    ...items.slice(1),
  );
}

/** Links inside a guide: Storybook pages in place, the docs site and the web in a new tab. */
function guideLink(fromKey: string, ctx: LinkContext) {
  return function GuideLink({ href, children }: { href?: string; children?: ReactNode }) {
    const target = resolveGuideLink(href, fromKey, ctx);
    switch (target.kind) {
      case "anchor":
        return h("a", { href: target.href }, children);
      case "external":
        return h("a", { href: target.href, target: "_blank", rel: "noopener noreferrer" }, children);
      case "storybook":
        return h(
          "a",
          {
            href: target.href,
            target: "_top",
            onClick: (event: MouseEvent) => {
              // Plain click: switch pages inside Storybook. Modified click: let the browser open a tab.
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              addons.getChannel().emit(SELECT_STORY, { storyId: target.storyId, viewMode: "docs" });
            },
          },
          children,
        );
      default:
        return h(Fragment, null, children);
    }
  };
}

export function DocsPage() {
  const guide = useGuide();
  const options = useMemo(
    () =>
      guide
        ? {
            forceBlock: true,
            // Markdown spreads `options` after its defaults, so this list replaces them: keep its code block.
            overrides: {
              a: { component: guideLink(guide.key, guide.ctx) },
              pre: GuidePre,
              code: CodeOrSourceMdx,
              blockquote: GuideBlockquote,
            },
          }
        : undefined,
    [guide?.key, guide?.ctx],
  );

  return h(
    Fragment,
    null,
    h(Title),
    h(Subtitle),
    h(Description),
    guide
      ? h(
          "p",
          { className: "vc-docs-guide-link" },
          h("a", { href: `#${GUIDE_ID}` }, "Usage guide"),
          ": when to use it, recipes, common mistakes",
        )
      : null,
    h(Primary),
    h(Controls),
    h(Stories),
    guide
      ? h(
          "section",
          { className: "vc-docs-guide" },
          h(Heading, null, "Usage guide"),
          h(Markdown, { options }, guide.text),
        )
      : null,
  );
}
