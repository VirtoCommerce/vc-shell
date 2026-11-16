/**
 * Where a link inside a `*.docs.md` guide should go when the guide is shown in Storybook.
 *
 * The guides link to each other with repo-relative paths (`../vc-input/`, `../vc-select/vc-select.docs.md`)
 * that only make sense in the source tree. In Storybook:
 * - a guide that has stories opens its Storybook docs page;
 * - any other published guide opens on the docs site (the URL vc-docs gets from docs-sync);
 * - anything else is not a link.
 */

/** Public URL of the vc-docs section that docs-sync writes into. */
const DOCS_SITE = "https://docs.virtocommerce.org/platform/developer-guide/latest/custom-apps-development/vc-shell/";

export type Guides = Record<string, string>;

export interface LinkContext {
  guides: Guides;
  /** guide key (`../framework/.../x.docs.md`) -> Storybook docs entry id */
  docsPages: Map<string, string>;
}

export type ResolvedLink =
  | { kind: "anchor"; href: string }
  | { kind: "external"; href: string }
  | { kind: "storybook"; href: string; storyId: string }
  | { kind: "none" };

function normalize(path: string): string {
  const out: string[] = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length && out[out.length - 1] !== "..") out.pop();
      else out.push("..");
    } else out.push(part);
  }
  return out.join("/");
}

const dirOf = (key: string) => key.slice(0, key.lastIndexOf("/") + 1);
const baseOf = (file: string) => file.slice(file.lastIndexOf("/") + 1).split(".")[0];

/**
 * Guide for a stories file: same folder and base name, or the only guide in the folder.
 * Auth pages keep stories two levels below their guide (`LoginPage/components/login/`),
 * so up to two parent folders are tried before giving up.
 */
export function guideKeyForStories(guides: Guides, storiesPath: string): string | undefined {
  let dir = dirOf(storiesPath.replace(/^\.\//, "../"));
  const exact = `${dir}${baseOf(storiesPath)}.docs.md`;
  if (exact in guides) return exact;
  for (let level = 0; level < 3; level++) {
    const inDir = Object.keys(guides).filter((k) => k.startsWith(dir) && !k.slice(dir.length).includes("/"));
    if (inDir.length === 1) return inDir[0];
    if (inDir.length > 1) return undefined;
    dir = dirOf(dir.slice(0, -1));
  }
  return undefined;
}

/** Maps guides to the Storybook docs page that shows them, from Storybook's own index.json. */
export function buildDocsPages(
  guides: Guides,
  entries: { id: string; type: string; importPath: string; storiesImports?: string[] }[],
): Map<string, string> {
  const pages = new Map<string, string>();
  const exactMatch = new Set<string>();
  for (const entry of entries) {
    if (entry.type !== "docs") continue;
    const storiesPath = entry.storiesImports?.[0] ?? entry.importPath;
    const key = guideKeyForStories(guides, storiesPath);
    if (!key) continue;
    // vc-button-group.stories.ts also lands on vc-button.docs.md; VcButton's own page wins.
    const exact = baseOf(storiesPath) === baseOf(key);
    if (exact || !exactMatch.has(key)) pages.set(key, entry.id);
    if (exact) exactMatch.add(key);
  }
  return pages;
}

/** `../vc-input/`, `../vc-input`, `../vc-input/vc-input.docs.md` -> guide key. */
function resolveGuideKey(guides: Guides, fromKey: string, path: string): string | undefined {
  const joined = normalize(dirOf(fromKey) + path);
  const prefixed = joined.startsWith("..") ? joined : `../${joined}`;
  const bare = prefixed.replace(/\/$/, "");
  const name = bare.slice(bare.lastIndexOf("/") + 1);
  return [bare, `${bare}.docs.md`, `${bare}/${name}.docs.md`].find((candidate) => candidate in guides);
}

function frontmatter(raw: string): Record<string, string> {
  const block = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const fields: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^(\w+):\s*(.*?)\s*$/);
    if (m) fields[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

/** Same layout as docs-sync's computeTargetPath: `<category>/<group>/<slug>/`. */
function docsSiteUrl(key: string, raw: string): string | undefined {
  const fm = frontmatter(raw);
  if (!fm.category || !fm.group || fm.internal === "true") return undefined;
  const slug = fm.slug || key.slice(key.lastIndexOf("/") + 1).replace(/\.docs\.md$/, "");
  const parts = [fm.category, fm.group === "root" ? "" : fm.group, fm.placement === "index" ? "" : slug];
  return `${DOCS_SITE}${parts.filter(Boolean).join("/")}/`;
}

export function resolveGuideLink(href: string | undefined, fromKey: string, ctx: LinkContext): ResolvedLink {
  if (!href) return { kind: "none" };
  if (href.startsWith("#")) return { kind: "anchor", href };
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return { kind: "external", href };

  const [path, fragment = ""] = href.split("#");
  const key = resolveGuideKey(ctx.guides, fromKey, path);
  if (!key) return { kind: "none" };

  const storyId = ctx.docsPages.get(key);
  if (storyId) return { kind: "storybook", href: `./?path=/docs/${storyId}`, storyId };

  const site = docsSiteUrl(key, ctx.guides[key]);
  return site ? { kind: "external", href: fragment ? `${site}#${fragment}` : site } : { kind: "none" };
}
