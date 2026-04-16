// useColumnWidthEngine.test.ts
import { describe, it, expect, vi } from "vitest";
import {
  computeColumnWidths,
  parseColumnWidth,
  buildInitialWeights,
  normalizeWeights,
  type EngineInput,
  type ColumnSpec,
} from "./useColumnWidthEngine";

// Helper: create a spec with defaults
function spec(weight: number, minPx = 40, maxPx = Infinity): ColumnSpec {
  return { weight, minPx, maxPx };
}

// Helper: sum all widths from output
function sumWidths(widths: Record<string, number>): number {
  return Object.values(widths).reduce((s, w) => s + w, 0);
}

describe("computeColumnWidths", () => {
  // Test 1: Basic fit
  it("distributes available width proportionally in fit mode", () => {
    const input: EngineInput = {
      availableWidth: 900,
      columns: [
        { id: "a", spec: spec(0.5) },
        { id: "b", spec: spec(0.3) },
        { id: "c", spec: spec(0.2) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths) + result.fillerWidth).toBe(900);
    expect(result.fillerWidth).toBe(0);
    expect(result.widths["a"]).toBeGreaterThan(result.widths["b"]);
    expect(result.widths["b"]).toBeGreaterThan(result.widths["c"]);
  });

  // Test 2: Mixed initial (px + % + auto) via buildInitialWeights
  it("builds correct weights from mixed column specs", () => {
    const weights = buildInitialWeights(
      [
        { id: "fixed", parsed: { type: "px", desiredPx: 200 } },
        { id: "pct", parsed: { type: "percent", desiredPx: 180 } },
        { id: "auto1", parsed: { type: "auto", desiredPx: null } },
        { id: "auto2", parsed: { type: "auto", desiredPx: null } },
      ],
      900,
    );
    expect(Object.values(weights).reduce((s, w) => s + w, 0)).toBeCloseTo(1.0, 5);
    // fixed=200/900~0.222, pct=180/900=0.2, auto=(900-200-180)/2/900~0.289 each
    expect(weights["fixed"]).toBeCloseTo(200 / 900, 2);
    expect(weights["pct"]).toBeCloseTo(180 / 900, 2);
    expect(weights["auto1"]).toBeCloseTo(260 / 900, 2);
  });

  // Test 3: Shrink pass
  it("shrinks proportionally when desired > available, respecting minPx", () => {
    const input: EngineInput = {
      availableWidth: 200,
      columns: [
        { id: "a", spec: spec(0.6, 60) },
        { id: "b", spec: spec(0.4, 60) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths)).toBe(200);
    expect(result.widths["a"]).toBeGreaterThanOrEqual(60);
    expect(result.widths["b"]).toBeGreaterThanOrEqual(60);
  });

  // Test 4: Grow pass (fit mode) distributes to columns with grow-capacity
  it("grows columns with remaining capacity in fit mode", () => {
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: spec(0.3, 40, 200) }, // maxPx=200, will cap
        { id: "b", spec: spec(0.3, 40, Infinity) },
        { id: "c", spec: spec(0.4, 40, Infinity) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths)).toBe(1000);
    expect(result.widths["a"]).toBe(200); // capped at max
    expect(result.widths["b"] + result.widths["c"]).toBe(800); // absorb surplus
  });

  // Test 5: Gap mode leaves filler
  it("leaves filler in gap mode when desired < available", () => {
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: spec(0.3, 40, 300) },
        { id: "b", spec: spec(0.3, 40, 300) },
        { id: "c", spec: spec(0.4, 40, 400) },
      ],
      mode: "gap",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths) + result.fillerWidth).toBe(1000);
    expect(result.widths["a"]).toBeLessThanOrEqual(300);
    expect(result.widths["b"]).toBeLessThanOrEqual(300);
    expect(result.widths["c"]).toBeLessThanOrEqual(400);
  });

  // Test 6: minPx enforcement
  it("never produces width below minPx in normal conditions", () => {
    const input: EngineInput = {
      availableWidth: 300,
      columns: [
        { id: "a", spec: spec(0.1, 80) },
        { id: "b", spec: spec(0.9, 80) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBeGreaterThanOrEqual(80);
    expect(result.widths["b"]).toBeGreaterThanOrEqual(80);
  });

  // Test 7: maxPx enforcement
  it("never produces width above maxPx", () => {
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: spec(0.5, 40, 200) },
        { id: "b", spec: spec(0.5, 40, 200) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBeLessThanOrEqual(200);
    expect(result.widths["b"]).toBeLessThanOrEqual(200);
  });

  // Test 8: Crisis -- sum(minPx) > available
  it("squeezes below minPx with warning when sum(min) > available", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const input: EngineInput = {
      availableWidth: 100,
      columns: [
        { id: "a", spec: spec(0.5, 80) },
        { id: "b", spec: spec(0.5, 80) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths)).toBe(100);
    expect(result.widths["a"]).toBeGreaterThan(0);
    expect(result.widths["b"]).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  // Test 9: Rounding determinism
  it("produces identical output for identical input (no drift)", () => {
    const input: EngineInput = {
      availableWidth: 999,
      columns: [
        { id: "a", spec: spec(0.333) },
        { id: "b", spec: spec(0.333) },
        { id: "c", spec: spec(0.334) },
      ],
      mode: "fit",
    };
    const r1 = computeColumnWidths(input);
    const r2 = computeColumnWidths(input);
    expect(r1).toEqual(r2);
    expect(sumWidths(r1.widths)).toBe(999);
  });

  // Test 10: availableWidth = 0
  it("returns all zeros when availableWidth is 0", () => {
    const input: EngineInput = {
      availableWidth: 0,
      columns: [
        { id: "a", spec: spec(0.5) },
        { id: "b", spec: spec(0.5) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBe(0);
    expect(result.widths["b"]).toBe(0);
    expect(result.fillerWidth).toBe(0);
  });

  // Test 11: Single column
  it("gives single column the full available width", () => {
    const input: EngineInput = {
      availableWidth: 800,
      columns: [{ id: "only", spec: spec(1.0) }],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["only"]).toBe(800);
  });

  // Test 12: Empty columns array
  it("handles empty columns gracefully", () => {
    const input: EngineInput = {
      availableWidth: 800,
      columns: [],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(Object.keys(result.widths)).toHaveLength(0);
    expect(result.fillerWidth).toBe(800);
  });

  // Test 13: Many columns very narrow
  it("handles 20 columns in 200px without overflow", () => {
    const columns = Array.from({ length: 20 }, (_, i) => ({
      id: `c${i}`,
      spec: spec(0.05, 5),
    }));
    const input: EngineInput = { availableWidth: 200, columns, mode: "fit" };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths)).toBe(200);
    Object.values(result.widths).forEach((w) => expect(w).toBeGreaterThanOrEqual(0));
  });

  // Test 14: Gap mode shrink -- still respects minPx
  it("respects minPx even in gap mode when desired < min", () => {
    const input: EngineInput = {
      availableWidth: 500,
      columns: [
        { id: "a", spec: spec(0.01, 100) }, // desired=5, but min=100
        { id: "b", spec: spec(0.99, 40) },
      ],
      mode: "gap",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBeGreaterThanOrEqual(100);
  });

  // Test 15: Negative available width
  it("returns all zeros for negative availableWidth", () => {
    const input: EngineInput = {
      availableWidth: -100,
      columns: [{ id: "a", spec: spec(1.0) }],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBe(0);
    expect(result.fillerWidth).toBe(0);
  });

  // Test 16: Gap mode with exact fit (no filler)
  it("produces zero filler in gap mode when sum equals available", () => {
    const input: EngineInput = {
      availableWidth: 600,
      columns: [
        { id: "a", spec: spec(0.5, 40, 300) },
        { id: "b", spec: spec(0.5, 40, 300) },
      ],
      mode: "gap",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths) + result.fillerWidth).toBe(600);
  });

  // Test 17: Weights that don't sum to 1.0 (should still work)
  it("handles unnormalized weights correctly", () => {
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: spec(2.0) },
        { id: "b", spec: spec(3.0) },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(sumWidths(result.widths)).toBe(1000);
    expect(result.widths["a"]).toBeLessThan(result.widths["b"]);
  });

  // Test 18: All columns capped at maxPx, surplus to filler in gap mode
  it("sends surplus to filler when all columns hit maxPx in gap mode", () => {
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: spec(0.5, 40, 200) },
        { id: "b", spec: spec(0.5, 40, 200) },
      ],
      mode: "gap",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBe(200);
    expect(result.widths["b"]).toBe(200);
    expect(result.fillerWidth).toBe(600);
    expect(sumWidths(result.widths) + result.fillerWidth).toBe(1000);
  });
});

describe("parseColumnWidth", () => {
  it("parses pixel number", () => {
    expect(parseColumnWidth(200, 1000)).toEqual({ type: "px", desiredPx: 200 });
  });

  it('parses pixel string "200px"', () => {
    expect(parseColumnWidth("200px", 1000)).toEqual({ type: "px", desiredPx: 200 });
  });

  it('parses pixel string "200"', () => {
    expect(parseColumnWidth("200", 1000)).toEqual({ type: "px", desiredPx: 200 });
  });

  it('parses percentage "20%"', () => {
    expect(parseColumnWidth("20%", 1000)).toEqual({ type: "percent", desiredPx: 200 });
  });

  it("returns auto for undefined", () => {
    expect(parseColumnWidth(undefined, 1000)).toEqual({ type: "auto", desiredPx: null });
  });
});

describe("normalizeWeights", () => {
  it("normalizes weights to sum 1.0", () => {
    const specs: Record<string, ColumnSpec> = {
      a: spec(3),
      b: spec(2),
      c: spec(5),
    };
    normalizeWeights(specs, ["a", "b", "c"]);
    const total = specs["a"].weight + specs["b"].weight + specs["c"].weight;
    expect(total).toBeCloseTo(1.0, 10);
    expect(specs["a"].weight).toBeCloseTo(0.3, 10);
  });

  it("handles all-zero weights with equal distribution", () => {
    const specs: Record<string, ColumnSpec> = {
      a: spec(0),
      b: spec(0),
    };
    normalizeWeights(specs, ["a", "b"]);
    expect(specs["a"].weight).toBeCloseTo(0.5, 10);
    expect(specs["b"].weight).toBeCloseTo(0.5, 10);
  });
});

describe("end-to-end: declared widths flow through engine", () => {
  it("honors px-declared column widths when used with buildInitialWeights", () => {
    // Simulates the useTableColumns init path: parse props → weights → engine.
    const availableWidth = 600;
    const parsed = [
      { id: "a", parsed: parseColumnWidth(200, availableWidth) },
      { id: "b", parsed: parseColumnWidth(300, availableWidth) },
      { id: "c", parsed: parseColumnWidth(100, availableWidth) },
    ];
    const weights = buildInitialWeights(parsed, availableWidth);

    const result = computeColumnWidths({
      availableWidth,
      columns: [
        { id: "a", spec: { weight: weights["a"], minPx: 40, maxPx: Infinity } },
        { id: "b", spec: { weight: weights["b"], minPx: 40, maxPx: Infinity } },
        { id: "c", spec: { weight: weights["c"], minPx: 40, maxPx: Infinity } },
      ],
      mode: "fit",
    });

    // Declared widths were 200/300/100; with available=600 they fit exactly.
    expect(result.widths["a"]).toBe(200);
    expect(result.widths["b"]).toBe(300);
    expect(result.widths["c"]).toBe(100);
    expect(result.fillerWidth).toBe(0);
  });

  it("respects declared minWidth — column stays ≥ min after narrow-container shrink", () => {
    // Declared: a=minWidth=150, b=minWidth=40, c=minWidth=40, available=300
    // Engine should honor min of 150 for `a` even when proportional shrink would push it lower.
    const input: EngineInput = {
      availableWidth: 300,
      columns: [
        { id: "a", spec: { weight: 0.2, minPx: 150, maxPx: Infinity } },
        { id: "b", spec: { weight: 0.4, minPx: 40, maxPx: Infinity } },
        { id: "c", spec: { weight: 0.4, minPx: 40, maxPx: Infinity } },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBeGreaterThanOrEqual(150);
    expect(sumWidths(result.widths)).toBe(300);
  });

  it("respects declared maxWidth — column never exceeds max even with large weight", () => {
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: { weight: 0.8, minPx: 40, maxPx: 250 } },
        { id: "b", spec: { weight: 0.1, minPx: 40, maxPx: Infinity } },
        { id: "c", spec: { weight: 0.1, minPx: 40, maxPx: Infinity } },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBeLessThanOrEqual(250);
    // Remaining width goes to b and c (which have grow capacity).
    expect(result.widths["b"] + result.widths["c"]).toBe(1000 - result.widths["a"]);
  });

  it("fit mode with all columns at maxPx: surplus flows to filler", () => {
    // All columns capped at their max — engine can't grow them further.
    // In fit mode, this edge case produces a non-zero filler (documented behavior).
    const input: EngineInput = {
      availableWidth: 1000,
      columns: [
        { id: "a", spec: { weight: 0.5, minPx: 40, maxPx: 200 } },
        { id: "b", spec: { weight: 0.5, minPx: 40, maxPx: 200 } },
      ],
      mode: "fit",
    };
    const result = computeColumnWidths(input);
    expect(result.widths["a"]).toBe(200);
    expect(result.widths["b"]).toBe(200);
    // Sum must equal available; 600px overflow goes to filler.
    expect(sumWidths(result.widths) + result.fillerWidth).toBe(1000);
    expect(result.fillerWidth).toBe(600);
  });
});
