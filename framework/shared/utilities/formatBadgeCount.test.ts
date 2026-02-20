import { describe, it, expect } from "vitest";
import { formatBadgeCount } from "@shared/utilities/formatBadgeCount";

describe("formatBadgeCount", () => {
  it("returns undefined for undefined input", () => {
    expect(formatBadgeCount(undefined)).toBeUndefined();
  });

  it("returns string for numbers <= 99", () => {
    expect(formatBadgeCount(0)).toBe("0");
    expect(formatBadgeCount(42)).toBe("42");
    expect(formatBadgeCount(99)).toBe("99");
  });

  it("returns '99+' for numbers > 99", () => {
    expect(formatBadgeCount(100)).toBe("99+");
    expect(formatBadgeCount(999)).toBe("99+");
  });

  it("handles string input", () => {
    expect(formatBadgeCount("5")).toBe("5");
    expect(formatBadgeCount("100")).toBe("99+");
    expect(formatBadgeCount("abc")).toBe("abc");
  });
});
