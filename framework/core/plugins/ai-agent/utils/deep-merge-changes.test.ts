import { describe, it, expect } from "vitest";
import { deepMergeChanges } from "./deep-merge-changes";

describe("deepMergeChanges", () => {
  it("merges nested objects deeply", () => {
    const target = { seo: { title: "Old", description: "Desc" }, name: "Original" };
    const source = { seo: { title: "New" } };
    const result = deepMergeChanges(target, source);
    expect(result.seo).toEqual({ title: "New", description: "Desc" });
    expect(result.name).toBe("Original");
  });

  it("handles sparse arrays — null skips index", () => {
    const target = { items: [{ a: 1 }, { b: 2 }] };
    const source = { items: [null, { c: 3 }] };
    const result = deepMergeChanges(target, source);
    expect(result.items).toEqual([{ a: 1 }, { b: 2, c: 3 }]);
  });

  it("replaces primitive array values", () => {
    const target = { tags: ["old1", "old2"] };
    const source = { tags: [null, "new2"] };
    const result = deepMergeChanges(target, source);
    expect(result.tags).toEqual(["old1", "new2"]);
  });

  it("does not mutate original target", () => {
    const target = { name: "Original", nested: { value: 1 } };
    const source = { name: "Changed" };
    deepMergeChanges(target, source);
    expect(target.name).toBe("Original");
  });

  it("handles empty source gracefully", () => {
    const target = { name: "Test", price: 99 };
    const result = deepMergeChanges(target, {});
    expect(result).toEqual({ name: "Test", price: 99 });
  });
});
