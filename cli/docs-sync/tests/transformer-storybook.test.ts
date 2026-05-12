import { describe, it, expect } from "vitest";
import { expandStorybookDirectives } from "../src/transformer/storybook-directive.js";

const STORY_IDS = new Set(["organisms-vc-data-table--default", "organisms-vc-data-table--with-sorting"]);

describe("expandStorybookDirectives", () => {
  it("expands a basic directive", () => {
    const out = expandStorybookDirectives(`::storybook id="organisms-vc-data-table--default"`, {
      storybookUrl: "https://example.com",
      knownIds: STORY_IDS,
      sourcePath: "x.docs.md",
    });
    expect(out).toContain('<div class="vc-storybook-embed"');
    expect(out).toContain('src="https://example.com/iframe.html?id=organisms-vc-data-table--default&viewMode=story"');
    expect(out).toContain('href="https://example.com/?path=/story/organisms-vc-data-table--default"');
  });

  it("respects height parameter", () => {
    const out = expandStorybookDirectives(`::storybook id="organisms-vc-data-table--default" height="600"`, {
      storybookUrl: "https://example.com",
      knownIds: STORY_IDS,
      sourcePath: "x.docs.md",
    });
    expect(out).toContain("--height: 600px");
  });

  it("defaults height to 400px", () => {
    const out = expandStorybookDirectives(`::storybook id="organisms-vc-data-table--default"`, {
      storybookUrl: "https://example.com",
      knownIds: STORY_IDS,
      sourcePath: "x.docs.md",
    });
    expect(out).toContain("--height: 400px");
  });

  it("appends theme global when theme=dark", () => {
    const out = expandStorybookDirectives(`::storybook id="organisms-vc-data-table--default" theme="dark"`, {
      storybookUrl: "https://example.com",
      knownIds: STORY_IDS,
      sourcePath: "x.docs.md",
    });
    expect(out).toContain("globals=theme:dark");
  });

  it("throws on unknown story id", () => {
    expect(() =>
      expandStorybookDirectives(`::storybook id="bogus--id"`, {
        storybookUrl: "https://example.com",
        knownIds: STORY_IDS,
        sourcePath: "x.docs.md",
      }),
    ).toThrow(/unknown storybook id/i);
  });
});
