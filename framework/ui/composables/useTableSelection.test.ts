import { describe, it, expect, vi } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableSelection } from "./useTableSelection";

// Mock createLogger
vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

interface TestItem {
  id: string;
  name: string;
}

const item1: TestItem = { id: "1", name: "Alice" };
const item2: TestItem = { id: "2", name: "Bob" };
const item3: TestItem = { id: "3", name: "Charlie" };

describe("useTableSelection", () => {
  it("initializes with empty selection", () => {
    const { result } = mountWithSetup(() => useTableSelection<TestItem>());
    expect(result.selectedItems.value).toEqual([]);
    expect(result.selectedIds.value).toEqual([]);
    expect(result.allSelected.value).toBe(false);
    expect(result.selectionCount.value).toBe(0);
    expect(result.hasSelection.value).toBe(false);
  });

  describe("handleSelectionChange", () => {
    it("updates selected items", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectionChange([item1, item2]);
      expect(result.selectedItems.value).toEqual([item1, item2]);
      expect(result.selectedIds.value).toEqual(["1", "2"]);
      expect(result.selectionCount.value).toBe(2);
      expect(result.hasSelection.value).toBe(true);
    });

    it("clears allSelected when items becomes empty", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectAll(true);
      expect(result.allSelected.value).toBe(true);
      result.handleSelectionChange([]);
      expect(result.allSelected.value).toBe(false);
    });
  });

  describe("handleSelectAll", () => {
    it("sets allSelected to true", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectAll(true);
      expect(result.allSelected.value).toBe(true);
    });

    it("clears selection when deselecting all", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectionChange([item1, item2]);
      result.handleSelectAll(false);
      expect(result.allSelected.value).toBe(false);
      expect(result.selectedItems.value).toEqual([]);
    });
  });

  describe("resetSelection", () => {
    it("clears all selection state", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectionChange([item1, item2]);
      result.handleSelectAll(true);
      result.resetSelection();
      expect(result.selectedItems.value).toEqual([]);
      expect(result.allSelected.value).toBe(false);
      expect(result.hasSelection.value).toBe(false);
    });
  });

  describe("isSelected", () => {
    it("returns true for selected item", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectionChange([item1]);
      expect(result.isSelected(item1)).toBe(true);
    });

    it("returns false for unselected item", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.handleSelectionChange([item1]);
      expect(result.isSelected(item2)).toBe(false);
    });

    it("returns false for item without id", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      const noId = { name: "NoId" } as TestItem;
      expect(result.isSelected(noId)).toBe(false);
    });
  });

  describe("selectItems", () => {
    it("programmatically selects items", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.selectItems([item2, item3]);
      expect(result.selectedItems.value).toEqual([item2, item3]);
      expect(result.selectedIds.value).toEqual(["2", "3"]);
    });
  });

  describe("deselectByIds", () => {
    it("removes items by their IDs", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.selectItems([item1, item2, item3]);
      result.deselectByIds(["1", "3"]);
      expect(result.selectedItems.value).toEqual([item2]);
      expect(result.selectedIds.value).toEqual(["2"]);
    });

    it("keeps items without matching id", () => {
      const { result } = mountWithSetup(() => useTableSelection<TestItem>());
      result.selectItems([item1]);
      result.deselectByIds(["999"]);
      expect(result.selectedItems.value).toEqual([item1]);
    });
  });

  describe("custom idField", () => {
    interface CustomItem {
      code: string;
      label: string;
    }

    it("uses a custom key as idField", () => {
      const { result } = mountWithSetup(() => useTableSelection<CustomItem>({ idField: "code" }));
      const a: CustomItem = { code: "A", label: "Item A" };
      const b: CustomItem = { code: "B", label: "Item B" };
      result.selectItems([a, b]);
      expect(result.selectedIds.value).toEqual(["A", "B"]);
      expect(result.isSelected(a)).toBe(true);
    });

    it("uses a function as idField", () => {
      const { result } = mountWithSetup(() => useTableSelection<CustomItem>({ idField: (item) => item.code }));
      const a: CustomItem = { code: "X", label: "Item X" };
      result.selectItems([a]);
      expect(result.selectedIds.value).toEqual(["X"]);
    });

    it("handles idField returning undefined", () => {
      const { result } = mountWithSetup(() => useTableSelection<CustomItem>({ idField: () => undefined }));
      const a: CustomItem = { code: "A", label: "Item A" };
      result.selectItems([a]);
      expect(result.selectedIds.value).toEqual([]);
    });
  });
});
