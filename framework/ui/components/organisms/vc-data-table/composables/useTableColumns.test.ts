import { describe, it, expect } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useTableColumns } from "@ui/components/organisms/vc-data-table/composables/useTableColumns";
import type { ColumnInstance } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";
import type { VcColumnProps } from "@ui/components/organisms/vc-data-table/types";

// ─── Helper ─────────────────────────────────────────────────────────────────

function makeColumn(id: string, overrides: Record<string, unknown> = {}): ColumnInstance {
  return {
    props: { id, field: id, header: id.charAt(0).toUpperCase() + id.slice(1), ...overrides },
    slots: {},
  } as ColumnInstance;
}

const DEFAULT_AVAILABLE_WIDTH = 1000;

function createOptions(overrides: Record<string, unknown> = {}) {
  return {
    getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useTableColumns — orderedVisibleColumns", () => {
  it("returns all visible columns in order when reorderableColumns=false", () => {
    const cols = [makeColumn("name"), makeColumn("email"), makeColumn("price")];
    const visibleColumns = ref(cols);

    const { orderedVisibleColumns } = useTableColumns({ visibleColumns, ...createOptions() });

    expect(orderedVisibleColumns.value).toHaveLength(3);
    expect(orderedVisibleColumns.value.map((c) => c.props.id)).toEqual(["name", "email", "price"]);
  });

  it("filters out null/undefined entries in orderedVisibleColumns computed", () => {
    const validCols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(validCols);

    const { orderedVisibleColumns } = useTableColumns({ visibleColumns, ...createOptions() });

    expect(orderedVisibleColumns.value).toHaveLength(2);
    expect(orderedVisibleColumns.value.map((c) => c.props.id)).toEqual(["name", "email"]);
  });
});

describe("useTableColumns — columnState initialization", () => {
  it("populates columnState specs from column props on init (immediate watcher)", () => {
    const cols = [
      makeColumn("name", { width: 200 }),
      makeColumn("email", { width: 300 }),
      makeColumn("price", { width: 100 }),
    ];
    const visibleColumns = ref(cols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    expect(columnState.value.order).toHaveLength(3);
    expect(columnState.value.order).toEqual(["name", "email", "price"]);
    // All three columns should have specs with normalized weights
    expect(columnState.value.specs["name"]).toBeDefined();
    expect(columnState.value.specs["email"]).toBeDefined();
    expect(columnState.value.specs["price"]).toBeDefined();
    // The immediate watcher assigns equal weights (normalization of zero-init)
    const totalWeight = Object.values(columnState.value.specs).reduce((s, spec) => s + spec.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });

  it("assigns equal weights for columns without an explicit width", () => {
    const cols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    // Both columns get equal weight
    expect(columnState.value.specs["name"].weight).toBeCloseTo(0.5, 2);
    expect(columnState.value.specs["email"].weight).toBeCloseTo(0.5, 2);
  });

  it("handles percentage width columns via weight system", () => {
    const cols = [makeColumn("name", { width: "50%" })];
    const visibleColumns = ref(cols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    // Single column should have weight 1.0 (normalized)
    expect(columnState.value.specs["name"].weight).toBeCloseTo(1.0, 2);
  });

  it("parses pixel string widths (e.g. '150px') into weights", () => {
    const cols = [makeColumn("name", { width: "150px" }), makeColumn("email", { width: "150px" })];
    const visibleColumns = ref(cols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    // Both have equal pixel width, so equal weight
    expect(columnState.value.specs["name"].weight).toBeCloseTo(0.5, 2);
    expect(columnState.value.specs["email"].weight).toBeCloseTo(0.5, 2);
  });
});

describe("useTableColumns — totalColumns", () => {
  it("matches visible column count when no selection column", () => {
    const cols = [makeColumn("name"), makeColumn("email"), makeColumn("price")];
    const visibleColumns = ref(cols);

    const { totalColumns } = useTableColumns({ visibleColumns, ...createOptions() });

    expect(totalColumns.value).toBe(3);
  });

  it("counts only visible columns (selection handled externally)", () => {
    const cols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);

    const { totalColumns } = useTableColumns({ visibleColumns, ...createOptions() });

    // totalColumns simply counts visibleColumns — implicit selection cells
    // are handled by the DOM measurement, not by this composable.
    expect(totalColumns.value).toBe(2);
  });
});

describe("useTableColumns — column state guard (never drop entries for hidden columns)", () => {
  it("temporarily hiding a column does NOT remove its entry from columnState", async () => {
    const allCols = [
      makeColumn("name", { width: 200 }),
      makeColumn("email", { width: 300 }),
      makeColumn("price", { width: 100 }),
    ];
    const visibleColumns = ref(allCols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    // Initial state: all 3 tracked
    expect(columnState.value.order).toHaveLength(3);

    // Simulate hiding 'email' (as if hiddenColumnIds caused it to be filtered out)
    visibleColumns.value = [makeColumn("name", { width: 200 }), makeColumn("price", { width: 100 })];

    // Watcher flushes asynchronously
    await nextTick();

    // Guard: email should STILL be in columnState.order (not dropped)
    expect(columnState.value.order).toHaveLength(3);
    expect(columnState.value.specs["email"]).toBeTruthy();
  });

  it("appends genuinely new columns when they appear for the first time", async () => {
    const visibleColumns = ref([makeColumn("name"), makeColumn("email")]);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    expect(columnState.value.order).toHaveLength(2);

    // A new column appears (e.g. added to the template)
    visibleColumns.value = [makeColumn("name"), makeColumn("email"), makeColumn("price", { width: 120 })];

    // Watcher flushes asynchronously after reactive change outside setup
    await nextTick();

    expect(columnState.value.order).toHaveLength(3);
    expect(columnState.value.specs["price"]).toBeTruthy();
  });

  it("does NOT re-add an already-tracked column that comes back into view", async () => {
    const allCols = [makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(allCols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });
    expect(columnState.value.order).toHaveLength(2);

    // Hide email
    visibleColumns.value = [makeColumn("name")];
    await nextTick();
    expect(columnState.value.order).toHaveLength(2); // still 2 (email preserved)

    // Show email again
    visibleColumns.value = [makeColumn("name"), makeColumn("email")];
    await nextTick();
    expect(columnState.value.order).toHaveLength(2); // still 2, not 3
  });
});

describe("useTableColumns — special columns are excluded from columnState", () => {
  it("selectionMode columns are not added to columnState specs", () => {
    const cols = [makeColumn("__sel__", { selectionMode: "multiple" }), makeColumn("name"), makeColumn("email")];
    const visibleColumns = ref(cols);

    const { columnState } = useTableColumns({ visibleColumns, ...createOptions() });

    // Only data columns tracked — not the selection column
    expect(columnState.value.specs["__sel__"]).toBeUndefined();
    expect(columnState.value.order).toHaveLength(2);
  });
});

describe("useTableColumns — getEffectiveColumnWidth", () => {
  it("returns px string from engine output for data columns", () => {
    const cols = [makeColumn("name", { width: 200 })];
    const visibleColumns = ref(cols);
    const { getEffectiveColumnWidth, engineOutput } = useTableColumns({ visibleColumns, ...createOptions() });
    // Simulate engine output
    engineOutput.value = { widths: { name: 250 }, fillerWidth: 0 };
    expect(getEffectiveColumnWidth({ id: "name" } as VcColumnProps)).toBe("250px");
  });

  it("returns fixed px for special columns", () => {
    const cols = [makeColumn("sel", { selectionMode: "multiple" } as any)];
    const visibleColumns = ref(cols);
    const { getEffectiveColumnWidth } = useTableColumns({ visibleColumns, ...createOptions() });
    expect(getEffectiveColumnWidth({ id: "sel", selectionMode: "multiple" } as unknown as VcColumnProps)).toBe("40px");
  });
});
