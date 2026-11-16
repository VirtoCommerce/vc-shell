import { describe, it, expect } from "vitest";
import { hasNameCollision } from "./collisions";

describe("hasNameCollision", () => {
  it("matches case-insensitively", () => {
    expect(hasNameCollision("FAQ.md", ["faq.md"])).toBe(true);
  });

  it("does not match a different name", () => {
    expect(hasNameCollision("faq.md", ["faq.mdx"])).toBe(false);
  });
});
