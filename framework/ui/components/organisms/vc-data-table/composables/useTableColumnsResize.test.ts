import { describe, it, expect, vi, afterEach } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableColumnsResize, type ResizableColumn } from "./useTableColumnsResize";

function makeColumns(): ResizableColumn[] {
  return [
    { id: "name", width: 200 },
    { id: "price", width: 150 },
    { id: "stock", width: 100 },
  ];
}

function setup(
  cols?: ResizableColumn[],
  opts: {
    getColumnElement?: (id: string) => HTMLElement | null;
    onResizeEnd?: (cols: ResizableColumn[]) => void;
  } = {},
) {
  const columns = ref(cols ?? makeColumns());
  return {
    ...mountWithSetup(() =>
      useTableColumnsResize({
        columns,
        minColumnWidth: 60,
        ...opts,
      }),
    ),
    columns,
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
    const mocks = mockElements({ name: 200, price: 150, stock: 100 });
    const { result } = setup(undefined, mocks);
    result.handleResizeStart("name", { pageX: 100 } as MouseEvent);

    expect(result.isResizing.value).toBe(true);
    expect(document.body.style.cursor).toBe("col-resize");
    expect(document.body.style.userSelect).toBe("none");

    document.dispatchEvent(new MouseEvent("mouseup"));
  });

  it("handleResizeStart is no-op for non-existent column", () => {
    const { result } = setup();
    result.handleResizeStart("nonexistent", { pageX: 100 } as MouseEvent);
    expect(result.isResizing.value).toBe(false);
  });

  it("onResizeEnd callback is called on mouseup", () => {
    const onResizeEnd = vi.fn();
    const mocks = mockElements({ name: 200, price: 150, stock: 100 });
    const { result } = setup(undefined, { ...mocks, onResizeEnd });
    result.handleResizeStart("name", { pageX: 100 } as MouseEvent);

    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(onResizeEnd).toHaveBeenCalled();
    expect(result.isResizing.value).toBe(false);
  });
});

// Shared WeakMap for mock element widths
const mockElWidths = new WeakMap<object, number>();

function mockElements(widthMap: Record<string, number>, parentRight?: number) {
  const elements = new Map<string, { el: ReturnType<typeof createMockEl> }>();
  const totalWidth = parentRight ?? Object.values(widthMap).reduce((s, w) => s + w, 0);

  let left = 0;
  function createMockEl(width: number) {
    const colLeft = left;
    const colRight = left + width;
    left = colRight;
    const el = {
      getBoundingClientRect: () => ({ width, left: colLeft, right: colRight }),
      style: { transition: "", width: "", minWidth: "", maxWidth: "", flex: "", flexShrink: "" },
      parentElement: {
        getBoundingClientRect: () => ({ right: totalWidth }),
      },
    } as unknown as HTMLElement;
    mockElWidths.set(el, width);
    return el;
  }

  for (const [id, width] of Object.entries(widthMap)) {
    elements.set(id, { el: createMockEl(width) });
  }
  return {
    getColumnElement: (id: string) => elements.get(id)?.el ?? null,
  };
}

const originalGetComputedStyle = window.getComputedStyle;
beforeEach(() => {
  window.getComputedStyle = ((el: Element) => {
    const width = mockElWidths.get(el);
    if (width !== undefined) {
      return { width: `${width}px` } as CSSStyleDeclaration;
    }
    return originalGetComputedStyle(el);
  }) as typeof window.getComputedStyle;
});
afterEach(() => {
  window.getComputedStyle = originalGetComputedStyle;
});

function flushRAF() {
  vi.advanceTimersByTime(16);
}

describe("equal resize across all right neighbors", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("growing a column shrinks all right neighbors equally", () => {
    const cols = [
      { id: "a", width: 300 },
      { id: "b", width: 250 },
      { id: "c", width: 250 },
      { id: "d", width: 200 },
    ];
    const mocks = mockElements({ a: 300, b: 250, c: 250, d: 200 });
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("a", { pageX: 300 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 400 });
    Object.defineProperty(moveEvent, "pageX", { value: 400 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    const totalBefore = 300 + 250 + 250 + 200;
    const totalAfter = columns.value.reduce((s, c) => s + c.width, 0);
    expect(Math.abs(totalAfter - totalBefore)).toBeLessThanOrEqual(columns.value.length);
    expect(columns.value[0].width).toBe(400);
    expect(columns.value[1].width).toBeLessThan(250);
    expect(columns.value[2].width).toBeLessThan(250);
    expect(columns.value[3].width).toBeLessThan(200);
  });

  it("stops when all right neighbors hit minColumnWidth", () => {
    const cols = [
      { id: "a", width: 200 },
      { id: "b", width: 80 },
      { id: "c", width: 80 },
    ];
    const mocks = mockElements({ a: 200, b: 80, c: 80 });
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("a", { pageX: 200 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 600 });
    Object.defineProperty(moveEvent, "pageX", { value: 600 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    // B and C can only give 20px each (80-60=20), total = 40
    expect(columns.value[1].width).toBe(60);
    expect(columns.value[2].width).toBe(60);
    expect(columns.value[0].width).toBe(240);
  });

  it("shrinking a column grows right neighbors proportionally", () => {
    const cols = [
      { id: "a", width: 400 },
      { id: "b", width: 100 },
      { id: "c", width: 100 },
    ];
    const mocks = mockElements({ a: 400, b: 100, c: 100 });
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("a", { pageX: 400 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 300 });
    Object.defineProperty(moveEvent, "pageX", { value: 300 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(columns.value[0].width).toBe(300);
    const neighborTotal = columns.value[1].width + columns.value[2].width;
    expect(neighborTotal).toBe(300); // Gained 100
  });

  it("left columns are not affected during resize", () => {
    const cols = [
      { id: "a", width: 200 },
      { id: "b", width: 200 },
      { id: "c", width: 200 },
    ];
    const mocks = mockElements({ a: 200, b: 200, c: 200 });
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("b", { pageX: 400 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 450 });
    Object.defineProperty(moveEvent, "pageX", { value: 450 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(columns.value[0].width).toBe(200); // A unchanged
    expect(columns.value[1].width).toBeGreaterThan(200); // B grew
    expect(columns.value[2].width).toBeLessThan(200); // C shrunk
  });

  it("last column grows into filler without neighbors", () => {
    const cols = [
      { id: "a", width: 200 },
      { id: "b", width: 200 },
    ];
    // parentRight = 500 → filler ~100
    const mocks = mockElements({ a: 200, b: 200 }, 500);
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("b", { pageX: 400 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 450 });
    Object.defineProperty(moveEvent, "pageX", { value: 450 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(columns.value[1].width).toBe(250);
    expect(columns.value[0].width).toBe(200); // Unchanged
  });

  it("pins all columns to DOM widths on drag start (flex-shrink fix)", () => {
    const cols = [
      { id: "a", width: 500 },
      { id: "b", width: 500 },
    ];
    // DOM says 300+300 (flex-shrunk from stored 500+500)
    const mocks = mockElements({ a: 300, b: 300 });
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("a", { pageX: 300 } as MouseEvent);

    expect(columns.value[0].width).toBe(300);
    expect(columns.value[1].width).toBe(300);

    document.dispatchEvent(new MouseEvent("mouseup"));
  });

  it("neighbor give + filler combined for max growth", () => {
    const cols = [
      { id: "a", width: 200 },
      { id: "b", width: 100 },
    ];
    // parentRight = 350 → filler = 50. Neighbor give = 100-60=40. Max = 90.
    const mocks = mockElements({ a: 200, b: 100 }, 350);
    const { result, columns } = setup(cols, mocks);

    result.handleResizeStart("a", { pageX: 200 } as MouseEvent);
    const moveEvent = new MouseEvent("mousemove", { clientX: 400 });
    Object.defineProperty(moveEvent, "pageX", { value: 400 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(columns.value[0].width).toBe(290); // Grew by 90
    expect(columns.value[1].width).toBe(60); // At min
  });
});
