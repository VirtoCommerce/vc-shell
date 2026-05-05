import { describe, it, expect } from "vitest";
import { runLint } from "../src/lint/runner.js";

describe("runLint", () => {
  it("returns errors for files without frontmatter", async () => {
    const result = await runLint({
      sources: [{ absPath: "/abs/x.docs.md", relPath: "framework/x.docs.md", raw: "# no frontmatter" }],
      knownStoryIds: new Set(),
    });
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].rule).toBe("frontmatter-required");
  });

  it("passes for valid files", async () => {
    const valid = `---\ntitle: Foo\ncategory: components\ngroup: misc\n---\n\n# Foo\n`;
    const result = await runLint({
      sources: [{ absPath: "/abs/x.docs.md", relPath: "framework/x.docs.md", raw: valid }],
      knownStoryIds: new Set(),
    });
    expect(result.errors).toEqual([]);
  });

  it("flags unknown ::storybook id", async () => {
    const raw = `---\ntitle: X\ncategory: components\ngroup: misc\n---\n\n::storybook id="bogus"\n`;
    const result = await runLint({
      sources: [{ absPath: "/x.docs.md", relPath: "x.docs.md", raw }],
      knownStoryIds: new Set(["real-id"]),
    });
    expect(result.errors.find((e) => e.rule === "storybook-id-valid")).toBeTruthy();
  });
});
