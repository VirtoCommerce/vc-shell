import { describe, it, expect } from "vitest";
import { stripInternalBlocks } from "../src/transformer/strip-internal.js";

describe("stripInternalBlocks", () => {
  it("removes a single internal block", () => {
    const input = "before\n<!-- internal:start -->\nhidden\n<!-- internal:end -->\nafter";
    expect(stripInternalBlocks(input)).toBe("before\n\nafter");
  });

  it("removes multiple internal blocks", () => {
    const input =
      "a\n<!-- internal:start -->X<!-- internal:end -->\nb\n<!-- internal:start -->Y<!-- internal:end -->\nc";
    expect(stripInternalBlocks(input)).toBe("a\n\nb\n\nc");
  });

  it("handles internal block at the very end", () => {
    const input = "kept\n<!-- internal:start -->\ngone\n<!-- internal:end -->";
    expect(stripInternalBlocks(input)).toBe("kept\n");
  });

  it("returns input unchanged when no markers", () => {
    expect(stripInternalBlocks("plain text")).toBe("plain text");
  });

  it("leaves unbalanced markers alone (and warns is caller's job)", () => {
    const input = "<!-- internal:start -->\nno end here";
    // We strip only when start AND end present and balanced; unbalanced → no-op.
    expect(stripInternalBlocks(input)).toBe(input);
  });
});
