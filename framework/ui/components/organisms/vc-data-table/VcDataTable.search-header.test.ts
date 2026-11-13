/**
 * VcDataTable and VcTableAdapter without `searchBar`: the v2.11.0 search header; the adapter with `searchBar`.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import VcDataTable from "./VcDataTable.vue";
import VcTableAdapter from "./VcTableAdapter.vue";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import {
  global,
  globalFilters,
  SEARCH,
  urlQueryState,
  type FilterEvent,
} from "./VcDataTable.search-header.test-helpers";

const { headerAttrs } = vi.hoisted(() => ({ headerAttrs: { current: {} as Record<string, unknown> } }));

vi.mock("@ui/components/organisms/vc-data-table/components", async (importOriginal) => {
  const { defineComponent: dc } = await import("vue");
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    Table: dc({ name: "VcTable", template: "<div class='mock-table'><slot /><slot name='empty' /></div>" }),
    TableFooter: dc({ name: "TableFooter", template: "<div><slot /></div>" }),
    TableRowActions: dc({ name: "TableRowActions", template: "<div />" }),
    DataTableHeader: dc({
      name: "DataTableHeader",
      inheritAttrs: false,
      setup(_, { attrs }) {
        headerAttrs.current = attrs;
        return () => null;
      },
    }),
    DataTableBody: dc({
      name: "DataTableBody",
      props: ["emptyTitle"],
      inheritAttrs: false,
      template: "<div class='mock-body'>{{ emptyTitle }}</div>",
    }),
    TableColumnSwitcher: dc({ name: "TableColumnSwitcher", template: "<div />" }),
    TableSelectAllBar: dc({ name: "TableSelectAllBar", template: "<div />" }),
  };
});

vi.mock("@framework/core/composables/useResponsive", () => ({
  useResponsive: () => ({ isMobile: ref(false), isDesktop: ref(true) }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useElementSize: () => ({ width: ref(800), height: ref(600) }),
}));

describe("VcDataTable without searchBar (the v2.11.0 search header)", () => {
  let wrapper: VueWrapper | undefined;
  const mountTable = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    const url = urlQueryState({ orders_filters: "status:Paid" });
    wrapper = mount(VcDataTable as never, {
      props: { items: [], stateKey: "orders", ...props },
      slots,
      global: { ...global, provide: { ...global.provide, ...url.provide } },
      attachTo: document.body,
    });
    return wrapper;
  };
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  it("renders TableSearchHeader with the old classes and no bar", () => {
    const w = mountTable({ searchable: true, globalFilters });
    expect(w.find(".vc-table-search-header .vc-table-search-header__toolbar").exists()).toBe(true);
    expect(w.find(".vc-search-bar").exists()).toBe(false);
    expect(w.find(".vc-data-table__search-header").exists()).toBe(false);
  });

  it("renders GlobalFiltersButton for globalFilters and the panel", () => {
    const w = mountTable({ searchable: true, globalFilters });
    expect(w.find(".vc-table-search-header__actions .vc-global-filters-button__label").exists()).toBe(true);
    expect(w.findComponent({ name: "GlobalFiltersPanel" }).exists()).toBe(true);
  });

  it("renders search-header-actions in the same header row as the filters button", () => {
    const w = mountTable(
      { searchable: true, globalFilters },
      { "search-header-actions": "<button class='custom-action'>Export</button>" },
    );
    const actions = w.find(".vc-table-search-header__toolbar > .vc-table-search-header__actions");
    expect(actions.find(".custom-action").exists()).toBe(true);
    expect(actions.find(".vc-global-filters-button__label").exists()).toBe(true);
  });

  it("ignores the URL filters and an external registration targeting the blade", async () => {
    registerExternalSearchFilters({
      id: "ext-default",
      targetBlades: ["orders"],
      fields: [{ id: "rating", label: "Rating", filter: { toggle: true } }],
    });
    try {
      const w = mountTable({ searchable: true, searchName: "orders" });
      await nextTick();
      expect(w.text()).not.toContain("Rating");
      expect(w.find(".vc-search-bar").exists()).toBe(false);
      expect(w.findComponent({ name: "GlobalFiltersButton" }).exists()).toBe(false);
      expect(w.emitted("filter")).toBeUndefined();
    } finally {
      unregisterExternalSearchFilters("ext-default");
    }
  });

  it("emits the panel's payload merged with column filters, as in v2.11.0", async () => {
    const w = mountTable({ searchable: true, globalFilters });
    const apply = headerAttrs.current.onFilterApply as (col: unknown, payload: Record<string, unknown>) => void;
    apply({ id: "name", props: { id: "name", filter: true } }, { name: "Acme" });
    w.findComponent({ name: "GlobalFiltersPanel" }).vm.$emit("apply", { status: ["New"] });
    const events = w.emitted("filter") as FilterEvent[];
    expect(events.at(-1)![0].filters).toEqual({ name: "Acme", status: ["New"] });
    w.findComponent({ name: "GlobalFiltersPanel" }).vm.$emit("clear");
    expect((w.emitted("filter") as FilterEvent[]).at(-1)![0].filters).toEqual({ name: "Acme" });
  });

  it("typing in the old header emits update:searchValue and a debounced search", async () => {
    vi.useFakeTimers();
    try {
      const w = mountTable({ searchable: true, searchDebounce: 300 });
      await w.find(".vc-table-search-header input").setValue("abc");
      expect(w.emitted("update:searchValue")).toEqual([["abc"]]);
      vi.advanceTimersByTime(300);
      expect(w.emitted("search")).toEqual([["abc"]]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("VcTableAdapter and the search bar", () => {
  const mountAdapter = (props: Record<string, unknown> = {}) =>
    mount(VcTableAdapter as never, {
      props: { items: [], columns: [{ id: "name", title: "Name" }], stateKey: "adapter", ...props },
      slots: { filters: "<div>legacy filters</div>" },
      global,
      attachTo: document.body,
    });

  it("keeps the old search header without searchBar", () => {
    const w = mountAdapter();
    expect(w.find(".vc-table-search-header__actions .vc-global-filters-button__label").exists()).toBe(true);
    expect(w.find(".vc-search-bar").exists()).toBe(false);
    w.unmount();
  });

  it("with searchBar and no fields: only the search, the legacy button after it in the same row, no status", () => {
    const w = mountAdapter({
      searchBar: true,
      pages: 2,
      totalCount: 40,
      activeFilterCount: 2,
    });
    expect(w.find(".vc-data-table__search-header-actions .vc-global-filters-button__label").exists()).toBe(true);
    expect(w.find(".vc-search-bar .vc-global-filters-button__label").exists()).toBe(false);
    const row = [...w.find(".vc-data-table__search-header").element.children];
    expect(row.map((c) => c.className.split(" ")[0])).toEqual([
      "vc-search-bar",
      "vc-data-table__search-header-actions",
    ]);
    expect(w.find(SEARCH).exists()).toBe(true);
    expect(w.find(".vc-search-bar__divider").exists()).toBe(false);
    expect(w.find(".vc-search-bar__filters-btn").exists()).toBe(false);
    expect(w.find(".vc-data-table__filter-status").exists()).toBe(false);
    w.unmount();
  });
});
