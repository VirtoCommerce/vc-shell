import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useTableSort } from "@ui/components/organisms/vc-data-table/composables/useTableSort";

function makeOptions(overrides: Partial<Parameters<typeof useTableSort>[0]> = {}) {
  return {
    sortField: ref<string | undefined>(undefined),
    sortOrder: ref<number>(0),
    sortMode: ref<"single" | "multiple">("single"),
    multiSortMeta: ref([]),
    removableSort: ref(true),
    ...overrides,
  };
}

describe("useTableSort — single sort mode", () => {
  it("cycles asc -> desc -> none (removableSort=true)", () => {
    const opts = makeOptions({ removableSort: ref(true) });
    const { handleSort, internalSortField, internalSortOrder, getSortDirection } = useTableSort(opts);

    handleSort("name");
    expect(internalSortField.value).toBe("name");
    expect(internalSortOrder.value).toBe(1);
    expect(getSortDirection("name")).toBe("asc");

    handleSort("name");
    expect(internalSortField.value).toBe("name");
    expect(internalSortOrder.value).toBe(-1);
    expect(getSortDirection("name")).toBe("desc");

    handleSort("name");
    expect(internalSortField.value).toBeUndefined();
    expect(internalSortOrder.value).toBe(0);
    expect(getSortDirection("name")).toBeUndefined();
  });

  it("cycles asc -> desc -> asc (removableSort=false, no reset to none)", () => {
    const opts = makeOptions({ removableSort: ref(false) });
    const { handleSort, internalSortField, internalSortOrder } = useTableSort(opts);

    handleSort("name");
    expect(internalSortOrder.value).toBe(1);

    handleSort("name");
    expect(internalSortOrder.value).toBe(-1);

    // Third click should NOT reset to none — should cycle back to asc
    handleSort("name");
    expect(internalSortField.value).toBe("name");
    expect(internalSortOrder.value).toBe(1);
  });

  it("switching sort field resets to the new field", () => {
    const opts = makeOptions();
    const { handleSort, internalSortField, isSorted } = useTableSort(opts);

    handleSort("name");
    expect(internalSortField.value).toBe("name");
    expect(isSorted("name")).toBe(true);

    handleSort("email");
    expect(internalSortField.value).toBe("email");
    expect(isSorted("email")).toBe(true);
    expect(isSorted("name")).toBe(false);
  });

  it("getSortDirection returns correct direction for sorted and unsorted fields", () => {
    const opts = makeOptions();
    const { handleSort, getSortDirection } = useTableSort(opts);

    expect(getSortDirection("name")).toBeUndefined();
    handleSort("name");
    expect(getSortDirection("name")).toBe("asc");
    expect(getSortDirection("email")).toBeUndefined();
  });

  it("isSorted returns true/false correctly", () => {
    const opts = makeOptions();
    const { handleSort, isSorted } = useTableSort(opts);

    expect(isSorted("name")).toBe(false);
    handleSort("name");
    expect(isSorted("name")).toBe(true);
    // After cycling to none
    handleSort("name");
    handleSort("name");
    expect(isSorted("name")).toBe(false);
  });

  it("onSort callback is called with correct SortEvent payload on each sort change", () => {
    const onSort = vi.fn();
    const opts = makeOptions({ onSort });
    const { handleSort } = useTableSort(opts);

    handleSort("name");
    expect(onSort).toHaveBeenCalledTimes(1);
    expect(onSort).toHaveBeenLastCalledWith({ sortField: "name", sortOrder: 1 });

    handleSort("name");
    expect(onSort).toHaveBeenCalledTimes(2);
    expect(onSort).toHaveBeenLastCalledWith({ sortField: "name", sortOrder: -1 });

    // Third click removes sort (removableSort=true)
    handleSort("name");
    expect(onSort).toHaveBeenCalledTimes(3);
    expect(onSort).toHaveBeenLastCalledWith({ sortField: undefined, sortOrder: 0 });
  });

  it("external prop sync: changing sortField ref externally updates internalSortField", async () => {
    const sortField = ref<string | undefined>(undefined);
    const sortOrder = ref<number>(0);
    const opts = makeOptions({ sortField, sortOrder });
    const { internalSortField, internalSortOrder } = useTableSort(opts);

    // Change external props
    sortField.value = "price";
    sortOrder.value = 1;

    // Wait for the watcher to flush
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(internalSortField.value).toBe("price");
    expect(internalSortOrder.value).toBe(1);
  });
});

describe("useTableSort — multi-sort mode", () => {
  it("regular click on a new field adds it as the sole sort (replaces)", () => {
    const opts = makeOptions({ sortMode: ref<"single" | "multiple">("multiple") });
    const { handleSort, internalMultiSortMeta, getSortDirection } = useTableSort(opts);

    handleSort("name");
    expect(internalMultiSortMeta.value).toHaveLength(1);
    expect(internalMultiSortMeta.value[0]).toEqual({ field: "name", order: 1 });
    expect(getSortDirection("name")).toBe("asc");
  });

  it("ctrl+click on two different fields tracks both in internalMultiSortMeta", () => {
    const opts = makeOptions({ sortMode: ref<"single" | "multiple">("multiple") });
    const { handleSort, internalMultiSortMeta, getSortDirection } = useTableSort(opts);

    const ctrlEvent = { ctrlKey: true } as MouseEvent;
    handleSort("name", ctrlEvent);
    handleSort("email", ctrlEvent);

    expect(internalMultiSortMeta.value).toHaveLength(2);
    expect(getSortDirection("name")).toBe("asc");
    expect(getSortDirection("email")).toBe("asc");
  });

  it("getSortIndex returns 1-based indices for multi-sort fields (only when >1 field)", () => {
    const opts = makeOptions({ sortMode: ref<"single" | "multiple">("multiple") });
    const { handleSort, getSortIndex } = useTableSort(opts);

    const ctrlEvent = { ctrlKey: true } as MouseEvent;
    handleSort("name", ctrlEvent);
    handleSort("email", ctrlEvent);

    // getSortIndex only returns index when meta.length > 1
    expect(getSortIndex("name")).toBe(1);
    expect(getSortIndex("email")).toBe(2);
    expect(getSortIndex("price")).toBeUndefined();
  });

  it("getSortIndex returns undefined when only one multi-sort field", () => {
    const opts = makeOptions({ sortMode: ref<"single" | "multiple">("multiple") });
    const { handleSort, getSortIndex } = useTableSort(opts);

    handleSort("name");
    // Only one field — getSortIndex returns undefined
    expect(getSortIndex("name")).toBeUndefined();
  });

  it("multi-sort regular click cycles asc -> desc -> none when removableSort=true", () => {
    const opts = makeOptions({
      sortMode: ref<"single" | "multiple">("multiple"),
      removableSort: ref(true),
    });
    const { handleSort, internalMultiSortMeta } = useTableSort(opts);

    handleSort("name");
    expect(internalMultiSortMeta.value[0]?.order).toBe(1);

    handleSort("name");
    expect(internalMultiSortMeta.value[0]?.order).toBe(-1);

    // Third regular click removes it (removableSort=true)
    handleSort("name");
    expect(internalMultiSortMeta.value).toHaveLength(0);
  });

  it("ctrl+click removes a field from multiSortMeta on triple click (removableSort=true)", () => {
    const opts = makeOptions({
      sortMode: ref<"single" | "multiple">("multiple"),
      removableSort: ref(true),
    });
    const { handleSort, internalMultiSortMeta } = useTableSort(opts);

    const ctrlEvent = { ctrlKey: true } as MouseEvent;

    // Add name and email
    handleSort("name", ctrlEvent);
    handleSort("email", ctrlEvent);
    expect(internalMultiSortMeta.value).toHaveLength(2);

    // Cycle name: asc -> desc
    handleSort("name", ctrlEvent);
    expect(internalMultiSortMeta.value.find((m) => m.field === "name")?.order).toBe(-1);

    // Cycle name: desc -> remove
    handleSort("name", ctrlEvent);
    expect(internalMultiSortMeta.value.find((m) => m.field === "name")).toBeUndefined();
    expect(internalMultiSortMeta.value).toHaveLength(1);
    expect(internalMultiSortMeta.value[0].field).toBe("email");
  });

  it("onSort callback in multi-sort mode passes multiSortMeta", () => {
    const onSort = vi.fn();
    const opts = makeOptions({ sortMode: ref<"single" | "multiple">("multiple"), onSort });
    const { handleSort } = useTableSort(opts);

    handleSort("name");
    expect(onSort).toHaveBeenCalledWith({ multiSortMeta: [{ field: "name", order: 1 }] });
  });
});
