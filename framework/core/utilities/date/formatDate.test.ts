import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDateRelative, formatDateWithPattern } from "./formatDate";

describe("formatDateRelative", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns relative time for a past date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));

    const pastDate = new Date("2024-06-15T11:00:00Z");
    const result = formatDateRelative(pastDate);
    expect(result).toContain("ago");
  });

  it("handles ISO string input", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));

    const result = formatDateRelative("2024-06-15T11:30:00Z");
    expect(result).toContain("ago");
  });

  it('returns "" for null', () => {
    expect(formatDateRelative(null)).toBe("");
  });

  it('returns "" for undefined', () => {
    expect(formatDateRelative(undefined)).toBe("");
  });

  it('returns "" for empty string', () => {
    expect(formatDateRelative("")).toBe("");
  });
});

describe("formatDateWithPattern", () => {
  it("formats with 'YYYY-MM-DD HH:mm' pattern", () => {
    const date = new Date("2024-03-15T14:30:00Z");
    const result = formatDateWithPattern(date, "YYYY-MM-DD HH:mm");
    expect(result).toMatch(/2024-03-15 \d{2}:30/);
  });

  it("formats with 'DD.MM.YYYY' pattern", () => {
    const date = new Date("2024-03-15T00:00:00Z");
    const result = formatDateWithPattern(date, "DD.MM.YYYY");
    expect(result).toMatch(/15\.03\.2024/);
  });

  it("accepts string date input", () => {
    const result = formatDateWithPattern("2024-01-01T00:00:00Z", "YYYY-MM-DD");
    expect(result).toMatch(/2024-01-01/);
  });

  it('returns "" for null', () => {
    expect(formatDateWithPattern(null, "YYYY-MM-DD")).toBe("");
  });
});
