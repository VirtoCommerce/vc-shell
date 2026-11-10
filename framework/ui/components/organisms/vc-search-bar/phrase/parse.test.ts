import { describe, it, expect } from "vitest";
import { parsePhrase, PhraseError, quote, type PhraseNode } from "./parse";

const cond = (n: PhraseNode | null) => {
  if (n?.k !== "cond") throw new Error("not a cond");
  return n.c;
};

describe("parsePhrase", () => {
  it("returns null for empty input", () => {
    expect(parsePhrase("  ")).toBeNull();
  });

  it("reads keywords", () => {
    expect(parsePhrase("hello")).toMatchObject({ k: "word", v: "hello" });
    expect(parsePhrase('"In progress"')).toMatchObject({ k: "word", v: "In progress" });
  });

  it("reads comma separated values", () => {
    expect(cond(parsePhrase("status:Paid,New"))).toMatchObject({
      field: "status",
      values: ["Paid", "New"],
      neg: false,
    });
  });

  it("keeps commas inside quotes", () => {
    expect(cond(parsePhrase('status:"a,b"'))).toMatchObject({ values: ["a,b"] });
  });

  it("handles backslash escapes in quotes", () => {
    expect(cond(parsePhrase('title:"say \\"hi\\""'))).toMatchObject({ values: ['say "hi"'] });
  });

  it("reads negation", () => {
    expect(cond(parsePhrase("!status:Paid"))).toMatchObject({ neg: true, field: "status" });
  });

  it("reads ranges with open ends and exclusive bounds", () => {
    expect(cond(parsePhrase("createddate:[2026-01-01 TO 2026-01-31]"))).toMatchObject({
      kind: "range",
      ranges: [{ lo: "2026-01-01", hi: "2026-01-31", loInc: true, hiInc: true }],
    });
    expect(cond(parsePhrase("d:[2026-01-01 TO]"))).toMatchObject({ ranges: [{ lo: "2026-01-01", hi: undefined }] });
    expect(cond(parsePhrase("d:[TO 2026-01-31]"))).toMatchObject({ ranges: [{ lo: undefined, hi: "2026-01-31" }] });
    expect(cond(parsePhrase("n:(1 TO 5]"))).toMatchObject({
      ranges: [{ lo: "1", hi: "5", loInc: false, hiInc: true }],
    });
  });

  it("reads AND, OR and parentheses", () => {
    expect(parsePhrase("a AND b")).toMatchObject({ k: "and", items: [{ v: "a" }, { v: "b" }] });
    expect(parsePhrase("a OR b")).toMatchObject({ k: "or", items: [{ v: "a" }, { v: "b" }] });
    expect(parsePhrase("(a OR b) c")).toMatchObject({ k: "and", items: [{ k: "or", paren: true }, { v: "c" }] });
  });

  it("treats a comma followed by space as a delimiter", () => {
    expect(parsePhrase("a:1, b:2")).toMatchObject({ k: "and", items: [{ c: { field: "a" } }, { c: { field: "b" } }] });
  });

  it.each([
    ["status:", 7],
    ['"abc', 0],
    ["d:[TO]", 5],
    ["(a", 0],
  ])("reports an error with position for %s", (src, pos) => {
    try {
      parsePhrase(src);
      throw new Error("expected failure");
    } catch (e) {
      expect(e).toBeInstanceOf(PhraseError);
      expect((e as PhraseError).pos).toBe(pos);
    }
  });
});

describe("quote", () => {
  it("quotes only when needed", () => {
    expect(quote("Paid")).toBe("Paid");
    expect(quote("In progress")).toBe('"In progress"');
    expect(quote("AND")).toBe('"AND"');
    expect(quote('say "hi"')).toBe('"say \\"hi\\""');
  });
});
