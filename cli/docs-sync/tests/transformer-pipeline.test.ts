import { describe, it, expect } from "vitest";
import { runTransformPipeline } from "../src/transformer/pipeline.js";

describe("runTransformPipeline", () => {
  it("runs all transformers in order", () => {
    const body = [
      `# Foo`,
      ``,
      `<!-- internal:start -->`,
      `secret`,
      `<!-- internal:end -->`,
      ``,
      `::storybook id="atoms-vc-button--default"`,
    ].join("\n");

    const out = runTransformPipeline(body, {
      sourceRelPath: "framework/x.docs.md",
      sourcePath: "framework/x.docs.md",
      targetPath: "components/misc/x.md",
      storybookUrl: "https://example.com",
      knownStoryIds: new Set(["atoms-vc-button--default"]),
      resolveTarget: () => null,
    });

    // header prepended
    expect(out.startsWith("<!--")).toBe(true);
    // internal stripped
    expect(out).not.toContain("secret");
    // storybook expanded
    expect(out).toContain("vc-storybook-embed");
    // body still present
    expect(out).toContain("# Foo");
  });
});
