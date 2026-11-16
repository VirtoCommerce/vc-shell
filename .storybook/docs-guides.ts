// Every framework guide (`*.docs.md`) as raw text, keyed by path relative to `.storybook/`.
// Component guides are rendered on docs pages; the rest are needed to turn cross-links
// into docs-site URLs. Loaded through a dynamic import from docs-page.ts, so nested story
// iframes never pay for it.
export const guides = import.meta.glob("../framework/**/*.docs.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
