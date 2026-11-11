/**
 * VcDataTable with `searchBar`: the footer filter status and the reason-based empty state.
 * Real orchestrator and real bar; the bar's state comes from the URL.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import VcDataTable from "./VcDataTable.vue";
import { IsMobileKey } from "@framework/injection-keys";
import {
  TableQueryStateKey,
  decodeQueryState,
  encodeQueryState,
  type ITableQueryStateService,
} from "@core/blade-navigation/table-query-state";
import type { GlobalFilterConfig } from "./types";

const { footerWidth, mobile } = vi.hoisted(() => ({ footerWidth: { value: 800 }, mobile: { value: false } }));

vi.mock("@ui/components/organisms/vc-data-table/components", async (importOriginal) => {
  const { defineComponent: dc } = await import("vue");
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    Table: dc({ name: "VcTable", template: "<div class='mock-table'><slot /><slot name='empty' /></div>" }),
    TableFooter: dc({ name: "TableFooter", template: "<div><slot /></div>" }),
    TableRowActions: dc({ name: "TableRowActions", template: "<div />" }),
    DataTableHeader: dc({ name: "DataTableHeader", template: "<div />" }),
    DataTableBody: dc({
      name: "DataTableBody",
      props: ["emptyTitle", "items"],
      template: "<div class='mock-body'><slot v-if='!items.length' name='empty'>{{ emptyTitle }}</slot></div>",
    }),
    TableColumnSwitcher: dc({ name: "TableColumnSwitcher", template: "<div />" }),
    TableSelectAllBar: dc({ name: "TableSelectAllBar", template: "<div />" }),
  };
});

vi.mock("@ui/components/molecules", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  VcPagination: defineComponent({ name: "VcPagination", template: "<div class='mock-pagination' />" }),
}));

vi.mock("@framework/core/composables/useResponsive", () => ({
  useResponsive: () => ({ isMobile: ref(mobile.value), isDesktop: ref(!mobile.value) }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, p?: Record<string, unknown>) => (p ? `${key}:${JSON.stringify(p)}` : key),
  }),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref: r } = await import("vue");
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    useElementSize: () => ({ width: r(footerWidth.value), height: r(600) }),
  };
});

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
  { id: "store", label: "Store", filter: true },
];

type FilterEvent = { filters: Record<string, unknown> }[];

const STATUS = ".vc-data-table__filter-status";
const NO_RESULTS = ".vc-data-table__no-results";
const T = "COMPONENTS.ORGANISMS.VC_DATA_TABLE";

describe("VcDataTable search bar: footer status and empty state", () => {
  let wrapper: VueWrapper | undefined;
  let query: Record<string, string> = {};

  const mountTable = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    const service: ITableQueryStateService = {
      read: (key) => decodeQueryState(key!, query),
      write: (key, patch) => Object.assign(query, encodeQueryState(key!, patch)),
    };
    wrapper = mount(VcDataTable as never, {
      props: {
        items: [],
        stateKey: "orders",
        searchBar: true,
        searchable: true,
        globalFilters,
        searchDebounce: 0,
        pagination: { currentPage: 1, pages: 3 },
        totalCount: 0,
        ...props,
      },
      slots,
      global: {
        stubs: { VcInput: InputStub, VcIcon: true },
        provide: { [IsMobileKey as symbol]: ref(false), [TableQueryStateKey as symbol]: service },
        directives: { loading: { mounted() {}, updated() {} } },
        mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) },
      },
      attachTo: document.body,
    });
    return wrapper;
  };
  const lastFilter = () => ((wrapper!.emitted("filter") ?? []) as FilterEvent[]).at(-1)?.[0].filters;

  beforeEach(() => {
    query = {};
    footerWidth.value = 800;
    mobile.value = false;
  });
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    localStorage.clear();
  });

  describe("footer status", () => {
    it("shows filtered from M, the filter count with search, and Clear all", async () => {
      query.orders_filters = "status:Paid;store:main";
      const w = mountTable({ searchValue: "acme", unfilteredCount: 120, items: [{ id: 1 }], totalCount: 1 });
      await nextTick();
      const status = w.find(STATUS);
      expect(status.text()).toContain(`${T}.STATUS.FILTERED_FROM:{"count":120}`);
      expect(status.text()).toContain(`${T}.STATUS.FILTERS_AND_SEARCH:{"count":2}`);
      expect(status.find("button").text()).toBe(`${T}.STATUS.CLEAR_ALL`);
      // next to the range text
      expect(w.find(".vc-data-table__page-summary > .vc-data-table__page-info + " + STATUS).exists()).toBe(true);
    });

    it("without unfilteredCount: no filtered from; filters only and search only", async () => {
      query.orders_filters = "status:Paid";
      const w = mountTable({ items: [{ id: 1 }], totalCount: 1 });
      await nextTick();
      expect(w.find(STATUS).text()).not.toContain("FILTERED_FROM");
      expect(w.find(STATUS).text()).toContain(`${T}.STATUS.FILTERS:{"count":1}`);
      w.unmount();

      query = {};
      const w2 = mountTable({ searchValue: "acme", items: [{ id: 1 }], totalCount: 1 });
      // the bar reports its status once it has mounted
      await nextTick();
      expect(w2.find(STATUS).text()).toContain(`${T}.STATUS.SEARCH`);
    });

    it("is hidden with nothing applied; column filters do not count", async () => {
      const w = mountTable({ items: [{ id: 1 }], totalCount: 1 });
      await nextTick();
      expect(w.find(STATUS).exists()).toBe(false);
      expect(w.find(".vc-data-table__page-summary").exists()).toBe(false);
      expect(w.find(".vc-data-table__pagination > .vc-data-table__page-info").exists()).toBe(true);
    });

    it("a narrow footer drops filtered from", async () => {
      footerWidth.value = 400;
      query.orders_filters = "status:Paid";
      const w = mountTable({ unfilteredCount: 120, items: [{ id: 1 }], totalCount: 1 });
      await nextTick();
      expect(w.find(STATUS).text()).not.toContain("FILTERED_FROM");
      expect(w.find(STATUS).text()).toContain(`${T}.STATUS.FILTERS:{"count":1}`);
    });

    it("is hidden on a phone, where the bar's summary line carries it", async () => {
      mobile.value = true;
      query.orders_filters = "status:Paid";
      const w = mountTable({ items: [{ id: 1 }], totalCount: 1 });
      await nextTick();
      expect(w.find(".vc-search-bar__phone-summary, .vc-search-bar--mobile").exists()).toBe(true);
      expect(w.find(STATUS).exists()).toBe(false);
    });

    it("Clear all with only a search clears it without another filter event", async () => {
      const w = mountTable({ searchValue: "acme", items: [{ id: 1 }], totalCount: 1 });
      await nextTick();
      const before = (w.emitted("filter") ?? []).length;
      await w.find(`${STATUS} button`).trigger("click");
      expect(w.emitted("update:searchValue")!.at(-1)).toEqual([""]);
      await new Promise((r) => setTimeout(r, 0));
      expect(w.emitted("search")!.at(-1)).toEqual([""]);
      expect((w.emitted("filter") ?? []).length).toBe(before);
    });

    it("Clear all clears bar filters and search, keeps column filters, selects the system view", async () => {
      query.orders_filters = "status:Paid";
      query.orders_view = "paid";
      const w = mountTable({
        searchValue: "acme",
        items: [{ id: 1 }],
        totalCount: 1,
        searchViews: [{ id: "paid", name: "Paid", values: { status: ["Paid"] } }],
      });
      await nextTick();
      expect(w.find(".vc-search-bar__view-btn").text()).toContain("Paid");
      // a column filter set through the orchestrator stays in the payload
      const header = w.findComponent({ name: "DataTableHeader" });
      header.vm.$emit("filter-apply", { id: "name", props: { id: "name", filter: true } }, { name: "Acme" });
      expect(lastFilter()).toEqual({ name: "Acme", status: ["Paid"] });

      await w.find(`${STATUS} button`).trigger("click");
      expect(lastFilter()).toEqual({ name: "Acme" });
      expect(w.emitted("update:searchValue")!.at(-1)).toEqual([""]);
      expect(query.orders_filters).toBe("");
      await nextTick();
      expect(w.find(STATUS).exists()).toBe(false);
      expect(w.find(".vc-search-bar__chip").exists()).toBe(false);
      expect(w.find(".vc-search-bar__view-btn").text()).toContain("VIEWS.ALL");
    });
  });

  describe("empty state", () => {
    it("names the search and the filter count, lists removable tags", async () => {
      query.orders_filters = "status:Paid,New;store:main";
      const w = mountTable({ searchValue: "acme" });
      await nextTick();
      const empty = w.find(NO_RESULTS);
      expect(empty.text()).toContain(`${T}.NO_RESULTS.TITLE_SEARCH_FILTERS:{"query":"acme","count":2}`);
      expect(empty.text()).toContain(`${T}.NO_RESULTS.HINT_FILTERS`);
      expect(empty.findAll(".vc-data-table__no-results-tag").map((t) => t.find("span").text())).toEqual([
        "Status: Paid, New",
        "Store: main",
      ]);
      expect(empty.findComponent({ name: "VcIcon" }).attributes("icon")).toBe("lucide-funnel-x");
      expect(empty.text()).toContain(`${T}.NO_RESULTS.CLEAR_SEARCH`);
      expect(empty.text()).toContain(`${T}.NO_RESULTS.CLEAR_FILTERS`);
    });

    it("search only and filters only titles", async () => {
      const w = mountTable({ searchValue: "acme" });
      await nextTick();
      expect(w.find(NO_RESULTS).text()).toContain(`${T}.NO_RESULTS.TITLE_SEARCH:{"query":"acme"}`);
      expect(w.find(NO_RESULTS).text()).toContain(`${T}.NO_RESULTS.HINT_SEARCH`);
      expect(w.find(NO_RESULTS).text()).not.toContain("CLEAR_FILTERS");
      expect(w.find(NO_RESULTS).findComponent({ name: "VcIcon" }).attributes("icon")).toBe("lucide-search-x");
      w.unmount();

      query = { orders_filters: "status:Paid" };
      const w2 = mountTable();
      await nextTick();
      expect(w2.find(NO_RESULTS).text()).toContain(`${T}.NO_RESULTS.TITLE_FILTERS:{"count":1}`);
      expect(w2.find(NO_RESULTS).text()).not.toContain("CLEAR_SEARCH");
    });

    it("a tag's × removes that one field; Clear filters keeps the search; Clear search keeps the filters", async () => {
      query.orders_filters = "status:Paid;store:main";
      const w = mountTable({ searchValue: "acme" });
      await nextTick();
      await w.findAll(".vc-data-table__no-results-tag-x")[0].trigger("click");
      expect(lastFilter()).toEqual({ store: "main" });
      expect(query.orders_filters).toBe("store:main");

      const button = (label: string) => w.findAll(`${NO_RESULTS} button`).find((b) => b.text().endsWith(label))!;
      await button("CLEAR_SEARCH").trigger("click");
      expect(w.emitted("update:searchValue")!.at(-1)).toEqual([""]);
      expect(query.orders_filters).toBe("store:main");

      await nextTick();
      await button("CLEAR_FILTERS").trigger("click");
      expect(lastFilter()).toEqual({});
    });

    it("notFoundState wins over it", async () => {
      query.orders_filters = "status:Paid";
      const w = mountTable({ notFoundState: { title: "Custom not found" } });
      await nextTick();
      expect(w.find(NO_RESULTS).exists()).toBe(false);
      expect(w.find(".mock-body").text()).toBe("Custom not found");
    });

    it("the not-found slot wins over it", async () => {
      query.orders_filters = "status:Paid";
      const w = mountTable({}, { "not-found": "<p class='custom-not-found'>none</p>" });
      await nextTick();
      expect(w.find(NO_RESULTS).exists()).toBe(false);
      expect(w.find(".custom-not-found").exists()).toBe(true);
    });

    it("a column filter alone keeps the generic not-found content", async () => {
      const w = mountTable();
      w.findComponent({ name: "DataTableHeader" }).vm.$emit(
        "filter-apply",
        { id: "name", props: { id: "name", filter: true } },
        { name: "Acme" },
      );
      await nextTick();
      expect(w.find(NO_RESULTS).exists()).toBe(false);
      expect(w.find(".mock-body").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND_TITLE");
    });

    it("without searchBar the table keeps the generic not-found content and no status", async () => {
      const w = mountTable({ searchBar: false, searchValue: "acme" });
      await nextTick();
      expect(w.find(NO_RESULTS).exists()).toBe(false);
      expect(w.find(STATUS).exists()).toBe(false);
      expect(w.find(".mock-body").text()).toBe("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND_TITLE");
    });
  });
});
