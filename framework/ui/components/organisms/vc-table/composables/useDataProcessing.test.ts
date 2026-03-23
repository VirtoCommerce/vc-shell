import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useDataProcessing } from "./useDataProcessing";

type Item = Record<string, any>;

function makeItems(data: Item[]) {
  return ref(data);
}

describe("useDataProcessing", () => {
  // --- Empty / basic ---
  it("returns empty array when items is empty", () => {
    const { processedData, isEmpty } = useDataProcessing({ items: makeItems([]) });
    expect(processedData.value).toEqual([]);
    expect(isEmpty.value).toBe(true);
  });

  it("returns items unchanged when no sorting or grouping", () => {
    const items = makeItems([{ name: "B" }, { name: "A" }]);
    const { processedData } = useDataProcessing({ items });
    expect(processedData.value).toEqual([{ name: "B" }, { name: "A" }]);
  });

  // --- Single sort ---
  it("sorts ascending by string field", () => {
    const items = makeItems([{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("name"),
      sortOrder: ref(1),
    });
    expect(processedData.value.map((i) => i.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("sorts descending by string field", () => {
    const items = makeItems([{ name: "Alice" }, { name: "Charlie" }, { name: "Bob" }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("name"),
      sortOrder: ref(-1),
    });
    expect(processedData.value.map((i) => i.name)).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("sorts numbers correctly", () => {
    const items = makeItems([{ price: 100 }, { price: 10 }, { price: 50 }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("price"),
      sortOrder: ref(1),
    });
    expect(processedData.value.map((i) => i.price)).toEqual([10, 50, 100]);
  });

  it("handles null values in sort (nulls last ascending)", () => {
    const items = makeItems([{ val: null }, { val: "A" }, { val: "B" }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("val"),
      sortOrder: ref(1),
    });
    expect(processedData.value.map((i) => i.val)).toEqual(["A", "B", null]);
  });

  it("resolves nested dot-notation fields", () => {
    const items = makeItems([
      { address: { city: "Paris" } },
      { address: { city: "Amsterdam" } },
      { address: { city: "Berlin" } },
    ]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("address.city"),
      sortOrder: ref(1),
    });
    expect(processedData.value.map((i) => i.address.city)).toEqual(["Amsterdam", "Berlin", "Paris"]);
  });

  // --- Multi sort ---
  it("sorts by multiple fields", () => {
    const items = makeItems([
      { category: "B", name: "Z" },
      { category: "A", name: "Y" },
      { category: "A", name: "X" },
      { category: "B", name: "W" },
    ]);
    const { processedData } = useDataProcessing({
      items,
      sortMode: ref("multiple" as "single" | "multiple"),
      multiSortMeta: ref([
        { field: "category", order: 1 },
        { field: "name", order: 1 },
      ]),
    });
    expect(processedData.value.map((i) => `${i.category}:${i.name}`)).toEqual(["A:X", "A:Y", "B:W", "B:Z"]);
  });

  // --- Lazy mode ---
  it("skips sorting in lazy mode", () => {
    const items = makeItems([{ name: "B" }, { name: "A" }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("name"),
      sortOrder: ref(1),
      lazy: ref(true),
    });
    expect(processedData.value.map((i) => i.name)).toEqual(["B", "A"]);
  });

  // --- Grouping ---
  it("groups data by field (sorts by group field)", () => {
    const items = makeItems([
      { category: "B", name: "item1" },
      { category: "A", name: "item2" },
      { category: "B", name: "item3" },
    ]);
    const { processedData } = useDataProcessing({
      items,
      groupRowsBy: ref("category"),
    });
    // Grouped data is sorted by category
    expect(processedData.value[0].category).toBe("A");
    expect(processedData.value[1].category).toBe("B");
    expect(processedData.value[2].category).toBe("B");
  });

  // --- onSortChange callback ---
  it("calls onSortChange when sorting is applied", () => {
    const onSortChange = vi.fn();
    const items = makeItems([{ name: "B" }, { name: "A" }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("name"),
      sortOrder: ref(1),
      onSortChange,
    });
    // Computed is lazy — access it to trigger the callback
    void processedData.value;
    expect(onSortChange).toHaveBeenCalled();
  });

  // --- Date sorting ---
  it("sorts Date objects correctly", () => {
    const d1 = new Date("2020-01-01");
    const d2 = new Date("2022-06-15");
    const d3 = new Date("2021-03-10");
    const items = makeItems([{ date: d2 }, { date: d1 }, { date: d3 }]);
    const { processedData } = useDataProcessing({
      items,
      sortField: ref("date"),
      sortOrder: ref(1),
    });
    expect(processedData.value.map((i) => i.date)).toEqual([d1, d3, d2]);
  });
});
