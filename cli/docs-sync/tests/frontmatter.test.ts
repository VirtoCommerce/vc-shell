import { describe, it, expect } from "vitest";
import { validateFrontmatter } from "../src/parser/frontmatter.js";

describe("validateFrontmatter", () => {
  it("accepts a valid component frontmatter", () => {
    const result = validateFrontmatter({
      title: "VcDataTable",
      category: "components",
      group: "data-display",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional slug and internal", () => {
    const result = validateFrontmatter({
      title: "Foo",
      category: "components",
      group: "misc",
      slug: "vc-foo",
      internal: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = validateFrontmatter({
      category: "components",
      group: "misc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown category", () => {
    const result = validateFrontmatter({
      title: "X",
      category: "frobnitz",
      group: "misc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects group not allowed for the category", () => {
    const result = validateFrontmatter({
      title: "X",
      category: "components",
      group: "blade-navigation", // valid for composables, not components
    });
    expect(result.success).toBe(false);
  });
});
