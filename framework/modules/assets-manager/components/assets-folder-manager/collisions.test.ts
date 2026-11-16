import { describe, it, expect } from "vitest";
import { hasNameCollision, isValidEntryName } from "./collisions";

describe("hasNameCollision", () => {
  it("matches case-insensitively", () => {
    expect(hasNameCollision("FAQ.md", ["faq.md"])).toBe(true);
  });

  it("does not match a different name", () => {
    expect(hasNameCollision("faq.md", ["faq.mdx"])).toBe(false);
  });
});

describe("isValidEntryName", () => {
  it.each(["report.pdf", "a b#c", "Отчёт", ".hidden"])("accepts %s", (name) => {
    expect(isValidEntryName(name)).toBe(true);
  });

  it.each(["", "  ", ".", "..", " .. ", "a/b", "a\\b", "a\u0000b", "line\nbreak", "tab\there"])(
    "rejects %j",
    (name) => {
      expect(isValidEntryName(name)).toBe(false);
    },
  );
});
