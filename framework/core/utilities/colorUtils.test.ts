import { describe, it, expect, vi } from "vitest";
import { convertColorNameToHex, isValidHexColor, normalizeHexColor } from "./colorUtils";

describe("colorUtils", () => {
  describe("isValidHexColor", () => {
    it("returns true for valid 6-digit hex with #", () => {
      expect(isValidHexColor("#ff0000")).toBe(true);
      expect(isValidHexColor("#AABBCC")).toBe(true);
      expect(isValidHexColor("#123456")).toBe(true);
    });

    it("returns true for valid 6-digit hex without #", () => {
      expect(isValidHexColor("ff0000")).toBe(true);
      expect(isValidHexColor("AABBCC")).toBe(true);
    });

    it("returns false for 3-digit shorthand hex", () => {
      expect(isValidHexColor("#fff")).toBe(false);
      expect(isValidHexColor("abc")).toBe(false);
    });

    it("returns false for 8-digit hex (with alpha)", () => {
      expect(isValidHexColor("#ff000080")).toBe(false);
    });

    it("returns false for invalid characters", () => {
      expect(isValidHexColor("#gggggg")).toBe(false);
      expect(isValidHexColor("#xyz123")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isValidHexColor("")).toBe(false);
    });

    it("returns false for non-string input", () => {
      expect(isValidHexColor(null as unknown as string)).toBe(false);
      expect(isValidHexColor(undefined as unknown as string)).toBe(false);
      expect(isValidHexColor(123 as unknown as string)).toBe(false);
    });
  });

  describe("normalizeHexColor", () => {
    it("adds # prefix when missing", () => {
      expect(normalizeHexColor("ff0000")).toBe("#ff0000");
      expect(normalizeHexColor("AABBCC")).toBe("#AABBCC");
    });

    it("keeps # prefix when already present", () => {
      expect(normalizeHexColor("#ff0000")).toBe("#ff0000");
    });

    it("returns empty string for empty input", () => {
      expect(normalizeHexColor("")).toBe("");
    });

    it("returns empty string for null/undefined", () => {
      expect(normalizeHexColor(null as unknown as string)).toBe("");
      expect(normalizeHexColor(undefined as unknown as string)).toBe("");
    });

    it("returns empty string for non-string input", () => {
      expect(normalizeHexColor(42 as unknown as string)).toBe("");
    });
  });

  describe("convertColorNameToHex", () => {
    it("returns null for empty string", () => {
      expect(convertColorNameToHex("")).toBe(null);
    });

    it("returns null for null/undefined input", () => {
      expect(convertColorNameToHex(null as unknown as string)).toBe(null);
      expect(convertColorNameToHex(undefined as unknown as string)).toBe(null);
    });

    it("returns null for non-string input", () => {
      expect(convertColorNameToHex(123 as unknown as string)).toBe(null);
    });

    it("returns a string or null for valid color names (canvas-dependent)", () => {
      const result = convertColorNameToHex("red");
      expect(result === null || typeof result === "string").toBe(true);
    });

    it("returns null when canvas context is unavailable", () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null) as unknown as typeof origGetContext;
      expect(convertColorNameToHex("blue")).toBe(null);
      HTMLCanvasElement.prototype.getContext = origGetContext;
    });
  });
});
