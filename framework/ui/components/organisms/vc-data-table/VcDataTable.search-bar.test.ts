/**
 * VcDataTable header = VcSearchBar. Real orchestrator and real bar, so the
 * @filter payload (global + column merge) and the search timing are the shipped ones.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, onMounted, ref } from "vue";
import VcDataTable from "./VcDataTable.vue";
import VcTableAdapter from "./VcTableAdapter.vue";
import { IsMobileKey } from "@framework/injection-keys";
import {
  TableQueryStateKey,
  decodeQueryState,
  encodeQueryState,
  type ITableQueryStateService,
} from "@core/blade-navigation/table-query-state";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import type { GlobalFilterConfig } from "./types";

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
    GlobalFiltersButton: dc({ name: "GlobalFiltersButton", template: "<button class='mock-gf-btn'>Filters</button>" }),
    GlobalFiltersPanel: dc({ name: "GlobalFiltersPanel", template: "<div class='mock-gf-panel' />" }),
    TableSearchHeader: dc({ name: "TableSearchHeader", template: "<div class='mock-search-header' />" }),
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

const InputStub = defineComponent({
  name: "VcInput",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      h("input", {
        class: "input-stub",
        value: props.modelValue,
        onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
      }),
});

const globalFilters: GlobalFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "New", label: "New" },
        { value: "Paid", label: "Paid" },
      ],
      multiple: true,
    },
  },
  { id: "created", label: "Created", filter: { range: ["startDate", "endDate"] } },
];

const global = {
  stubs: { VcInput: InputStub, VcIcon: true },
  provide: { [IsMobileKey as symbol]: ref(false) },
  directives: { loading: { mounted() {}, updated() {} } },
  mocks: { $t: (k: string) => k },
};

type FilterEvent = { filters: Record<string, unknown> }[];

const SEARCH = ".vc-search-bar__search-input";
const menuItem = (label: string) =>
  [...document.body.querySelectorAll<HTMLElement>(".vc-search-bar__menu-item")].find((b) =>
    b.textContent?.includes(label),
  )!;

/** The blade's URL query service over a plain query record, with the real namespaced serialization */
function urlQueryState(query: Record<string, string> = {}) {
  const service: ITableQueryStateService = {
    read: (key) => decodeQueryState(key!, query),
    write: (key, patch) => Object.assign(query, encodeQueryState(key!, patch)),
  };
  return { query, provide: { [TableQueryStateKey as symbol]: service } };
}

describe("VcDataTable search bar header", () => {
  let wrapper: VueWrapper | undefined;
  let url = urlQueryState();
  const withUrl = () => ({ ...global, provide: { ...global.provide, ...url.provide } });
  const mountTable = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    wrapper = mount(VcDataTable as never, {
      props: { items: [], stateKey: "orders", ...props },
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
    expect(w.find(".mock-search-header").exists()).toBe(false);
    expect(w.find(".mock-gf-btn").exists()).toBe(false);
    expect(w.find(".mock-gf-panel").exists()).toBe(false);
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

  it("renders search-header-actions in their own row above the bar, not inside it", () => {
    const w = mountTable(
      { searchable: true },
      { "search-header-actions": "<button class='custom-action'>Export</button>" },
    );
    const children = w.find(".vc-data-table__search-header").element.children;
    expect(children).toHaveLength(2);
    expect(children[0].classList.contains("vc-data-table__search-header-actions")).toBe(true);
    expect(children[1].classList.contains("vc-search-bar")).toBe(true);
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
    menuItem("Overdue").click();
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
        props: { items: [], stateKey: "orders", globalFilters },
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

describe("VcTableAdapter in the search bar", () => {
  it("renders the legacy filters button in the header's actions row as the only filter UI", () => {
    const w = mount(VcTableAdapter as never, {
      props: { items: [], columns: [{ id: "name", title: "Name" }], stateKey: "adapter" },
      slots: { filters: "<div>legacy filters</div>" },
      global,
      attachTo: document.body,
    });
    expect(w.find(".vc-data-table__search-header-actions .mock-gf-btn").exists()).toBe(true);
    expect(w.find(".vc-search-bar .mock-gf-btn").exists()).toBe(false);
    expect(w.findAll(".mock-gf-btn")).toHaveLength(1);
    expect(w.findAll(".vc-search-bar__chip")).toHaveLength(0);
    expect(w.find(".vc-search-bar__filters-btn").exists()).toBe(false);
    w.unmount();
  });
});
