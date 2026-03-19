/**
 * Unit tests for VcDataTable component.
 *
 * Tests essential rendering and prop behavior. The orchestrator composable
 * is mocked so we only verify the component shell, not deep integration.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, computed, defineComponent } from "vue";
import VcDataTable from "./VcDataTable.vue";
import { IsMobileKey } from "@framework/injection-keys";

// ============================================================================
// Mock heavy sub-components to avoid deep rendering
// ============================================================================

vi.mock("@ui/components/organisms/vc-table/components", () => ({
  Table: defineComponent({ name: "Table", template: "<div class='mock-table'><slot /><slot name='row-actions' /><slot name='expansion' /><slot name='empty' /><slot name='loading' /><slot name='groupheader' /><slot name='groupfooter' /></div>" }),
  TableFooter: defineComponent({ name: "TableFooter", template: "<div class='mock-table-footer'><slot /></div>" }),
  TableEmpty: defineComponent({ name: "TableEmpty", props: ["icon", "title", "description", "actionLabel", "actionHandler"], template: "<div class='mock-table-empty'>{{ title }}</div>" }),
  TableRowActions: defineComponent({ name: "TableRowActions", template: "<div />" }),
  DataTableHeader: defineComponent({ name: "DataTableHeader", inheritAttrs: false, template: "<div class='mock-header' />" }),
  DataTableBody: defineComponent({ name: "DataTableBody", inheritAttrs: false, template: "<div class='mock-body'><slot name='empty' /><slot name='loading' /></div>" }),
  GlobalFiltersButton: defineComponent({ name: "GlobalFiltersButton", template: "<button class='mock-gf-btn' />" }),
  GlobalFiltersPanel: defineComponent({ name: "GlobalFiltersPanel", template: "<div />" }),
  TableColumnSwitcher: defineComponent({ name: "TableColumnSwitcher", template: "<div />" }),
  DataTableMobileView: defineComponent({ name: "DataTableMobileView", inheritAttrs: false, template: "<div class='mock-mobile'><slot name='empty' /></div>" }),
  TableAddRowButton: defineComponent({ name: "TableAddRowButton", template: "<div />" }),
  TableSearchHeader: defineComponent({ name: "TableSearchHeader", props: ["searchable", "modelValue", "placeholder"], template: "<div class='mock-search-header'><slot name='actions' /></div>" }),
  TableSelectAllBar: defineComponent({ name: "TableSelectAllBar", template: "<div />" }),
}));

vi.mock("@ui/components/molecules", () => ({
  VcPagination: defineComponent({ name: "VcPagination", template: "<div class='mock-pagination' />" }),
}));

// Build a mock that matches the full orchestrator return shape
function buildOrchestratorMock() {
  return {
    // Sub-composable instances
    selection: {
      internalSelection: ref([]),
      allSelected: computed(() => false),
      someSelected: computed(() => false),
      isSelectAllActive: ref(false),
      showSelectAllChoice: ref(false),
      selectAll: vi.fn(),
      clearSelection: vi.fn(),
      isSelected: vi.fn(() => false),
      canSelect: vi.fn(() => true),
      getSelectionState: vi.fn(),
      selectionInfo: computed(() => ({ count: 0, total: 0 })),
      handleRowSelectionChange: vi.fn(),
      handleSelectAllChange: vi.fn(),
      handleSelectAllBanner: vi.fn(),
      handleClearSelection: vi.fn(),
    },
    sort: {
      sortField: ref(undefined),
      sortOrder: ref(0),
      getSortDirection: vi.fn(() => 0),
      getSortIndex: vi.fn(() => -1),
    },
    editing: {
      editingRows: ref([]),
      handleCellEditInit: vi.fn(),
      handleCellEditComplete: vi.fn(),
      handleCellEditCancel: vi.fn(),
      handleRowEditInit: vi.fn(),
      handleRowEditSave: vi.fn(),
      handleRowEditCancel: vi.fn(),
      getEditingRowData: vi.fn(() => undefined),
      isRowEditing: vi.fn(() => false),
      isCellEditing: vi.fn(() => false),
    },
    expansion: {
      expandedRows: ref([]),
      handleRowToggle: vi.fn(),
    },
    rowGrouping: {
      expandedRowGroups: ref([]),
      handleRowGroupToggle: vi.fn(),
      isGroupingEnabled: ref(false),
      groupedData: ref([]),
      isGroupExpanded: vi.fn(() => false),
      getItemGroupKey: vi.fn(() => ""),
      toggleGroupExpansion: vi.fn(),
    },
    inlineEdit: {
      isEditing: ref(false),
      editedItems: ref([]),
      newRowIndices: ref(new Set()),
      startEditing: vi.fn(),
      cancelEditing: vi.fn(),
      saveEditing: vi.fn(),
      saveChanges: vi.fn(),
      addRow: vi.fn(),
      removeRow: vi.fn(),
      handleCellValueChange: vi.fn(),
      isValid: computed(() => true),
      isDirty: computed(() => false),
      pendingChanges: computed(() => []),
    },
    cols: {
      columnWidths: ref(new Map()),
      columnOrder: ref([]),
      hasFlexColumns: computed(() => false),
      visibleColumns: computed(() => []),
      getEffectiveColumnWidth: vi.fn(() => undefined),
      getHeaderAlign: vi.fn(() => undefined),
      getHeaderStyle: vi.fn(() => ({})),
      isColumnResizable: vi.fn(() => true),
      isColumnReorderable: vi.fn(() => true),
      isLastResizableColumn: vi.fn(() => false),
      getSortField: vi.fn(() => undefined),
      setHeaderRef: vi.fn(),
      getCellStyle: vi.fn(() => ({})),
      getCellAlign: vi.fn(() => undefined),
    },
    statePersistence: {
      saveState: vi.fn(),
      restoreState: vi.fn(),
      clearState: vi.fn(),
    },

    // Column filter helpers
    colFilter: {},
    filterValues: ref({}),
    updateFilter: vi.fn(),
    updateRangeFilter: vi.fn(),
    clearFilter: vi.fn(),
    clearAllFilters: vi.fn(),
    buildPayload: vi.fn(),
    hasActiveFilters: computed(() => false),
    activeFilterCount: computed(() => 0),

    // Column filter template helpers
    showColumnFilter: vi.fn(() => false),
    getColumnFilterType: vi.fn(() => "text"),
    getColumnFilterOptions: vi.fn(() => []),
    isColumnFilterMultiple: vi.fn(() => false),
    getColumnRangeFields: vi.fn(() => undefined),
    getColumnFilterValue: vi.fn(() => undefined),
    handleColumnFilterApply: vi.fn(),
    handleColumnFilterClear: vi.fn(),
    emitFilterPayload: vi.fn(),

    // Global filter
    globalFilterPayload: ref({}),

    // Resize / reorder
    handleResizeStart: vi.fn(),
    isColumnReordering: ref(false),
    handleColumnDragStart: vi.fn(),
    handleColumnDragOver: vi.fn(),
    handleColumnDrop: vi.fn(),

    // Row reorder state
    draggedRow: ref(null),
    pendingReorder: ref(false),
    reorderedItems: ref([]),
    onRowMouseDown: vi.fn(),
    onRowDragStart: vi.fn(),
    onRowDragOver: vi.fn(),
    onRowDragLeave: vi.fn(),
    onRowDragEnd: vi.fn(),
    onRowDrop: vi.fn(),

    // Derived computeds
    displayItems: computed(() => []),
    getGlobalIndex: vi.fn((i: number) => i),
    effectiveSelectionMode: computed(() => undefined),
    selectionColumn: computed(() => undefined),
    hasSelectionColumn: computed(() => false),
    isSelectionViaColumn: computed(() => false),
    isRowReorderEnabled: computed(() => false),
    showRowDragHandle: computed(() => false),
    expanderColumn: computed(() => undefined),
    hasExpanderColumn: computed(() => false),
    computedVariant: computed(() => "default"),
    switcherColumns: computed(() => []),
    switcherVisibleColumnIds: computed(() => new Set()),
    safeColumns: computed(() => []),
    isInlineEditing: computed(() => false),

    // Expansion helper
    isRowExpanded: vi.fn(() => false),
    expandedKeysArray: computed(() => []),

    // Data-discovered IDs
    dataDiscoveredIds: ref(new Set()),

    // Event handlers
    handleSort: vi.fn(),
    handleSelectAllChange: vi.fn(),
    handleRowSelectionChange: vi.fn(),
    handleRowClick: vi.fn(),
    handleAddRow: vi.fn(),
    handleRemoveRow: vi.fn(),
    handleColumnVisibilityChange: vi.fn(),
    handleCellClick: vi.fn(),
    handleCellEditComplete: vi.fn(),
    handleCellEditCancel: vi.fn(),
    handleCellValueChange: vi.fn(),
    handleExpandToggle: vi.fn(),
    handleStartRowEdit: vi.fn(),
    handleSaveRowEdit: vi.fn(),
    handleCancelRowEdit: vi.fn(),
    handleRowAction: vi.fn(),
    handleMobileRowClick: vi.fn(),
    handleMobileRowSelect: vi.fn(),
    handleMobileRowAction: vi.fn(),
  };
}

const orchestratorMock = buildOrchestratorMock();

vi.mock("@ui/components/organisms/vc-table/composables/useDataTableOrchestrator", () => ({
  useDataTableOrchestrator: vi.fn(() => orchestratorMock),
}));

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (_key: string, _args?: unknown, fallback?: string) => fallback ?? _key,
  }),
}));

// Mock @vueuse/core
vi.mock("@vueuse/core", () => ({
  useElementSize: () => ({ width: ref(800), height: ref(600) }),
}));

// ============================================================================
// Helpers
// ============================================================================

function mountTable(propsOverride: Record<string, unknown> = {}) {
  return mount(VcDataTable as any, {
    props: {
      stateKey: "test-table",
      items: [],
      ...propsOverride,
    },
    global: {
      provide: {
        [IsMobileKey as symbol]: ref(false),
      },
      directives: {
        loading: { mounted() {}, updated() {} },
      },
    },
  });
}

// ============================================================================
// Tests
// ============================================================================

describe("VcDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders root element with vc-data-table class", () => {
    const wrapper = mountTable();
    expect(wrapper.find(".vc-data-table").exists()).toBe(true);
  });

  it("sets aria-busy when loading is true", () => {
    const wrapper = mountTable({ loading: true });
    expect(wrapper.find(".vc-data-table").attributes("aria-busy")).toBe("true");
  });

  it("does not set aria-busy when loading is false", () => {
    const wrapper = mountTable({ loading: false });
    expect(wrapper.find(".vc-data-table").attributes("aria-busy")).toBeUndefined();
  });

  it("renders header slot when provided", () => {
    const wrapper = mount(VcDataTable as any, {
      props: { stateKey: "test", items: [] },
      slots: {
        header: "<div class='custom-header'>Header</div>",
      },
      global: {
        provide: { [IsMobileKey as symbol]: ref(false) },
        directives: { loading: { mounted() {}, updated() {} } },
      },
    });
    expect(wrapper.find(".vc-data-table__header").exists()).toBe(true);
    expect(wrapper.find(".custom-header").exists()).toBe(true);
  });

  it("does not render header section when no header slot", () => {
    const wrapper = mountTable();
    expect(wrapper.find(".vc-data-table__header").exists()).toBe(false);
  });

  it("renders search header when searchable is true", () => {
    const wrapper = mountTable({ searchable: true });
    expect(wrapper.find(".mock-search-header").exists()).toBe(true);
  });

  it("does not render search header when searchable is false and no filters", () => {
    const wrapper = mountTable({ searchable: false });
    expect(wrapper.find(".mock-search-header").exists()).toBe(false);
  });

  it("renders desktop Table component when not mobile", () => {
    const wrapper = mountTable();
    expect(wrapper.find(".mock-table").exists()).toBe(true);
    expect(wrapper.find(".mock-mobile").exists()).toBe(false);
  });

  it("renders mobile view when isMobile is true", () => {
    const wrapper = mount(VcDataTable as any, {
      props: { stateKey: "test", items: [] },
      global: {
        provide: { [IsMobileKey as symbol]: ref(true) },
        directives: { loading: { mounted() {}, updated() {} } },
      },
    });
    expect(wrapper.find(".mock-mobile").exists()).toBe(true);
    expect(wrapper.find(".mock-table").exists()).toBe(false);
  });

  it("renders pagination when pagination prop is provided with pages > 0", () => {
    const wrapper = mountTable({
      pagination: { currentPage: 1, pages: 5 },
    });
    expect(wrapper.find(".vc-data-table__pagination").exists()).toBe(true);
    expect(wrapper.find(".mock-pagination").exists()).toBe(true);
  });

  it("does not render pagination when pages is 0", () => {
    const wrapper = mountTable({
      pagination: { currentPage: 1, pages: 0 },
    });
    expect(wrapper.find(".vc-data-table__pagination").exists()).toBe(false);
  });

  it("does not render pagination when not provided", () => {
    const wrapper = mountTable();
    expect(wrapper.find(".vc-data-table__pagination").exists()).toBe(false);
  });

  it("passes stateKey to orchestrator", async () => {
    const { useDataTableOrchestrator } = await import(
      "@ui/components/organisms/vc-table/composables/useDataTableOrchestrator"
    );
    mountTable({ stateKey: "my-unique-key" });
    expect(useDataTableOrchestrator).toHaveBeenCalled();
    const callArgs = (useDataTableOrchestrator as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.props.stateKey).toBe("my-unique-key");
  });
});
