import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableEditing } from "./useTableEditing";

type Item = { id: string; name: string; price: number };

function setup(mode: "cell" | "row" | undefined = "cell", editingRows?: Item[]) {
  return mountWithSetup(() =>
    useTableEditing<Item>({
      editMode: ref(mode),
      editingRows: ref(editingRows),
      dataKey: "id",
      getItemKey: (item) => item.id,
    }),
  );
}

describe("useTableEditing — cell mode", () => {
  it("no cell editing by default", () => {
    const { result } = setup("cell");
    expect(result.editingCell.value).toBeNull();
    expect(result.isCellEditing(0, "name")).toBe(false);
  });

  it("startCellEdit sets editing cell and creates meta", () => {
    const { result } = setup("cell");
    const item = { id: "1", name: "A", price: 10 };
    result.startCellEdit(item, "name", 0);
    expect(result.editingCell.value).toEqual({ rowIndex: 0, field: "name" });
    expect(result.isCellEditing(0, "name")).toBe(true);
    expect(result.isCellEditing(0, "price")).toBe(false);
  });

  it("getEditingRowData returns copy from meta", () => {
    const { result } = setup("cell");
    const item = { id: "1", name: "A", price: 10 };
    result.startCellEdit(item, "name", 0);
    const editData = result.getEditingRowData(item, 0);
    expect(editData).not.toBe(item); // should be a clone
    expect(editData.name).toBe("A");
  });

  it("completeCellEdit clears editing state and returns event", () => {
    const { result } = setup("cell");
    const item = { id: "1", name: "A", price: 10 };
    result.startCellEdit(item, "name", 0);
    const event = result.completeCellEdit(item, "name", 0, "B");
    expect(result.editingCell.value).toBeNull();
    expect(event.field).toBe("name");
    expect(event.index).toBe(0);
  });

  it("cancelCellEdit clears editing state", () => {
    const { result } = setup("cell");
    const item = { id: "1", name: "A", price: 10 };
    result.startCellEdit(item, "name", 0);
    result.cancelCellEdit(item, "name", 0);
    expect(result.editingCell.value).toBeNull();
    expect(result.isCellEditing(0, "name")).toBe(false);
  });

  it("isCellEditing returns false when not in cell mode", () => {
    const { result } = setup("row");
    expect(result.isCellEditing(0, "name")).toBe(false);
  });

  it("startCellEdit adds additional field to existing meta", () => {
    const { result } = setup("cell");
    const item = { id: "1", name: "A", price: 10 };
    result.startCellEdit(item, "name", 0);
    result.startCellEdit(item, "price", 0);
    // meta should have both fields tracked
    expect(result.editingMeta.value[0].fields).toContain("name");
    expect(result.editingMeta.value[0].fields).toContain("price");
  });
});

describe("useTableEditing — row mode", () => {
  it("isRowEditing returns false initially", () => {
    const { result } = setup("row");
    expect(result.isRowEditing({ id: "1", name: "A", price: 10 })).toBe(false);
  });

  it("startRowEdit adds row to editing list", () => {
    const { result } = setup("row");
    const item = { id: "1", name: "A", price: 10 };
    result.startRowEdit(item, 0);
    expect(result.isRowEditing(item)).toBe(true);
    expect(result.internalEditingRows.value).toHaveLength(1);
  });

  it("saveRowEdit removes row from editing and returns event", () => {
    const { result } = setup("row");
    const item = { id: "1", name: "A", price: 10 };
    result.startRowEdit(item, 0);

    item.name = "B"; // mutate
    const event = result.saveRowEdit(item, 0);

    expect(result.isRowEditing(item)).toBe(false);
    expect(event.newData.name).toBe("B");
    expect(event.data.name).toBe("A"); // original snapshot
  });

  it("cancelRowEdit restores original data", () => {
    const { result } = setup("row");
    const item = { id: "1", name: "A", price: 10 };
    result.startRowEdit(item, 0);

    item.name = "CHANGED";
    result.cancelRowEdit(item, 0);

    expect(item.name).toBe("A"); // restored
    expect(result.isRowEditing(item)).toBe(false);
  });

  it("startRowEdit is no-op when not in row mode", () => {
    const { result } = setup("cell");
    const item = { id: "1", name: "A", price: 10 };
    result.startRowEdit(item, 0);
    expect(result.internalEditingRows.value).toHaveLength(0);
  });

  it("syncs with external editingRows prop", () => {
    const item = { id: "1", name: "A", price: 10 };
    const { result } = setup("row", [item]);
    expect(result.isRowEditing(item)).toBe(true);
  });
});
