import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableColumnsResize } from "./useTableColumnsResize";
import type { ColumnState } from "../types";
import type { EngineOutput } from "./useColumnWidthEngine";

/**
 * Build a ColumnState with equal weights for the given column IDs.
 */
function makeColumnState(ids: string[]): ColumnState {
  const weight = 1 / ids.length;
  const specs: Record<string, { weight: number; minPx: number; maxPx: number }> = {};
  for (const id of ids) {
    specs[id] = { weight, minPx: 40, maxPx: Infinity };
  }
  return { order: ids, specs };
}

/**
 * Build a ColumnState with explicit weights (as pixel-like values that get normalized).
 */
function makeColumnStateFromWidths(widthMap: Record<string, number>): ColumnState {
  const entries = Object.entries(widthMap);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  const specs: Record<string, { weight: number; minPx: number; maxPx: number }> = {};
  const order: string[] = [];
  for (const [id, w] of entries) {
    order.push(id);
    specs[id] = { weight: total > 0 ? w / total : 1 / entries.length, minPx: 40, maxPx: Infinity };
  }
  return { order, specs };
}

function makeEngineOutput(widthMap: Record<string, number>, fillerWidth = 0): EngineOutput {
  return { widths: widthMap, fillerWidth };
}

function setup(
  state?: ColumnState,
  engineOut?: EngineOutput,
  opts: {
    onResizeEnd?: () => void;
    availableWidth?: number;
    specialColumnsWidth?: number;
    getVisibleRegularColumnIds?: () => string[];
  } = {},
) {
  const columnState = ref(state ?? makeColumnState(["name", "price", "stock"]));
  const engineOutput = ref(engineOut ?? makeEngineOutput({ name: 200, price: 150, stock: 100 }));
  const recompute = vi.fn();
  const availableWidth = opts.availableWidth ?? 450;

  return {
    ...mountWithSetup(() =>
      useTableColumnsResize({
        columnState,
        engineOutput,
        recompute,
        getAvailableWidth: () => availableWidth,
        minColumnWidth: 40,
        getVisibleRegularColumnIds: opts.getVisibleRegularColumnIds,
        onResizeEnd: opts.onResizeEnd,
      }),
    ),
    columnState,
    engineOutput,
    recompute,
  };
}

afterEach(() => {
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
});

describe("useTableColumnsResize", () => {
  it("isResizing starts as false", () => {
    const { result } = setup();
    expect(result.isResizing.value).toBe(false);
  });

  it("getResizeHeadProps returns correct shape", () => {
    const { result } = setup();
    const props = result.getResizeHeadProps("name", 0);
    expect(props.resizable).toBe(true);
    expect(props.columnId).toBe("name");
    expect(props.isLastResizable).toBe(false);
    expect(typeof props.onResizeStart).toBe("function");
  });

  it("getResizeHeadProps marks last column correctly", () => {
    const { result } = setup();
    const props = result.getResizeHeadProps("stock", 2);
    expect(props.isLastResizable).toBe(true);
  });

  it("handleResizeStart sets isResizing and body styles", () => {
    const { result } = setup();
    result.handleResizeStart("name", { pageX: 100 } as MouseEvent);

    expect(result.isResizing.value).toBe(true);
    expect(document.body.style.cursor).toBe("col-resize");
    expect(document.body.style.userSelect).toBe("none");

    document.dispatchEvent(new MouseEvent("mouseup"));
  });

  it("onResizeEnd callback is called on mouseup", () => {
    const onResizeEnd = vi.fn();
    const { result } = setup(undefined, undefined, { onResizeEnd });
    result.handleResizeStart("name", { pageX: 100 } as MouseEvent);

    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(onResizeEnd).toHaveBeenCalled();
    expect(result.isResizing.value).toBe(false);
  });
});

describe("weight-based resize behavior", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function flushRAF() {
    vi.advanceTimersByTime(16);
  }

  it("growing a column increases its weight and decreases right neighbor weights", () => {
    const state = makeColumnStateFromWidths({ a: 300, b: 250, c: 250, d: 200 });
    const engineOut = makeEngineOutput({ a: 300, b: 250, c: 250, d: 200 });
    const totalAvailable = 1000;
    const { result, columnState } = setup(state, engineOut, { availableWidth: totalAvailable });

    const initialWeightA = columnState.value.specs["a"].weight;
    const initialWeightB = columnState.value.specs["b"].weight;

    result.handleResizeStart("a", { pageX: 300 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 400 });
    Object.defineProperty(moveEvent, "pageX", { value: 400 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    // Column A's weight should have increased
    expect(columnState.value.specs["a"].weight).toBeGreaterThan(initialWeightA);
    // Right neighbors should have decreased
    expect(columnState.value.specs["b"].weight).toBeLessThan(initialWeightB);
  });

  it("shrinking a column decreases its weight and increases right neighbor weights", () => {
    const state = makeColumnStateFromWidths({ a: 400, b: 100, c: 100 });
    const engineOut = makeEngineOutput({ a: 400, b: 100, c: 100 });
    const { result, columnState } = setup(state, engineOut, { availableWidth: 600 });

    const initialWeightA = columnState.value.specs["a"].weight;
    const initialWeightB = columnState.value.specs["b"].weight;

    result.handleResizeStart("a", { pageX: 400 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 300 });
    Object.defineProperty(moveEvent, "pageX", { value: 300 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(columnState.value.specs["a"].weight).toBeLessThan(initialWeightA);
    expect(columnState.value.specs["b"].weight).toBeGreaterThan(initialWeightB);
  });

  it("left columns are not affected during resize", () => {
    const state = makeColumnStateFromWidths({ a: 200, b: 200, c: 200 });
    const engineOut = makeEngineOutput({ a: 200, b: 200, c: 200 });
    const { result, columnState } = setup(state, engineOut, { availableWidth: 600 });

    const initialWeightA = columnState.value.specs["a"].weight;

    result.handleResizeStart("b", { pageX: 400 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 450 });
    Object.defineProperty(moveEvent, "pageX", { value: 450 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    // Column A should be unchanged (not a right neighbor of B)
    expect(columnState.value.specs["a"].weight).toBeCloseTo(initialWeightA, 5);
  });

  it("weights remain normalized (sum to ~1.0) after resize", () => {
    const state = makeColumnStateFromWidths({ a: 300, b: 200, c: 100 });
    const engineOut = makeEngineOutput({ a: 300, b: 200, c: 100 });
    const { result, columnState } = setup(state, engineOut, { availableWidth: 600 });

    result.handleResizeStart("a", { pageX: 300 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 400 });
    Object.defineProperty(moveEvent, "pageX", { value: 400 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    const totalWeight = Object.values(columnState.value.specs).reduce((s, spec) => s + spec.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 2);
  });

  it("resizes only rendered columns when hidden columns remain in persisted order", () => {
    const state: ColumnState = {
      order: ["a", "hidden", "b", "c"],
      specs: {
        a: { weight: 0.4, minPx: 40, maxPx: Infinity },
        hidden: { weight: 0, minPx: 40, maxPx: Infinity },
        b: { weight: 0.35, minPx: 40, maxPx: Infinity },
        c: { weight: 0.25, minPx: 40, maxPx: Infinity },
      },
    };
    const engineOut = makeEngineOutput({ a: 180, b: 157, c: 113 });
    const { result, columnState, engineOutput } = setup(state, engineOut, { availableWidth: 450 });

    const initialHiddenWeight = columnState.value.specs["hidden"].weight;
    const initialWeightA = columnState.value.specs["a"].weight;
    const initialWeightB = columnState.value.specs["b"].weight;

    result.handleResizeStart("a", { pageX: 200 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 260 });
    Object.defineProperty(moveEvent, "pageX", { value: 260 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    // Hidden column is not part of render/output during resize.
    expect(engineOutput.value.widths).not.toHaveProperty("hidden");
    // Visible neighbors are resized, hidden stays untouched.
    expect(columnState.value.specs["a"].weight).toBeGreaterThan(initialWeightA);
    expect(columnState.value.specs["b"].weight).toBeLessThan(initialWeightB);
    expect(columnState.value.specs["hidden"].weight).toBe(initialHiddenWeight);
  });

  it("uses explicit visible regular ids when engine output is not initialized yet", () => {
    const state: ColumnState = {
      order: ["a", "hidden", "b", "c"],
      specs: {
        a: { weight: 0.4, minPx: 40, maxPx: Infinity },
        hidden: { weight: 0, minPx: 40, maxPx: Infinity },
        b: { weight: 0.35, minPx: 40, maxPx: Infinity },
        c: { weight: 0.25, minPx: 40, maxPx: Infinity },
      },
    };
    const engineOut = makeEngineOutput({});
    const { result, columnState, recompute } = setup(state, engineOut, {
      availableWidth: 450,
      getVisibleRegularColumnIds: () => ["a", "b", "c"],
    });

    result.handleResizeStart("a", { pageX: 200 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 260 });
    Object.defineProperty(moveEvent, "pageX", { value: 260 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    // Only visible regular columns (a, b, c) had their weights adjusted.
    // The hidden column is not part of the resize redistribution.
    expect(columnState.value.specs["a"].weight).toBeGreaterThan(0.4);
    expect(columnState.value.specs["b"].weight).toBeLessThan(0.35);
    expect(columnState.value.specs["c"].weight).toBeLessThan(0.25);
    expect(columnState.value.specs["hidden"].weight).toBe(0);
    // recompute() is delegated to the caller — called after the state commit.
    expect(recompute).toHaveBeenCalled();
  });

  it("preserves unbounded maxPx during clone and does not collapse widths to min", () => {
    const state = makeColumnStateFromWidths({ a: 200, b: 200, c: 200 });
    const engineOut = makeEngineOutput({ a: 200, b: 200, c: 200 });
    const { result, engineOutput } = setup(state, engineOut, { availableWidth: 600 });

    result.handleResizeStart("a", { pageX: 200 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 260 });
    Object.defineProperty(moveEvent, "pageX", { value: 260 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(engineOutput.value.widths["a"]).toBeGreaterThan(40);
    expect(engineOutput.value.widths["b"]).toBeGreaterThan(40);
    expect(engineOutput.value.widths["c"]).toBeGreaterThan(40);
    expect(engineOutput.value.fillerWidth).toBe(0);
  });
});
