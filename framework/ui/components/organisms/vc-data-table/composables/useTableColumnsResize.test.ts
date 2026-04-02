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
    getAllColumnElements?: (id: string) => NodeListOf<Element> | null;
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
  // Clean up any lingering document listeners / styles
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

    // Simulate mouseup to clean up
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

    // Simulate mouseup
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(onResizeEnd).toHaveBeenCalled();
    expect(result.isResizing.value).toBe(false);
  });
});

// Shared WeakMap for mock element widths — used by getComputedStyle mock
const mockElWidths = new WeakMap<object, number>();

// Helper to create mock elements (used by proportional resize tests)
function mockElements(widthMap: Record<string, number>) {
  const elements = new Map<string, { el: ReturnType<typeof createMockEl> }>();

  function createMockEl(width: number) {
    const el = {
      getBoundingClientRect: () => ({ width, left: 0, right: width }),
      style: { transition: "", width: "", minWidth: "", maxWidth: "", flex: "", flexShrink: "" },
      parentElement: {
        getBoundingClientRect: () => ({ right: 1000 }),
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
    getAllColumnElements: () => null,
  };
}

// Mock getComputedStyle for mock elements — returns width based on stored value
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

// Helper: flush requestAnimationFrame in jsdom
function flushRAF() {
  vi.advanceTimersByTime(16);
}

describe("proportional resize", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("distributes delta proportionally across all right neighbors", () => {
    const cols = [
      { id: "a", width: 300 },
      { id: "b", width: 250 },
      { id: "c", width: 250 },
      { id: "d", width: 200 },
    ];
    const mocks = mockElements({ a: 300, b: 250, c: 250, d: 200 });
    const onResizeEnd = vi.fn();
    const { result, columns } = setup(cols, { ...mocks, onResizeEnd });

    result.handleResizeStart("a", new MouseEvent("mousedown", { clientX: 300 }));

    const moveEvent = new MouseEvent("mousemove", { clientX: 400 });
    Object.defineProperty(moveEvent, "pageX", { value: 400 });
    document.dispatchEvent(moveEvent);
    flushRAF();

    document.dispatchEvent(new MouseEvent("mouseup"));

    const totalBefore = 300 + 250 + 250 + 200;
    const totalAfter = columns.value.reduce((s, c) => s + c.width, 0);
    // Rounded on commit — allow ±1 per column for rounding
    expect(Math.abs(totalAfter - totalBefore)).toBeLessThanOrEqual(columns.value.length);
    expect(columns.value[0].width).toBe(400);
    expect(columns.value[1].width).toBeLessThan(250);
    expect(columns.value[2].width).toBeLessThan(250);
    expect(columns.value[3].width).toBeLessThan(200);
  });

  it("stops resize when all right neighbors hit minColumnWidth", () => {
    const cols = [
      { id: "a", width: 200 },
      { id: "b", width: 80 },
      { id: "c", width: 80 },
    ];
    const mocks = mockElements({ a: 200, b: 80, c: 80 });
    const onResizeEnd = vi.fn();
    const { result, columns } = setup(cols, { ...mocks, onResizeEnd });

    result.handleResizeStart("a", new MouseEvent("mousedown", { clientX: 200 }));
    const moveEvent = new MouseEvent("mousemove", { clientX: 600 });
    Object.defineProperty(moveEvent, "pageX", { value: 600 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    // B and C can only give 20px each (80-60=20), total giveable = 40
    expect(columns.value[1].width).toBe(60);
    expect(columns.value[2].width).toBe(60);
    expect(columns.value[0].width).toBe(240);
  });

  it("left columns are not affected during resize", () => {
    const cols = [
      { id: "a", width: 200 },
      { id: "b", width: 200 },
      { id: "c", width: 200 },
    ];
    const mocks = mockElements({ a: 200, b: 200, c: 200 });
    const onResizeEnd = vi.fn();
    const { result, columns } = setup(cols, { ...mocks, onResizeEnd });

    // Resize B (middle column)
    result.handleResizeStart("b", new MouseEvent("mousedown", { clientX: 400 }));
    const moveEvent = new MouseEvent("mousemove", { clientX: 450 });
    Object.defineProperty(moveEvent, "pageX", { value: 450 });
    document.dispatchEvent(moveEvent);
    flushRAF();
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(columns.value[0].width).toBe(200); // A unchanged
    expect(columns.value[1].width).toBeGreaterThan(200); // B grew
    expect(columns.value[2].width).toBeLessThan(200); // C shrunk
  });
});
