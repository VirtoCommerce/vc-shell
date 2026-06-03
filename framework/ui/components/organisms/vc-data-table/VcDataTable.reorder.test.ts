/**
 * Integration tests for VcDataTable row-reorder emit.
 *
 * These tests verify that SortableJS `onEnd` results in a `row-reorder` emit
 * with the correct payload in both desktop and mobile modes.
 *
 * The orchestrator is NOT mocked here; SortableJS is mocked to capture the
 * options object (specifically `onEnd`) so we can invoke it programmatically.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, defineComponent } from "vue";
import VcDataTable from "./VcDataTable.vue";
import { IsMobileKey } from "@framework/injection-keys";

// ============================================================================
// SortableJS mock — captures onEnd for manual invocation
// ============================================================================

const createSpy = vi.fn();
const destroySpy = vi.fn();
let lastSortableOptions: Record<string, any> | null = null;

vi.mock("sortablejs", () => ({
  default: {
    create: (el: HTMLElement, options: Record<string, any>) => {
      lastSortableOptions = options;
      createSpy(el, options);
      return { destroy: destroySpy, option: vi.fn(), el };
    },
  },
}));

// ============================================================================
// Shared fake DOM elements for listEl
// These are defined at module scope so they are accessible inside vi.mock
// factories AND in test assertions.
// ============================================================================

const { fakeDesktopListEl, fakeMobileListEl } = vi.hoisted(() => ({
  fakeDesktopListEl: document.createElement("ul"),
  fakeMobileListEl: document.createElement("ul"),
}));

// ============================================================================
// Mock heavy sub-components (mirrors VcDataTable.test.ts).
// DataTableBody and DataTableMobileView expose a real `listEl` so the
// watchEffect in VcDataTable can populate `rowReorderListRef`.
// ============================================================================

vi.mock("@ui/components/organisms/vc-data-table/components", () => ({
  Table: defineComponent({
    name: "VcTable",
    template:
      "<div class='mock-table'><slot /><slot name='row-actions' /><slot name='expansion' /><slot name='empty' /><slot name='loading' /><slot name='groupheader' /><slot name='groupfooter' /></div>",
  }),
  TableFooter: defineComponent({ name: "TableFooter", template: "<div class='mock-table-footer'><slot /></div>" }),
  TableEmpty: defineComponent({
    name: "TableEmpty",
    props: ["icon", "title", "description", "actionLabel", "actionHandler"],
    template: "<div class='mock-table-empty'>{{ title }}</div>",
  }),
  TableRowActions: defineComponent({ name: "TableRowActions", template: "<div />" }),
  DataTableHeader: defineComponent({
    name: "DataTableHeader",
    inheritAttrs: false,
    template: "<div class='mock-header' />",
  }),
  DataTableBody: defineComponent({
    name: "DataTableBody",
    inheritAttrs: false,
    setup() {
      return { listEl: fakeDesktopListEl };
    },
    template: "<div class='mock-body'><slot name='empty' /><slot name='loading' /></div>",
  }),
  GlobalFiltersButton: defineComponent({ name: "GlobalFiltersButton", template: "<button class='mock-gf-btn' />" }),
  GlobalFiltersPanel: defineComponent({ name: "GlobalFiltersPanel", template: "<div />" }),
  TableColumnSwitcher: defineComponent({ name: "TableColumnSwitcher", template: "<div />" }),
  DataTableMobileView: defineComponent({
    name: "DataTableMobileView",
    inheritAttrs: false,
    setup() {
      return { listEl: fakeMobileListEl };
    },
    template: "<div class='mock-mobile'><slot name='empty' /></div>",
  }),
  TableAddRowButton: defineComponent({ name: "TableAddRowButton", template: "<div />" }),
  TableSearchHeader: defineComponent({
    name: "TableSearchHeader",
    props: ["searchable", "modelValue", "placeholder"],
    template: "<div class='mock-search-header'><slot name='actions' /></div>",
  }),
  TableSelectAllBar: defineComponent({ name: "TableSelectAllBar", template: "<div />" }),
}));

vi.mock("@ui/components/molecules", () => ({
  VcPagination: defineComponent({ name: "VcPagination", template: "<div class='mock-pagination' />" }),
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
// Test data
// ============================================================================

type TestRow = { id: string; name: string };

const makeItems = (): TestRow[] => [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];

// ============================================================================
// Helpers
// ============================================================================

function mountReorderTable(isMobile = false) {
  return mount(VcDataTable as any, {
    props: {
      stateKey: "reorder-test",
      items: makeItems(),
      reorderableRows: true,
      dataKey: "id",
    },
    global: {
      provide: {
        [IsMobileKey as symbol]: ref(isMobile),
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

describe("VcDataTable row-reorder integration", () => {
  beforeEach(() => {
    createSpy.mockClear();
    destroySpy.mockClear();
    lastSortableOptions = null;
  });

  it("desktop: SortableJS onEnd fires row-reorder emit with correct payload", async () => {
    const wrapper = mountReorderTable(false);

    // Two ticks: first for watchEffect → rowReorderListRef, second for the
    // watch(listEl) inside useTableRowReorder → Sortable.create.
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy.mock.calls[0][0]).toBe(fakeDesktopListEl);
    expect(lastSortableOptions).not.toBeNull();

    // Simulate drag: move item at index 0 to index 2
    lastSortableOptions!.onEnd({ oldIndex: 0, newIndex: 2 });

    const emitted = wrapper.emitted("row-reorder");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual({
      dragIndex: 0,
      dropIndex: 2,
      value: [
        { id: "b", name: "Beta" },
        { id: "c", name: "Gamma" },
        { id: "a", name: "Alpha" },
      ],
    });
  });

  it("mobile: SortableJS onEnd fires row-reorder emit with correct payload", async () => {
    const wrapper = mountReorderTable(true);

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy.mock.calls[0][0]).toBe(fakeMobileListEl);
    expect(lastSortableOptions).not.toBeNull();

    // Simulate drag: move item at index 1 to index 0
    lastSortableOptions!.onEnd({ oldIndex: 1, newIndex: 0 });

    const emitted = wrapper.emitted("row-reorder");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual({
      dragIndex: 1,
      dropIndex: 0,
      value: [
        { id: "b", name: "Beta" },
        { id: "a", name: "Alpha" },
        { id: "c", name: "Gamma" },
      ],
    });
  });
});
