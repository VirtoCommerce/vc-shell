import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableRowGrouping } from "./useTableRowGrouping";

type Item = { id: string; category: string; name: string };

const items: Item[] = [
  { id: "1", category: "Fruit", name: "Apple" },
  { id: "2", category: "Vegetable", name: "Carrot" },
  { id: "3", category: "Fruit", name: "Banana" },
  { id: "4", category: "Vegetable", name: "Pea" },
];

function setup(
  opts: {
    groupBy?: string | string[];
    expandable?: boolean;
    expandedGroups?: string[];
    onExpandedChange?: (g: string[]) => void;
    onGroupExpand?: (e: { data: string; originalEvent: Event }) => void;
    onGroupCollapse?: (e: { data: string; originalEvent: Event }) => void;
  } = {},
) {
  return mountWithSetup(() =>
    useTableRowGrouping<Item>({
      items: ref([...items]),
      groupRowsBy: ref(opts.groupBy),
      expandableRowGroups: ref(opts.expandable),
      expandedRowGroups: ref(opts.expandedGroups),
      onExpandedRowGroupsChange: opts.onExpandedChange,
      onRowGroupExpand: opts.onGroupExpand,
      onRowGroupCollapse: opts.onGroupCollapse,
    }),
  );
}

describe("useTableRowGrouping", () => {
  it("isGroupingEnabled is false when groupRowsBy is undefined", () => {
    const { result } = setup();
    expect(result.isGroupingEnabled.value).toBe(false);
  });

  it("isGroupingEnabled is true when groupRowsBy is set", () => {
    const { result } = setup({ groupBy: "category" });
    expect(result.isGroupingEnabled.value).toBe(true);
  });

  it("groupedItems returns Map of group key -> items", () => {
    const { result } = setup({ groupBy: "category" });
    expect(result.groupedItems.value).toBeInstanceOf(Map);
    expect(result.groupedItems.value!.get("Fruit")).toHaveLength(2);
    expect(result.groupedItems.value!.get("Vegetable")).toHaveLength(2);
  });

  it("groupedData returns array of GroupedData objects", () => {
    const { result } = setup({ groupBy: "category" });
    const data = result.groupedData.value;
    expect(data).toHaveLength(2);
    expect(data[0].key).toBe("Fruit");
    expect(data[0].count).toBe(2);
    expect(data[0].firstItem.name).toBe("Apple");
  });

  it("groupedItems is null when grouping disabled", () => {
    const { result } = setup();
    expect(result.groupedItems.value).toBeNull();
  });

  it("getItemGroupKey returns correct key", () => {
    const { result } = setup({ groupBy: "category" });
    expect(result.getItemGroupKey(items[0])).toBe("Fruit");
    expect(result.getItemGroupKey(items[1])).toBe("Vegetable");
  });

  // --- Expansion ---
  it("all groups expanded when not expandable", () => {
    const { result } = setup({ groupBy: "category" });
    expect(result.isGroupExpanded("Fruit")).toBe(true);
    expect(result.isGroupExpanded("Vegetable")).toBe(true);
  });

  it("no groups expanded initially when expandable with no expandedRowGroups", () => {
    const { result } = setup({ groupBy: "category", expandable: true });
    expect(result.isGroupExpanded("Fruit")).toBe(false);
    expect(result.isGroupExpanded("Vegetable")).toBe(false);
  });

  it("initializes expanded groups from prop", () => {
    const { result } = setup({ groupBy: "category", expandable: true, expandedGroups: ["Fruit"] });
    expect(result.isGroupExpanded("Fruit")).toBe(true);
    expect(result.isGroupExpanded("Vegetable")).toBe(false);
  });

  it("toggleGroupExpansion expands and collapses", () => {
    const { result } = setup({ groupBy: "category", expandable: true });
    const event = new Event("click");
    result.toggleGroupExpansion("Fruit", event);
    expect(result.isGroupExpanded("Fruit")).toBe(true);
    result.toggleGroupExpansion("Fruit", event);
    expect(result.isGroupExpanded("Fruit")).toBe(false);
  });

  it("expandGroup / collapseGroup work", () => {
    const { result } = setup({ groupBy: "category", expandable: true });
    result.expandGroup("Fruit");
    expect(result.isGroupExpanded("Fruit")).toBe(true);
    result.collapseGroup("Fruit");
    expect(result.isGroupExpanded("Fruit")).toBe(false);
  });

  it("expandAllGroups / collapseAllGroups work", () => {
    const { result } = setup({ groupBy: "category", expandable: true });
    result.expandAllGroups();
    expect(result.isGroupExpanded("Fruit")).toBe(true);
    expect(result.isGroupExpanded("Vegetable")).toBe(true);
    result.collapseAllGroups();
    expect(result.isGroupExpanded("Fruit")).toBe(false);
    expect(result.isGroupExpanded("Vegetable")).toBe(false);
  });

  // --- visibleItems ---
  it("visibleItems shows all items when not expandable", () => {
    const { result } = setup({ groupBy: "category" });
    expect(result.visibleItems.value).toHaveLength(4);
  });

  it("visibleItems filters out collapsed groups", () => {
    const { result } = setup({ groupBy: "category", expandable: true, expandedGroups: ["Fruit"] });
    expect(result.visibleItems.value).toHaveLength(2);
    expect(result.visibleItems.value.every((i) => i.category === "Fruit")).toBe(true);
  });

  it("visibleItems returns all items when grouping disabled", () => {
    const { result } = setup();
    expect(result.visibleItems.value).toHaveLength(4);
  });

  // --- Callbacks ---
  it("calls onExpandedRowGroupsChange", () => {
    const cb = vi.fn();
    const { result } = setup({ groupBy: "category", expandable: true, onExpandedChange: cb });
    result.expandGroup("Fruit");
    expect(cb).toHaveBeenCalledWith(["Fruit"]);
  });

  it("calls onRowGroupExpand and onRowGroupCollapse", () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    const { result } = setup({
      groupBy: "category",
      expandable: true,
      onGroupExpand: onExpand,
      onGroupCollapse: onCollapse,
    });
    const event = new Event("click");
    result.toggleGroupExpansion("Fruit", event);
    expect(onExpand).toHaveBeenCalledWith({ data: "Fruit", originalEvent: event });
    result.toggleGroupExpansion("Fruit", event);
    expect(onCollapse).toHaveBeenCalledWith({ data: "Fruit", originalEvent: event });
  });
});
