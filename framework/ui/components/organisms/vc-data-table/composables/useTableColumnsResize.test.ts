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
    // Mock getColumnElement to return fake elements with getBoundingClientRect
    const mockEl = (width: number) =>
      ({
        getBoundingClientRect: () => ({ width, left: 0, right: width }),
        style: { transition: "", width: "", minWidth: "", maxWidth: "", flex: "" },
        parentElement: {
          getBoundingClientRect: () => ({ right: 500 }),
        },
      }) as unknown as HTMLElement;

    const getColumnElement = (id: string) => {
      if (id === "name") return mockEl(200);
      if (id === "price") return mockEl(150);
      if (id === "stock") return mockEl(100);
      return null;
    };

    const { result } = setup(undefined, { getColumnElement });
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
    const mockEl = (width: number) =>
      ({
        getBoundingClientRect: () => ({ width, left: 0, right: width }),
        style: { transition: "", width: "", minWidth: "", maxWidth: "", flex: "" },
        parentElement: { getBoundingClientRect: () => ({ right: 500 }) },
      }) as unknown as HTMLElement;

    const getColumnElement = (id: string) => {
      if (id === "name") return mockEl(200);
      if (id === "price") return mockEl(150);
      if (id === "stock") return mockEl(100);
      return null;
    };

    const { result } = setup(undefined, { getColumnElement, onResizeEnd });
    result.handleResizeStart("name", { pageX: 100 } as MouseEvent);

    // Simulate mouseup
    document.dispatchEvent(new MouseEvent("mouseup"));

    expect(onResizeEnd).toHaveBeenCalled();
    expect(result.isResizing.value).toBe(false);
  });
});
