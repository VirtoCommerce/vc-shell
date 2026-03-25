import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableColumnsReorder, type ReorderableColumn } from "./useTableColumnsReorder";

function setup(cols: ReorderableColumn[], onReorderEnd?: (cols: ReorderableColumn[]) => void) {
  const columns = ref(cols);
  return {
    ...mountWithSetup(() => useTableColumnsReorder({ columns, onReorderEnd })),
    columns,
  };
}

describe("useTableColumnsReorder", () => {
  it("isDragging starts as false", () => {
    const { result } = setup([{ id: "a" }, { id: "b" }]);
    expect(result.isDragging.value).toBe(false);
  });

  it("handleDragStart sets isDragging to true", () => {
    const { result } = setup([{ id: "a" }, { id: "b" }]);
    const mockTransfer = {
      effectAllowed: "",
      setData: vi.fn(),
      setDragImage: vi.fn(),
    };
    const mockEvent = {
      dataTransfer: mockTransfer,
      target: {
        closest: () => ({
          classList: { add: vi.fn() },
          addEventListener: vi.fn(),
        }),
      },
    } as unknown as DragEvent;

    result.handleDragStart("a", mockEvent);
    expect(result.isDragging.value).toBe(true);
  });

  it("handleDragStart is no-op without dataTransfer", () => {
    const { result } = setup([{ id: "a" }]);
    const mockEvent = { dataTransfer: null } as unknown as DragEvent;
    result.handleDragStart("a", mockEvent);
    expect(result.isDragging.value).toBe(false);
  });

  it("handleDrop calls cleanup and onReorderEnd callback", () => {
    const onReorderEnd = vi.fn();
    const { result } = setup([{ id: "a" }, { id: "b" }], onReorderEnd);

    // Start drag first
    const mockTransfer = { effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() };
    const startEvent = {
      dataTransfer: mockTransfer,
      target: {
        closest: () => ({
          classList: { add: vi.fn() },
          addEventListener: vi.fn(),
        }),
      },
    } as unknown as DragEvent;
    result.handleDragStart("a", startEvent);

    // Drop
    const dropEvent = { preventDefault: vi.fn() } as unknown as DragEvent;
    result.handleDrop(dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(result.isDragging.value).toBe(false);
    expect(onReorderEnd).toHaveBeenCalled();
  });

  it("handleDragEnd cleans up state", () => {
    const { result } = setup([{ id: "a" }, { id: "b" }]);

    // Start drag
    const mockTransfer = { effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() };
    const startEvent = {
      dataTransfer: mockTransfer,
      target: {
        closest: () => ({
          classList: { add: vi.fn() },
          addEventListener: vi.fn(),
        }),
      },
    } as unknown as DragEvent;
    result.handleDragStart("a", startEvent);
    expect(result.isDragging.value).toBe(true);

    result.handleDragEnd();
    expect(result.isDragging.value).toBe(false);
  });

  it("getReorderHeadProps returns object with correct shape", () => {
    const { result } = setup([{ id: "a" }]);
    const props = result.getReorderHeadProps("a");
    expect(props.reorderable).toBe(true);
    expect(props.columnId).toBe("a");
    expect(typeof props.onReorderDragStart).toBe("function");
    expect(typeof props.onReorderDragOver).toBe("function");
    expect(typeof props.onReorderDrop).toBe("function");
    expect(typeof props.onReorderDragEnd).toBe("function");
  });

  it("handleDragOver calls preventDefault on event", () => {
    const { result } = setup([{ id: "a" }, { id: "b" }]);
    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: "" },
      target: { closest: () => null },
      clientX: 0,
    } as unknown as DragEvent;
    result.handleDragOver(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
});
