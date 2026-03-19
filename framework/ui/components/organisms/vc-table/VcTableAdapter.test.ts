/**
 * Unit tests for VcTableAdapter component.
 *
 * VcTableAdapter wraps VcDataTable with the legacy VcTable API surface.
 * Tests verify prop mapping, column generation, and event re-emission.
 * VcDataTable is stubbed to avoid deep rendering.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { defineComponent, ref, nextTick } from "vue";
import VcTableAdapter from "./VcTableAdapter.vue";

// ============================================================================
// Stub VcDataTable and sub-components (inline in vi.mock to avoid hoisting)
// ============================================================================

vi.mock("@ui/components/organisms/vc-table/VcDataTable.vue", () => ({
  default: defineComponent({
    name: "VcDataTable",
    props: {
      items: Array,
      sortField: String,
      sortOrder: Number,
      removableSort: Boolean,
      selectionMode: String,
      selection: Array,
      isRowSelectable: Function,
      rowActions: Function,
      activeItemId: String,
      loading: Boolean,
      resizableColumns: Boolean,
      reorderableColumns: Boolean,
      reorderableRows: Boolean,
      stateKey: String,
      pullToRefresh: Boolean,
      columnSwitcher: [Boolean, String],
      editMode: String,
      showAllColumns: Boolean,
      selectAll: Boolean,
      totalCount: Number,
      totalLabel: String,
      searchable: Boolean,
      searchValue: String,
      searchPlaceholder: String,
      pagination: Object,
      addRow: Object,
      variant: String,
      emptyState: Object,
      notFoundState: Object,
    },
    emits: [
      "sort",
      "update:selection",
      "row-click",
      "row-reorder",
      "cell-edit-complete",
      "pull-refresh",
      "update:select-all",
      "pagination-click",
      "search",
      "update:search-value",
      "row-add",
    ],
    template: "<div class='mock-vc-data-table'><slot /></div>",
  }),
}));

vi.mock("@ui/components/organisms/vc-table/components/VcColumn.vue", () => ({
  default: defineComponent({
    name: "VcColumn",
    props: ["id", "field", "title", "width", "type", "sortable", "editable", "align", "alwaysVisible", "currencyField", "rules", "filter", "mobileRole", "mobilePosition", "mobileVisible"],
    template: "<div class='mock-vc-column' :data-id='id' />",
  }),
}));

vi.mock("@ui/components/organisms/vc-table/components", () => ({
  GlobalFiltersButton: defineComponent({
    name: "GlobalFiltersButton",
    template: "<button class='mock-gf-btn' />",
  }),
}));

vi.mock("@ui/components/molecules", () => ({
  VcDropdownPanel: defineComponent({
    name: "VcDropdownPanel",
    props: ["show", "anchorRef", "title", "width", "maxWidth"],
    template: "<div class='mock-dropdown'><slot /></div>",
  }),
}));

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// ============================================================================
// Helpers
// ============================================================================

type TestItem = { id: string; name: string };

const baseColumns = [
  { id: "name", title: "Name", sortable: true, visible: true },
  { id: "price", title: "Price", type: "money", sortable: true, visible: true },
];

function mountAdapter(propsOverride: Record<string, unknown> = {}) {
  return mount(VcTableAdapter as any, {
    props: {
      columns: baseColumns,
      items: [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ] as TestItem[],
      stateKey: "test-adapter",
      ...propsOverride,
    },
  });
}

function findDataTable(wrapper: VueWrapper) {
  return wrapper.findComponent({ name: "VcDataTable" });
}

// ============================================================================
// Tests
// ============================================================================

describe("VcTableAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it("renders root element with vc-table-adapter class", () => {
    const wrapper = mountAdapter();
    expect(wrapper.find(".vc-table-adapter").exists()).toBe(true);
  });

  it("renders VcDataTable inside", () => {
    const wrapper = mountAdapter();
    expect(findDataTable(wrapper).exists()).toBe(true);
  });

  it("generates VcColumn for each visible column", () => {
    const wrapper = mountAdapter();
    const columns = wrapper.findAllComponents({ name: "VcColumn" });
    expect(columns).toHaveLength(2);
    expect(columns[0].props("id")).toBe("name");
    expect(columns[1].props("id")).toBe("price");
  });

  it("filters out columns with visible=false", () => {
    const cols = [
      { id: "name", title: "Name", visible: true },
      { id: "hidden", title: "Hidden", visible: false },
    ];
    const wrapper = mountAdapter({ columns: cols });
    const columns = wrapper.findAllComponents({ name: "VcColumn" });
    expect(columns).toHaveLength(1);
    expect(columns[0].props("id")).toBe("name");
  });

  // --- Prop mapping ---

  it("maps sort prop to sortField and sortOrder (DESC)", () => {
    const wrapper = mountAdapter({ sort: "name:DESC" });
    const dt = findDataTable(wrapper);
    expect(dt.props("sortField")).toBe("name");
    expect(dt.props("sortOrder")).toBe(-1);
  });

  it("maps sort ASC correctly", () => {
    const wrapper = mountAdapter({ sort: "price:ASC" });
    const dt = findDataTable(wrapper);
    expect(dt.props("sortField")).toBe("price");
    expect(dt.props("sortOrder")).toBe(1);
  });

  it("maps undefined sort to no sortField", () => {
    const wrapper = mountAdapter({ sort: undefined });
    const dt = findDataTable(wrapper);
    expect(dt.props("sortField")).toBeUndefined();
    expect(dt.props("sortOrder")).toBe(0);
  });

  it("maps multiselect=true to selectionMode=multiple", () => {
    const wrapper = mountAdapter({ multiselect: true });
    const dt = findDataTable(wrapper);
    expect(dt.props("selectionMode")).toBe("multiple");
  });

  it("maps multiselect=false to selectionMode=undefined", () => {
    const wrapper = mountAdapter({ multiselect: false });
    const dt = findDataTable(wrapper);
    expect(dt.props("selectionMode")).toBeUndefined();
  });

  it("passes items through to VcDataTable", () => {
    const items = [{ id: "a", name: "A" }];
    const wrapper = mountAdapter({ items });
    expect(findDataTable(wrapper).props("items")).toEqual(items);
  });

  it("passes stateKey through", () => {
    const wrapper = mountAdapter({ stateKey: "my-key" });
    expect(findDataTable(wrapper).props("stateKey")).toBe("my-key");
  });

  it("passes loading through", () => {
    const wrapper = mountAdapter({ loading: true });
    expect(findDataTable(wrapper).props("loading")).toBe(true);
  });

  it("maps column type date-time to datetime", () => {
    const cols = [{ id: "created", title: "Created", type: "date-time", visible: true }];
    const wrapper = mountAdapter({ columns: cols });
    const column = wrapper.findComponent({ name: "VcColumn" });
    expect(column.props("type")).toBe("datetime");
  });

  it("maps pagination props", () => {
    const wrapper = mountAdapter({ pages: 10, currentPage: 3, footer: true });
    const dt = findDataTable(wrapper);
    expect(dt.props("pagination")).toEqual({
      currentPage: 3,
      pages: 10,
      variant: "default",
    });
  });

  it("disables pagination when footer is false", () => {
    const wrapper = mountAdapter({ footer: false, pages: 10 });
    const dt = findDataTable(wrapper);
    expect(dt.props("pagination")).toBeUndefined();
  });

  it("maps expanded prop to showAllColumns", () => {
    const wrapper = mountAdapter({ expanded: false });
    expect(findDataTable(wrapper).props("showAllColumns")).toBe(false);
  });

  it("maps editing=true to editMode=inline", () => {
    const wrapper = mountAdapter({ editing: true });
    expect(findDataTable(wrapper).props("editMode")).toBe("inline");
  });

  it("maps header=true to searchable=true", () => {
    const wrapper = mountAdapter({ header: true });
    expect(findDataTable(wrapper).props("searchable")).toBe(true);
  });

  // --- Events ---

  it("emits headerClick on sort event", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    dt.vm.$emit("sort", { sortField: "name", sortOrder: 1 });
    await nextTick();
    const emitted = wrapper.emitted("headerClick");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toMatchObject({ id: "name:ASC" });
  });

  it("emits selectionChanged on update:selection", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    const items = [{ id: "1", name: "Item 1" }];
    dt.vm.$emit("update:selection", items);
    await nextTick();
    expect(wrapper.emitted("selectionChanged")).toBeTruthy();
    expect(wrapper.emitted("selectionChanged")![0][0]).toEqual(items);
  });

  it("emits itemClick on row-click", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    const item = { id: "1", name: "Item 1" };
    dt.vm.$emit("row-click", { data: item });
    await nextTick();
    expect(wrapper.emitted("itemClick")).toBeTruthy();
    expect(wrapper.emitted("itemClick")![0][0]).toEqual(item);
  });

  it("emits paginationClick on pagination-click", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    dt.vm.$emit("pagination-click", 3);
    await nextTick();
    expect(wrapper.emitted("paginationClick")).toBeTruthy();
    expect(wrapper.emitted("paginationClick")![0][0]).toBe(3);
  });

  it("emits search:change on search", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    dt.vm.$emit("search", "hello");
    await nextTick();
    expect(wrapper.emitted("search:change")).toBeTruthy();
    expect(wrapper.emitted("search:change")![0][0]).toBe("hello");
  });

  it("emits scroll:ptr on pull-refresh", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    dt.vm.$emit("pull-refresh");
    await nextTick();
    expect(wrapper.emitted("scroll:ptr")).toBeTruthy();
  });

  it("emits row:reorder on row-reorder", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    const event = { dragIndex: 0, dropIndex: 1, value: [] };
    dt.vm.$emit("row-reorder", event);
    await nextTick();
    expect(wrapper.emitted("row:reorder")).toBeTruthy();
    expect(wrapper.emitted("row:reorder")![0][0]).toEqual(event);
  });

  it("emits select:all on update:select-all", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    dt.vm.$emit("update:select-all", true);
    await nextTick();
    expect(wrapper.emitted("select:all")).toBeTruthy();
    expect(wrapper.emitted("select:all")![0][0]).toBe(true);
  });

  it("emits onEditComplete and onCellBlur on cell-edit-complete", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    dt.vm.$emit("cell-edit-complete", {
      data: { id: "1", name: "X" },
      field: "name",
      newValue: "Y",
      index: 0,
    });
    await nextTick();
    expect(wrapper.emitted("onEditComplete")).toBeTruthy();
    expect(wrapper.emitted("onEditComplete")![0][0]).toEqual({
      event: { field: "name", value: "Y" },
      index: 0,
    });
    expect(wrapper.emitted("onCellBlur")).toBeTruthy();
    expect(wrapper.emitted("onCellBlur")![0][0]).toEqual({ row: 0, field: "name" });
  });

  it("emits onAddNewRow on row-add and cancels internal add", async () => {
    const wrapper = mountAdapter();
    const dt = findDataTable(wrapper);
    const cancelFn = vi.fn();
    dt.vm.$emit("row-add", { defaults: {}, cancel: cancelFn });
    await nextTick();
    expect(wrapper.emitted("onAddNewRow")).toBeTruthy();
    expect(cancelFn).toHaveBeenCalled();
  });
});
