/**
 * Unit tests for useDataTableOrchestrator
 *
 * Tests that the orchestrator is independently testable without mounting
 * VcDataTable. Uses a withSetup helper to provide Vue setup context
 * (required for watchers, lifecycle hooks, and inject calls within
 * sub-composables).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, ref, computed } from "vue";
import type { Ref, ComputedRef } from "vue";
import { useDataTableOrchestrator } from "./useDataTableOrchestrator";
import type { VcDataTableOrchestratorOptions } from "./useDataTableOrchestrator";
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";

// ============================================================================
// withSetup helper
// ============================================================================

function withSetup<T>(composable: () => T): { result: T; app: ReturnType<typeof createApp> } {
  let result!: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    },
  });
  app.mount(document.createElement("div"));
  return { result, app };
}

// ============================================================================
// Test helpers
// ============================================================================

type TestItem = { id: string; name: string; [key: string]: unknown };

function buildOptions(overrides: Partial<VcDataTableOrchestratorOptions<TestItem>> = {}): VcDataTableOrchestratorOptions<TestItem> {
  const items = ref<TestItem[]>([]) as Ref<TestItem[]>;
  const visibleColumns = computed<ColumnInstance[]>(() => []);
  const declaredColumns = computed<ColumnInstance[]>(() => []);
  const dataDiscoveredColumns = computed<ColumnInstance[]>(() => []);
  const hiddenColumnIds = ref<Set<string>>(new Set());
  const shownDataDiscoveredColumnIds = ref<Set<string>>(new Set());
  const tableContainerRef = ref<HTMLElement | null>(null);

  const getItemKey = (item: TestItem, index: number): string => {
    return item.id ?? `row-${index}`;
  };

  const props = {
    items: [],
    dataKey: "id",
    selectionMode: undefined,
    isRowSelectable: undefined,
    selectAll: false,
    editMode: undefined,
    sortField: undefined,
    sortOrder: 0,
    sortMode: "single" as const,
    multiSortMeta: [],
    removableSort: false,
    striped: false,
    bordered: false,
    showGridlines: false,
    rowHover: true,
    size: "normal" as const,
    variant: "default" as const,
    resizableColumns: true,
    reorderableColumns: true,
    reorderableRows: false,
    showAllColumns: true,
    scrollable: false,
    scrollHeight: undefined,
    loading: false,
    expandedRows: [],
    expandedRowIcon: "lucide-chevron-down",
    collapsedRowIcon: "lucide-chevron-right",
    groupRowsBy: undefined,
    rowGroupMode: "subheader" as const,
    expandableRowGroups: false,
    expandedRowGroups: undefined,
    rowActionsMode: "inline" as const,
    maxQuickActions: 4,
    pullToRefresh: false,
    pullToRefreshText: undefined,
    totalCount: undefined,
    totalLabel: undefined,
    selectAllActive: false,
    addRow: undefined,
    validationRules: undefined,
    pagination: undefined,
    infiniteScroll: false,
    infiniteScrollDistance: 100,
    globalFilters: undefined,
    columnSwitcher: true as const,
    stateStorage: "local" as const,
    searchable: false,
    searchValue: undefined,
    searchPlaceholder: "Search...",
    emptyState: undefined,
    notFoundState: undefined,
    searchDebounce: 300,
    activeItemId: undefined,
  };

  const emit = vi.fn() as any;

  return {
    props,
    emit,
    visibleColumns,
    declaredColumns,
    dataDiscoveredColumns,
    hiddenColumnIds,
    shownDataDiscoveredColumnIds,
    getItemKey,
    tableContainerRef,
    ...overrides,
  } as VcDataTableOrchestratorOptions<TestItem>;
}

// ============================================================================
// Tests
// ============================================================================

describe("useDataTableOrchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns selection state with correct initial values", () => {
    const options = buildOptions();
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      expect(result).toBeDefined();
      expect(result.selection).toBeDefined();
      // internalSelection should start as an empty array
      expect(result.selection.internalSelection.value).toEqual([]);
      // No items selected, so allSelected / someSelected should be false
      expect(result.selection.allSelected.value).toBe(false);
      expect(result.selection.someSelected.value).toBe(false);
    } finally {
      app.unmount();
    }
  });

  it("returns sort state with reactive refs", () => {
    const options = buildOptions();
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      expect(result.sort).toBeDefined();
      // getSortDirection and getSortIndex should be functions
      expect(typeof result.sort.getSortDirection).toBe("function");
      expect(typeof result.sort.getSortIndex).toBe("function");
      // handleSort should be a function
      expect(typeof result.sort.handleSort).toBe("function");
    } finally {
      app.unmount();
    }
  });

  it("handleSort emits sort event with correct shape", () => {
    const emit = vi.fn() as any;
    const options = buildOptions({ emit });
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      // handleSort takes a VcColumnProps object (which gets mapped to sortField via getSortField)
      const mockCol = { id: "name", field: "name", title: "Name" };
      result.handleSort(mockCol as any);

      // The "sort" event should have been emitted (wrapped in update:sortField/sortOrder calls)
      const sortCall = emit.mock.calls.find((call: [string, ...unknown[]]) => call[0] === "sort");
      expect(sortCall).toBeDefined();
      // Sort event payload should have sortField and sortOrder
      const payload = sortCall[1] as { sortField?: string; sortOrder?: number };
      expect(typeof payload).toBe("object");
    } finally {
      app.unmount();
    }
  });

  it("displayItems reflects input items array", () => {
    const testItems: TestItem[] = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];
    const options = buildOptions({
      props: {
        ...buildOptions().props,
        items: testItems,
        reorderableRows: false,
      },
    });
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      // displayItems should return items as-is when no row reorder drag is active
      expect(result.displayItems.value).toEqual(testItems);
    } finally {
      app.unmount();
    }
  });

  it("effectiveSelectionMode returns undefined when no selection configured", () => {
    const options = buildOptions();
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      expect(result.effectiveSelectionMode.value).toBeUndefined();
    } finally {
      app.unmount();
    }
  });

  it("effectiveSelectionMode returns props.selectionMode when set", () => {
    const options = buildOptions({
      props: {
        ...buildOptions().props,
        selectionMode: "multiple",
      },
    });
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      expect(result.effectiveSelectionMode.value).toBe("multiple");
    } finally {
      app.unmount();
    }
  });

  it("handleColumnVisibilityChange updates hiddenColumnIds", () => {
    const hiddenColumnIds = ref<Set<string>>(new Set());
    const shownDataDiscoveredColumnIds = ref<Set<string>>(new Set());
    const declaredColumns = computed<ColumnInstance[]>(() => [
      { instance: null as any, props: { id: "name", field: "name", title: "Name" } as any, slots: {} as any },
      { instance: null as any, props: { id: "email", field: "email", title: "Email" } as any, slots: {} as any },
    ]);

    const options = buildOptions({ hiddenColumnIds, shownDataDiscoveredColumnIds, declaredColumns });
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      // Hide "email" column — pass only "name" as visible
      result.handleColumnVisibilityChange(["name"]);
      expect(hiddenColumnIds.value.has("email")).toBe(true);
      expect(hiddenColumnIds.value.has("name")).toBe(false);
    } finally {
      app.unmount();
    }
  });

  it("safeColumns filters null/undefined entries", () => {
    const options = buildOptions();
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      // With no columns defined, safeColumns should be an empty array (no nulls)
      expect(Array.isArray(result.safeColumns.value)).toBe(true);
      expect(result.safeColumns.value.every((col) => col != null && col.props != null)).toBe(true);
    } finally {
      app.unmount();
    }
  });

  it("isInlineEditing is false when editMode is not inline and inlineEdit is not active", () => {
    const options = buildOptions();
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      expect(result.isInlineEditing.value).toBe(false);
    } finally {
      app.unmount();
    }
  });

  it("computedVariant returns 'striped' when props.striped is true", () => {
    const options = buildOptions({
      props: {
        ...buildOptions().props,
        striped: true,
      },
    });
    const { result, app } = withSetup(() => useDataTableOrchestrator<TestItem>(options));

    try {
      expect(result.computedVariant.value).toBe("striped");
    } finally {
      app.unmount();
    }
  });
});
