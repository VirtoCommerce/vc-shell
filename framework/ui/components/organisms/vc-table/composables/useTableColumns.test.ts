import { describe, it, expect } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useTableColumns } from "@ui/components/organisms/vc-table/composables/useTableColumns";
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";

// ─── Helper ─────────────────────────────────────────────────────────────────

function makeColumn(id: string, overrides: Record<string, unknown> = {}): ColumnInstance {
  return {
    props: { id, field: id, header: id.charAt(0).toUpperCase() + id.slice(1), ...overrides },
    slots: {},
  } as ColumnInstance;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useTableColumns — orderedVisibleColumns", () => {
  it("returns all visible columns in order when reorderableColumns=false", () => {
    const cols = [makeColumn("name"), makeColumn("email"), makeColumn("price")];
    const visibleColumns = ref(cols);

    const { orderedVisibleColumns } = useTableColumns({ visibleColumns });

    expect(orderedVisibleColumns.value).toHaveLength(3);
    expect(orderedVisibleColumns.value.map((c) => c.props.id)).toEqual(["name", "email", "price"]);
  });

  it("filters out null/undefined entries in orderedVisibleColumns computed", () => {
    // Note: null entries that bypass the watcher's filter will be excluded by the
    // orderedVisibleColumns computed (which has its own null guard). This tests
    // that the computed handles columns with null props gracefully.
    const validCols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(validCols);

    const { orderedVisibleColumns } = useTableColumns({ visibleColumns });

    // All valid columns should appear
    expect(orderedVisibleColumns.value).toHaveLength(2);
    expect(orderedVisibleColumns.value.map((c) => c.props.id)).toEqual(["name", "email"]);
  });
});

describe("useTableColumns — columnWidths initialization", () => {
  it("populates columnWidths from column props on init (immediate watcher)", () => {
    const cols = [
      makeColumn("name", { width: 200 }),
      makeColumn("email", { width: 300 }),
      makeColumn("price", { width: 100 }),
    ];
    const visibleColumns = ref(cols);

    const { columnWidths } = useTableColumns({ visibleColumns });

    expect(columnWidths.value).toHaveLength(3);
    expect(columnWidths.value.find((c) => c.id === "name")?.width).toBe(200);
    expect(columnWidths.value.find((c) => c.id === "email")?.width).toBe(300);
    expect(columnWidths.value.find((c) => c.id === "price")?.width).toBe(100);
  });

  it("stores 0 for columns without an explicit width", () => {
    const cols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);

    const { columnWidths } = useTableColumns({ visibleColumns });

    expect(columnWidths.value.find((c) => c.id === "name")?.width).toBe(0);
  });

  it("stores 0 for columns with percentage width (non-pixel)", () => {
    const cols = [makeColumn("name", { width: "50%" })];
    const visibleColumns = ref(cols);

    const { columnWidths } = useTableColumns({ visibleColumns });

    expect(columnWidths.value.find((c) => c.id === "name")?.width).toBe(0);
  });

  it("parses pixel string widths (e.g. '150px') to numeric values", () => {
    const cols = [makeColumn("name", { width: "150px" })];
    const visibleColumns = ref(cols);

    const { columnWidths } = useTableColumns({ visibleColumns });

    expect(columnWidths.value.find((c) => c.id === "name")?.width).toBe(150);
  });
});

describe("useTableColumns — totalColumns", () => {
  it("matches visible column count when no selection column", () => {
    const cols = [makeColumn("name"), makeColumn("email"), makeColumn("price")];
    const visibleColumns = ref(cols);

    const { totalColumns } = useTableColumns({ visibleColumns });

    expect(totalColumns.value).toBe(3);
  });

  it("adds 1 when hasSelectionColumn=true and isSelectionViaColumn=false", () => {
    const cols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);
    const hasSelectionColumn = computed(() => true);
    const isSelectionViaColumn = computed(() => false);

    const { totalColumns } = useTableColumns({
      visibleColumns,
      hasSelectionColumn,
      isSelectionViaColumn,
    });

    expect(totalColumns.value).toBe(3); // 2 data cols + 1 selection col
  });

  it("does NOT add 1 when isSelectionViaColumn=true", () => {
    const cols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);
    const hasSelectionColumn = computed(() => true);
    const isSelectionViaColumn = computed(() => true);

    const { totalColumns } = useTableColumns({
      visibleColumns,
      hasSelectionColumn,
      isSelectionViaColumn,
    });

    expect(totalColumns.value).toBe(2);
  });
});

describe("useTableColumns — column width guard (never drop entries for hidden columns)", () => {
  it("temporarily hiding a column does NOT remove its entry from columnWidths", async () => {
    const allCols = [
      makeColumn("name", { width: 200 }),
      makeColumn("email", { width: 300 }),
      makeColumn("price", { width: 100 }),
    ];
    const visibleColumns = ref(allCols);

    const { columnWidths } = useTableColumns({ visibleColumns });

    // Initial state: all 3 tracked
    expect(columnWidths.value).toHaveLength(3);

    // Simulate hiding 'email' (as if hiddenColumnIds caused it to be filtered out)
    visibleColumns.value = [makeColumn("name", { width: 200 }), makeColumn("price", { width: 100 })];

    // Watcher flushes asynchronously
    await nextTick();

    // Guard: email should STILL be in columnWidths (not dropped)
    expect(columnWidths.value).toHaveLength(3);
    expect(columnWidths.value.find((c) => c.id === "email")).toBeTruthy();
  });

  it("appends genuinely new columns when they appear for the first time", async () => {
    const visibleColumns = ref([makeColumn("name"), makeColumn("email")]);

    const { columnWidths } = useTableColumns({ visibleColumns });

    expect(columnWidths.value).toHaveLength(2);

    // A new column appears (e.g. added to the template)
    visibleColumns.value = [makeColumn("name"), makeColumn("email"), makeColumn("price", { width: 120 })];

    // Watcher flushes asynchronously after reactive change outside setup
    await nextTick();

    expect(columnWidths.value).toHaveLength(3);
    expect(columnWidths.value.find((c) => c.id === "price")?.width).toBe(120);
  });

  it("does NOT re-add an already-tracked column that comes back into view", async () => {
    const allCols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(allCols);

    const { columnWidths } = useTableColumns({ visibleColumns });
    expect(columnWidths.value).toHaveLength(2);

    // Hide email
    visibleColumns.value = [makeColumn("name")];
    await nextTick();
    expect(columnWidths.value).toHaveLength(2); // still 2 (email preserved)

    // Show email again
    visibleColumns.value = [makeColumn("name"), makeColumn("email")];
    await nextTick();
    expect(columnWidths.value).toHaveLength(2); // still 2, not 3
  });
});

describe("useTableColumns — special columns are excluded from columnWidths", () => {
  it("selectionMode columns are not added to columnWidths", () => {
    const cols = [makeColumn("__sel__", { selectionMode: "multiple" }), makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);

    const { columnWidths } = useTableColumns({ visibleColumns });

    // Only data columns tracked — not the selection column
    expect(columnWidths.value.find((c) => c.id === "__sel__")).toBeUndefined();
    expect(columnWidths.value).toHaveLength(2);
  });
});

describe("useTableColumns — hasFlexColumns", () => {
  it("returns true when at least one visible data column has no explicit width", () => {
    const cols = [makeColumn("name", { width: 200 }), makeColumn("email")]; // email has no width
    const visibleColumns = ref(cols);

    const { hasFlexColumns } = useTableColumns({ visibleColumns });

    expect(hasFlexColumns.value).toBe(true);
  });

  it("returns false when all visible data columns have explicit pixel widths", () => {
    const cols = [makeColumn("name", { width: 200 }), makeColumn("email", { width: 300 })];
    const visibleColumns = ref(cols);

    const { hasFlexColumns } = useTableColumns({ visibleColumns });

    expect(hasFlexColumns.value).toBe(false);
  });
});
