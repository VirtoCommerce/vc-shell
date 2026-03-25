import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableExpansion } from "./useTableExpansion";

type Item = { id: string; name: string };

const getItemKey = (item: Item) => item.id;

function setup(expandedRows?: Item[]) {
  return mountWithSetup(() =>
    useTableExpansion<Item>({
      expandedRows: ref(expandedRows),
      getItemKey,
    }),
  );
}

describe("useTableExpansion", () => {
  it("starts with no expanded rows", () => {
    const { result } = setup();
    expect(result.internalExpandedRows.value).toEqual([]);
    expect(result.expandedRowKeys.value.size).toBe(0);
  });

  it("initializes from expandedRows prop", () => {
    const item = { id: "1", name: "A" };
    const { result } = setup([item]);
    expect(result.internalExpandedRows.value).toHaveLength(1);
    expect(result.isRowExpanded(item, 0)).toBe(true);
  });

  it("expandRow adds a row", () => {
    const { result } = setup();
    const item = { id: "2", name: "B" };
    const event = result.expandRow(item, 0);
    expect(result.isRowExpanded(item, 0)).toBe(true);
    expect(event.data).toBe(item);
  });

  it("expandRow is idempotent", () => {
    const { result } = setup();
    const item = { id: "2", name: "B" };
    result.expandRow(item, 0);
    result.expandRow(item, 0);
    expect(result.internalExpandedRows.value).toHaveLength(1);
  });

  it("collapseRow removes a row", () => {
    const item = { id: "1", name: "A" };
    const { result } = setup([item]);
    result.collapseRow(item, 0);
    expect(result.isRowExpanded(item, 0)).toBe(false);
    expect(result.internalExpandedRows.value).toHaveLength(0);
  });

  it("toggleRowExpansion toggles state", () => {
    const { result } = setup();
    const item = { id: "3", name: "C" };
    const event = new Event("click");
    // Use a mock event with stopPropagation
    const mockEvent = { ...event, stopPropagation: () => {} } as unknown as Event;

    result.toggleRowExpansion(item, 0, mockEvent);
    expect(result.isRowExpanded(item, 0)).toBe(true);

    result.toggleRowExpansion(item, 0, mockEvent);
    expect(result.isRowExpanded(item, 0)).toBe(false);
  });

  it("expandAll expands all provided items", () => {
    const { result } = setup();
    const items = [
      { id: "1", name: "A" },
      { id: "2", name: "B" },
    ];
    result.expandAll(items);
    expect(result.internalExpandedRows.value).toHaveLength(2);
    expect(result.isRowExpanded(items[0], 0)).toBe(true);
    expect(result.isRowExpanded(items[1], 1)).toBe(true);
  });

  it("collapseAll clears all expanded rows", () => {
    const items = [
      { id: "1", name: "A" },
      { id: "2", name: "B" },
    ];
    const { result } = setup(items);
    result.collapseAll();
    expect(result.internalExpandedRows.value).toHaveLength(0);
  });

  it("expandedRowKeys is reactive computed set", () => {
    const { result } = setup();
    const item = { id: "X", name: "X" };
    expect(result.expandedRowKeys.value.has("X")).toBe(false);
    result.expandRow(item, 0);
    expect(result.expandedRowKeys.value.has("X")).toBe(true);
  });
});
