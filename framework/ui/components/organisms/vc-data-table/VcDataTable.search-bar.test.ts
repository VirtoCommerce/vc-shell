/**
 * VcDataTable with `searchBar`: the VcSearchBar header. Real orchestrator, real header and real bar,
 * so the @filter payload (global + column merge) and the search timing are the shipped ones.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, onMounted, ref } from "vue";
import VcDataTable from "./VcDataTable.vue";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import {
  global,
  globalFilters,
  SEARCH,
  urlQueryState,
  type FilterEvent,
} from "./VcDataTable.search-header.test-helpers";

const { headerAttrs, loggerWarn } = vi.hoisted(() => ({
  headerAttrs: { current: {} as Record<string, unknown> },
  loggerWarn: vi.fn(),
}));

vi.mock("@core/utilities", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: loggerWarn, error: vi.fn() }),
}));

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

/** The Filters panel's switch of a toggle field */
const panelSwitch = (label: string) =>
  document.body.querySelector<HTMLInputElement>(`.vc-search-bar__panel input[role='switch'][aria-label='${label}']`)!;

describe("VcDataTable search bar header", () => {
  let wrapper: VueWrapper | undefined;
  let url = urlQueryState();
  const withUrl = () => ({ ...global, provide: { ...global.provide, ...url.provide } });
  const mountTable = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    wrapper = mount(VcDataTable as never, {
      props: { items: [], stateKey: "orders", searchBar: true, ...props },
      slots,
      global: withUrl(),
      attachTo: document.body,
    });
    return wrapper;
  };
  const filterEvents = () => (wrapper!.emitted("filter") ?? []) as FilterEvent[];

  beforeEach(() => {
    localStorage.clear();
    url = urlQueryState();
    vi.useFakeTimers();
  });
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.useRealTimers();
    localStorage.clear();
  });

  it("renders the bar with its Filters button instead of the old header, button and panel", () => {
    const w = mountTable({ searchable: true, globalFilters });
    expect(w.find(".vc-search-bar").exists()).toBe(true);
    expect(w.find(".vc-search-bar__filters-btn").exists()).toBe(true);
    expect(w.find(".vc-table-search-header").exists()).toBe(false);
    expect(w.findComponent({ name: "GlobalFiltersButton" }).exists()).toBe(false);
    expect(w.findComponent({ name: "GlobalFiltersPanel" }).exists()).toBe(false);
  });

  it("a search-only table shows no Filters button and no view selector", () => {
    const w = mountTable({ searchable: true });
    expect(w.find(".vc-search-bar").exists()).toBe(true);
    expect(w.find(".vc-search-bar__filters-btn").exists()).toBe(false);
    expect(w.find(".vc-search-bar__view-selector").exists()).toBe(false);
  });

  it("outside a blade the bar shows the view selector in its row", () => {
    const w = mountTable({ searchable: true, globalFilters });
    expect(w.find(".vc-search-bar__row .vc-search-bar__view-selector").exists()).toBe(true);
  });

  it("renders no bar without searchable, globalFilters or header actions", () => {
    const w = mountTable();
    expect(w.find(".vc-search-bar").exists()).toBe(false);
  });

  it("renders the bar for a searchName alone: its fields may come from an external registration", () => {
    registerExternalSearchFilters({
      id: "ext-only",
      targetBlades: ["OrdersList"],
      fields: [{ id: "x", label: "X", filter: true }],
    });
    try {
      const w = mountTable({ searchName: "OrdersList" });
      expect(w.find(".vc-search-bar").exists()).toBe(true);
      expect(w.find(".vc-search-bar__filters-btn").exists()).toBe(true);
    } finally {
      unregisterExternalSearchFilters("ext-only");
    }
  });

  it("renders the bar for fields registered under the blade's name", () => {
    registerExternalSearchFilters({
      id: "ext-blade",
      targetBlades: ["OrdersBlade"],
      fields: [{ id: "x", label: "X", filter: true }],
    });
    try {
      wrapper = mount(VcDataTable as never, {
        props: { items: [], stateKey: "orders", searchBar: true },
        global: {
          ...withUrl(),
          provide: { ...withUrl().provide, [BladeDescriptorKey as symbol]: ref({ id: "b1", name: "OrdersBlade" }) },
        },
        attachTo: document.body,
      });
      expect(wrapper.find(".vc-search-bar__filters-btn").exists()).toBe(true);
    } finally {
      unregisterExternalSearchFilters("ext-blade");
    }
  });

  it("wraps the bar in the table's own search header", () => {
    const w = mountTable({ searchable: true });
    expect(w.find(".vc-data-table__search-header > .vc-search-bar").exists()).toBe(true);
  });

  it("renders no search header without searchable, globalFilters or header actions", () => {
    const w = mountTable();
    expect(w.find(".vc-data-table__search-header").exists()).toBe(false);
  });

  it("renders no actions row when the search-header-actions slot is not used", () => {
    const w = mountTable({ searchable: true, globalFilters });
    expect(w.find(".vc-data-table__search-header-actions").exists()).toBe(false);
  });

  it("renders search-header-actions in the bar's row after the bar, not inside it", () => {
    const w = mountTable(
      { searchable: true },
      { "search-header-actions": "<button class='custom-action'>Export</button>" },
    );
    const children = w.find(".vc-data-table__search-header").element.children;
    expect(children).toHaveLength(2);
    expect(children[0].classList.contains("vc-search-bar")).toBe(true);
    expect(children[1].classList.contains("vc-data-table__search-header-actions")).toBe(true);
    expect(w.find(".vc-data-table__search-header-actions .custom-action").exists()).toBe(true);
    expect(w.find(".vc-search-bar .custom-action").exists()).toBe(false);
    expect(w.find(".vc-search-bar__actions").exists()).toBe(false);
  });

  it("renders the header for the actions slot alone", () => {
    const w = mountTable({}, { "search-header-actions": "<button class='custom-action'>Export</button>" });
    expect(w.find(".vc-data-table__search-header-actions .custom-action").exists()).toBe(true);
    expect(w.find(SEARCH).exists()).toBe(false);
  });

  it("passes the placeholder to the bar", () => {
    const w = mountTable({ searchable: true, searchPlaceholder: "Find orders" });
    expect(w.findComponent({ name: "VcSearchBar" }).props("placeholder")).toBe("Find orders");
  });

  it("passes searchName to the bar's name", () => {
    const w = mountTable({ searchable: true, searchName: "OrdersList" });
    expect(w.findComponent({ name: "VcSearchBar" }).props("name")).toBe("OrdersList");
  });

  it("typing emits update:searchValue at once and a single search per pause, no filter", async () => {
    const w = mountTable({ searchable: true, globalFilters, searchDebounce: 300 });
    await w.find(SEARCH).setValue("a");
    await w.find(SEARCH).setValue("ab");
    expect(w.emitted("update:searchValue")).toEqual([["a"], ["ab"]]);
    expect(w.emitted("search")).toBeUndefined();
    vi.advanceTimersByTime(300);
    expect(w.emitted("search")).toEqual([["ab"]]);
    expect(w.emitted("filter")).toBeUndefined();
  });

  it("a filter changed within the search pause keeps the typed text and searches it once", async () => {
    const toggleFilters = [
      ...globalFilters,
      { id: "overdue", label: "Overdue", filter: { toggle: true } },
    ] as GlobalFilterConfig[];
    const w = mountTable({ searchable: true, globalFilters: toggleFilters, searchDebounce: 300 });
    await w.find(".vc-search-bar__filters-main").trigger("click");
    const input = w.find(SEARCH);
    (input.element as HTMLInputElement).value = "abc";
    // The click lands before the table re-renders, so the bar has not seen the echoed search yet
    void input.trigger("input");
    panelSwitch("Overdue").click();
    await nextTick();
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect((w.find(SEARCH).element as HTMLInputElement).value).toBe("abc");
    expect(filterEvents().at(-1)![0].filters).toEqual({ overdue: true });
    expect(w.emitted("update:searchValue")).toEqual([["abc"]]);
    expect(w.emitted("search")).toEqual([["abc"]]);
  });

  it("a view picked within the search pause keeps the typed text", async () => {
    registerExternalSearchFilters({
      id: "view-plain",
      targetBlades: ["orders"],
      fields: [],
      views: [{ id: "paid", name: "Paid", values: { status: ["Paid"] } }],
    });
    try {
      const w = mountTable({ searchable: true, globalFilters, searchName: "orders", searchDebounce: 300 });
      await w.find(".vc-search-bar__view-btn").trigger("click");
      const input = w.find(SEARCH);
      (input.element as HTMLInputElement).value = "abc";
      void input.trigger("input");
      [...document.body.querySelectorAll<HTMLElement>(".vc-search-bar__view-item")]
        .find((b) => b.textContent?.includes("Paid"))!
        .click();
      vi.advanceTimersByTime(1000);
      await nextTick();
      expect((w.find(SEARCH).element as HTMLInputElement).value).toBe("abc");
      expect(filterEvents().at(-1)![0].filters).toEqual({ status: ["Paid"] });
      expect(w.emitted("update:searchValue")).toEqual([["abc"]]);
      expect(w.emitted("search")).toEqual([["abc"]]);
    } finally {
      unregisterExternalSearchFilters("view-plain");
    }
  });

  it("a typed field:value chip sends the rest of the text as the search with the filter change", async () => {
    const log: string[] = [];
    const w = mountTable({
      searchable: true,
      globalFilters,
      searchDebounce: 300,
      onSearch: (v: string) => log.push(`search ${v}`),
      onFilter: (e: { filters: Record<string, unknown> }) => log.push(`filter ${JSON.stringify(e.filters)}`),
    });
    await w.find(SEARCH).setValue("acme status:paid ");
    expect(log).toEqual(["search acme", 'filter {"status":["Paid"]}']);
    vi.advanceTimersByTime(1000);
    expect(log).toEqual(["search acme", 'filter {"status":["Paid"]}']);
  });

  describe("dev warnings", () => {
    const warned = (part: string) => loggerWarn.mock.calls.filter((c) => c.join(" ").includes(part)).length;
    beforeEach(() => loggerWarn.mockClear());

    it("a search bar without stateKey warns once that its filters and views are not kept", () => {
      mountTable({ searchable: true, stateKey: undefined });
      wrapper!.unmount();
      mountTable({ searchable: true, stateKey: undefined });
      expect(warned("without stateKey")).toBe(1);
      wrapper!.unmount();
      mountTable({ searchable: true });
      expect(warned("without stateKey")).toBe(1);
    });

    it("searchName without the search bar warns once; nothing for a plain table", () => {
      mountTable({ searchBar: false, searchName: "orphan-list" });
      wrapper!.unmount();
      mountTable({ searchBar: false, searchName: "orphan-list" });
      expect(warned("orphan-list")).toBe(1);
      wrapper!.unmount();
      mountTable({ searchBar: false, stateKey: undefined, searchable: true });
      expect(loggerWarn).toHaveBeenCalledTimes(1);
    });
  });

  it("searchValue from the parent shows in the bar input", async () => {
    const w = mountTable({ searchable: true, searchValue: "abc" });
    expect((w.find(SEARCH).element as HTMLInputElement).value).toBe("abc");
    await w.setProps({ searchValue: "xyz" });
    expect((w.find(SEARCH).element as HTMLInputElement).value).toBe("xyz");
    expect(w.emitted("search")).toBeUndefined();
    expect(w.emitted("update:searchValue")).toBeUndefined();
  });

  describe("filters in the URL (stateKey)", () => {
    it("emits exactly one filter after mount with the flat payload", async () => {
      url.query.orders_filters = "status:Paid;created:2026-01-01..2026-01-31";
      mountTable({ searchable: true, globalFilters });
      await nextTick();
      expect(filterEvents()).toHaveLength(1);
      expect(filterEvents()[0][0].filters).toEqual({
        status: ["Paid"],
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });
    });

    it("a link with only `<key>_view` applies the view's values: one filter, the view not modified", async () => {
      url.query.orders_view = "paid";
      const w = mountTable({
        searchable: true,
        globalFilters,
        searchViews: [{ id: "paid", name: "Paid", values: { status: ["Paid"] } }],
      });
      await nextTick();
      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(filterEvents()).toHaveLength(1);
      expect(filterEvents()[0][0].filters).toEqual({ status: ["Paid"] });
      expect(w.get(".vc-search-bar__view-btn-name").text()).toBe("Paid");
      expect(w.find(".vc-search-bar__view-badge").exists()).toBe(false);
      expect(url.query.orders_filters).toBe("status:Paid");
    });

    it("`<key>_view` with `<key>_filters` restores both with exactly one filter", async () => {
      url.query.orders_view = "paid";
      url.query.orders_filters = "status:New";
      const w = mountTable({
        searchable: true,
        globalFilters,
        searchViews: [{ id: "paid", name: "Paid", values: { status: ["Paid"] } }],
      });
      await nextTick();
      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(filterEvents()).toHaveLength(1);
      expect(filterEvents()[0][0].filters).toEqual({ status: ["New"] });
      expect(w.get(".vc-search-bar__view-btn-name").text()).toBe("Paid");
      expect(w.find(".vc-search-bar__view-badge").exists()).toBe(true);
      expect(url.query.orders_view).toBe("paid");
    });

    it("emits the restored filter after the screen's own onMounted", async () => {
      url.query.orders_filters = "status:Paid";
      const log: string[] = [];
      const Screen = defineComponent({
        setup() {
          onMounted(() => log.push("screen mounted"));
          return () =>
            h(VcDataTable as never, {
              items: [],
              stateKey: "orders",
              searchBar: true,
              globalFilters,
              onFilter: (e: { filters: Record<string, unknown> }) => log.push(`filter ${JSON.stringify(e.filters)}`),
            });
        },
      });
      wrapper = mount(Screen, { global: withUrl(), attachTo: document.body });
      expect(log).toEqual(["screen mounted"]);
      await nextTick();
      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(log).toEqual(["screen mounted", 'filter {"status":["Paid"]}']);
    });

    it("a relative date stays relative in the URL and resolves against today", async () => {
      vi.setSystemTime(new Date(2026, 10, 6));
      url.query.orders_filters = "created:7d";
      mountTable({ searchable: true, globalFilters });
      await nextTick();
      expect(filterEvents()).toHaveLength(1);
      expect(filterEvents()[0][0].filters).toEqual({ startDate: "2026-10-31", endDate: "2026-11-06" });
      expect(url.query.orders_filters).toBe("created:7d");
    });

    it("a filter change writes `<stateKey>_filters` (the search words stay out of it)", async () => {
      url.query.orders_filters = "status:Paid;created:2026-01-01..2026-01-31";
      const w = mountTable({ searchable: true, globalFilters, searchDebounce: 0 });
      await nextTick();
      await w.find(SEARCH).setValue("words");
      vi.advanceTimersByTime(10);
      await w.find(".vc-search-bar__chip-x").trigger("click");
      expect(url.query.orders_filters).toBe("created:2026-01-01..2026-01-31");
      await w.find(".vc-search-bar__filters-x").trigger("click");
      expect(url.query.orders_filters).toBe("");
      expect(Object.values(url.query).some((v) => v.includes("words"))).toBe(false);
    });

    it("without a URL service nothing is restored", async () => {
      localStorage.setItem(
        "VC_SEARCHBAR_ORDERS",
        JSON.stringify({ v: 1, presets: [], applied: { search: "", values: { status: ["Paid"] } } }),
      );
      wrapper = mount(VcDataTable as never, {
        props: { items: [], stateKey: "orders", searchBar: true, globalFilters },
        global,
        attachTo: document.body,
      });
      await nextTick();
      expect(wrapper.emitted("filter")).toBeUndefined();
    });

    it("emits no filter when nothing was stored", async () => {
      mountTable({ searchable: true, globalFilters });
      await nextTick();
      vi.advanceTimersByTime(1000);
      expect(wrapper!.emitted("filter")).toBeUndefined();
    });

    it("emits no filter when the URL holds only the table's search (the table owns the search)", async () => {
      url.query.orders_search = "old";
      const w = mountTable({ searchable: true, globalFilters });
      await nextTick();
      expect(w.emitted("filter")).toBeUndefined();
    });
  });

  it("removing a chip emits filter with the same flat shape (date range split)", async () => {
    url.query.orders_filters = "status:Paid;created:2026-01-01..2026-01-31";
    const w = mountTable({ searchable: true, globalFilters });
    await w.find(".vc-search-bar__chip-x").trigger("click");
    const last = filterEvents().at(-1)![0];
    expect(last.filters).toEqual({ startDate: "2026-01-01", endDate: "2026-01-31" });
    expect(url.query.orders_filters).toBe("created:2026-01-01..2026-01-31");
  });

  it("merges column filters and bar filters into one payload", async () => {
    url.query.orders_filters = "status:New";
    const w = mountTable({ searchable: true, globalFilters });
    const apply = headerAttrs.current.onFilterApply as (col: unknown, payload: Record<string, unknown>) => void;
    apply({ id: "name", props: { id: "name", filter: true } }, { name: "Acme" });
    expect(filterEvents().at(-1)![0].filters).toEqual({ name: "Acme", status: ["New"] });

    await w.find(".vc-search-bar__filters-x").trigger("click");
    expect(filterEvents().at(-1)![0].filters).toEqual({ name: "Acme" });
  });

  it("passes the result count, the unfiltered count, views, counts and the variant to the bar", () => {
    const views = [{ id: "paid", name: "Paid", values: { status: ["Paid"] } }];
    const counts = { status: { Paid: 3 } };
    const w = mountTable({
      searchable: true,
      globalFilters,
      items: [{ id: 1 }, { id: 2 }],
      unfilteredCount: 40,
      searchViews: views,
      filterCounts: counts,
      searchBarVariant: "summary",
    });
    const bar = w.findComponent({ name: "VcSearchBar" });
    expect(bar.props()).toMatchObject({ resultCount: 2, unfilteredCount: 40, views, counts, variant: "summary" });
    w.setProps({ totalCount: 120 });
    return nextTick().then(() => expect(bar.props("resultCount")).toBe(120));
  });

  it("shows the not-found state when only bar filters are set", async () => {
    url.query.orders_filters = "status:New";
    const w = mountTable({ searchable: true, globalFilters });
    await nextTick();
    expect(w.find(".mock-body").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND_TITLE");
  });

  it("shows the empty state when nothing is set", () => {
    const w = mountTable({ searchable: true, globalFilters });
    expect(w.find(".mock-body").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY_TITLE");
  });
});
