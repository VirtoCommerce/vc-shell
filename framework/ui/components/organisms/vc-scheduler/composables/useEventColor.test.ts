import { describe, it, expect } from "vitest";
import { autoEventColor, readableInk } from "./useEventColor";

// WCAG relative luminance + contrast, duplicated here so the test asserts the
// real AA outcome rather than trusting the implementation's own math.
function contrastRatio(hexA: string, hexB: string): number {
  const lum = (hex: string) => {
    const h = hex.replace("#", "");
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const lin = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  };
  const [a, b] = [lum(hexA), lum(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("autoEventColor", () => {
  it("is deterministic for a given seed", () => {
    expect(autoEventColor("Summer Sale")).toBe(autoEventColor("Summer Sale"));
  });

  it("returns a hex from the palette", () => {
    expect(autoEventColor("Summer Sale")).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("gives different seeds different colors (for these sample titles)", () => {
    const a = autoEventColor("Summer Sale");
    const b = autoEventColor("Flash Deal");
    const c = autoEventColor("Clearance");
    expect(new Set([a, b, c]).size).toBeGreaterThan(1);
  });

  it("falls back to the default fill for an empty seed", () => {
    expect(autoEventColor("")).toBe("var(--primary-500)");
    expect(autoEventColor(undefined)).toBe("var(--primary-500)");
  });
});

describe("readableInk", () => {
  it("picks dark ink over a light fill (green #16a34a would fail AA with white)", () => {
    const ink = readableInk("#16a34a");
    // white-on-green measures 3.30:1 (fails AA); the chosen ink must clear 4.5:1.
    expect(contrastRatio(ink, "#16a34a")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps white ink over a dark fill (blue #2563eb)", () => {
    expect(readableInk("#2563eb")).toBe("#ffffff");
    expect(contrastRatio("#ffffff", "#2563eb")).toBeGreaterThanOrEqual(4.5);
  });

  it("clears AA for every auto-palette color", () => {
    const palette = ["#2563eb", "#16a34a", "#c2410c", "#dc2626", "#7c3aed", "#db2777", "#0f766e", "#475569"];
    for (const fill of palette) {
      expect(contrastRatio(readableInk(fill), fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("clears AA for every editor picker swatch", () => {
    // Mirror of colorOptions in SchedulerEventEditor.vue (minus the sentinel default).
    // Purple is violet-600 (#7c3aed), not -500, because -500 has no AA-capable ink.
    const swatches = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#7c3aed", "#ec4899", "#14b8a6", "#64748b"];
    for (const fill of swatches) {
      expect(contrastRatio(readableInk(fill), fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("parses shorthand hex and rgb()", () => {
    expect(readableInk("#000")).toBe("#ffffff");
    expect(readableInk("rgb(255, 255, 255)")).toBe("#18181b");
  });

  it("falls back to white for unresolvable CSS-var / empty fills", () => {
    expect(readableInk("var(--primary-500)")).toBe("#ffffff");
    expect(readableInk(undefined)).toBe("#ffffff");
    expect(readableInk(null)).toBe("#ffffff");
  });
});
