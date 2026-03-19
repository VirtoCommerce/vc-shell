import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableInlineEdit } from "./useTableInlineEdit";

type Item = { id: string; name: string; price: number };

function setup(opts: { onCellUpdate?: any; onSave?: any; onCancel?: any } = {}) {
  const items = ref<Item[]>([
    { id: "1", name: "Apple", price: 1 },
    { id: "2", name: "Banana", price: 2 },
  ]);
  return {
    ...mountWithSetup(() => useTableInlineEdit({ items, ...opts })),
    items,
  };
}

describe("useTableInlineEdit", () => {
  it("isEditing starts as false", () => {
    const { result } = setup();
    expect(result.isEditing.value).toBe(false);
  });

  it("startEditing sets isEditing to true", () => {
    const { result } = setup();
    result.startEditing();
    expect(result.isEditing.value).toBe(true);
  });

  it("cancelEditing restores original values", () => {
    const { result, items } = setup();
    result.startEditing();
    items.value[0].name = "CHANGED";
    result.cancelEditing();
    expect(items.value[0].name).toBe("Apple");
    expect(result.isEditing.value).toBe(false);
  });

  it("cancelEditing calls onCancel callback", () => {
    const onCancel = vi.fn();
    const { result } = setup({ onCancel });
    result.startEditing();
    result.cancelEditing();
    expect(onCancel).toHaveBeenCalled();
  });

  it("updateCell modifies the item and tracks modification", () => {
    const { result, items } = setup();
    result.startEditing();
    result.updateCell(0, "name", "Avocado");
    expect(items.value[0].name).toBe("Avocado");
    expect(result.isCellDirty(0, "name")).toBe(true);
    expect(result.isCellDirty(0, "price")).toBe(false);
  });

  it("updateCell is no-op for invalid rowIndex", () => {
    const { result } = setup();
    result.startEditing();
    result.updateCell(-1, "name", "X");
    result.updateCell(99, "name", "X");
    // Should not throw
  });

  it("getCellValue returns current value", () => {
    const { result } = setup();
    expect(result.getCellValue(0, "name")).toBe("Apple");
    expect(result.getCellValue(0, "price")).toBe(1);
  });

  it("getCellValue returns undefined for invalid index", () => {
    const { result } = setup();
    expect(result.getCellValue(-1, "name")).toBeUndefined();
    expect(result.getCellValue(99, "name")).toBeUndefined();
  });

  it("pendingChanges tracks actual changes vs snapshot", () => {
    const { result } = setup();
    result.startEditing();
    result.updateCell(0, "price", 99);
    const changes = result.pendingChanges.value;
    expect(changes).toHaveLength(1);
    expect(changes[0].field).toBe("price");
    expect(changes[0].oldValue).toBe(1);
    expect(changes[0].newValue).toBe(99);
  });

  it("isDirty reflects whether there are changes", () => {
    const { result } = setup();
    result.startEditing();
    expect(result.isDirty.value).toBe(false);
    result.updateCell(0, "name", "Changed");
    expect(result.isDirty.value).toBe(true);
  });

  it("addRow appends a new item", () => {
    const { result, items } = setup();
    result.startEditing();
    result.addRow({ id: "3", name: "Cherry", price: 3 });
    expect(items.value).toHaveLength(3);
    expect(items.value[2].name).toBe("Cherry");
  });

  it("removeRow removes an item and reindexes modified cells", () => {
    const { result, items } = setup();
    result.startEditing();
    result.updateCell(1, "name", "BananaX");
    result.removeRow(0);
    expect(items.value).toHaveLength(1);
    // Row 1 became row 0 after removal
    expect(result.isCellDirty(0, "name")).toBe(true);
  });

  it("removeRow is no-op for invalid index", () => {
    const { result, items } = setup();
    result.startEditing();
    result.removeRow(-1);
    result.removeRow(99);
    expect(items.value).toHaveLength(2);
  });

  it("getCellEditProps returns correct props shape", () => {
    const { result } = setup();
    result.startEditing();
    const props = result.getCellEditProps(0, "price", { required: true });
    expect(props.editable).toBe(true);
    expect(props.fieldId).toBe("price");
    expect(props.fieldName).toBe("price_0");
    expect(props.rowIndex).toBe(0);
    expect(props.rules).toEqual({ required: true });
    expect(typeof props.onUpdate).toBe("function");
    expect(typeof props.onBlur).toBe("function");
  });

  it("getCellEditProps.editable is false when not editing", () => {
    const { result } = setup();
    const props = result.getCellEditProps(0, "price");
    expect(props.editable).toBe(false);
  });

  it("onCellUpdate callback is called", () => {
    const onCellUpdate = vi.fn();
    const { result } = setup({ onCellUpdate });
    result.startEditing();
    result.updateCell(0, "name", "X");
    expect(onCellUpdate).toHaveBeenCalledWith(0, "name", "X", expect.any(Object));
  });

  it("newRowIndices tracks added rows and clearNewRowFlag works", () => {
    const { result } = setup();
    result.startEditing();
    result.addRow({ id: "3", name: "Cherry", price: 3 });
    expect(result.newRowIndices.value.has(2)).toBe(true);
    result.clearNewRowFlag(2);
    expect(result.newRowIndices.value.has(2)).toBe(false);
  });
});
