/**
 * VcDataTable with `searchBar`: `#search-header-actions` in the bar's row and the slot props of it and `#not-found`.
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
import type { GlobalFilterConfig, SearchBarNotFoundSlotProps, SearchBarSlotProps } from "./types";

const { mobile } = vi.hoisted(() => ({ mobile: { value: false } }));

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
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref: r } = await import("vue");
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    useElementSize: () => ({ width: r(800), height: r(600) }),
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

/** Every ResizeObserver the bar creates, with the elements it watches */
const observers: { cb: ResizeObserverCallback; els: Element[] }[] = [];
class RO {
  entry: { cb: ResizeObserverCallback; els: Element[] };
  constructor(cb: ResizeObserverCallback) {
    this.entry = { cb, els: [] };
    observers.push(this.entry);
  }
  observe(el: Element) {
    this.entry.els.push(el);
  }
  unobserve() {}
  disconnect() {
    this.entry.els = [];
  }
}
/** Reports a border-box width for `el` to every observer watching it */
function resize(el: Element, width: number) {
  for (const o of observers.filter((x) => x.els.includes(el))) {
    o.cb(
      [{ target: el, contentRect: { width }, borderBoxSize: [{ inlineSize: width }] } as never],
      {} as ResizeObserver,
    );
  }
}

describe("VcDataTable search bar slots", () => {
  let wrapper: VueWrapper | undefined;
  let query: Record<string, string> = {};

  const mountTable = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
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
        ...props,
      },
      slots,
      global: {
        stubs: { VcInput: InputStub, VcIcon: true },
        provide: { [IsMobileKey as symbol]: ref(mobile.value), [TableQueryStateKey as symbol]: service },
        directives: { loading: { mounted() {}, updated() {} } },
        mocks: { $t: (k: string) => k },
      },
      attachTo: document.body,
    });
    return wrapper;
  };
  const filterEvents = () => (wrapper!.emitted("filter") ?? []) as FilterEvent[];

  /** A `#search-header-actions` slot that records its props */
  const actionsSlot = () => {
    const seen: { props: SearchBarSlotProps | undefined } = { props: undefined };
    const slot = (p: SearchBarSlotProps) => {
      seen.props = p;
      return h("button", { class: "custom-action" }, "Export");
    };
    return { seen, slot };
  };

  beforeEach(() => {
    query = {};
    mobile.value = false;
    observers.length = 0;
    vi.stubGlobal("ResizeObserver", RO);
  });
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  describe("placement", () => {
    it("renders the slot in the bar's row, after the bar and its Filters button", () => {
      const w = mountTable({}, { "search-header-actions": "<button class='custom-action'>Export</button>" });
      const children = [...w.find(".vc-data-table__search-header").element.children];
      expect(children.map((c) => c.className.split(" ")[0])).toEqual([
        "vc-search-bar",
        "vc-data-table__search-header-actions",
      ]);
      expect(children[0].querySelector(".vc-search-bar__filters-btn")).not.toBeNull();
      expect(children[1].querySelector(".custom-action")).not.toBeNull();
      expect(w.find(".vc-search-bar .custom-action").exists()).toBe(false);
    });

    it("on a phone too: search, filter icon, then the slot", () => {
      mobile.value = true;
      const w = mountTable({}, { "search-header-actions": "<button class='custom-action'>Export</button>" });
      const children = [...w.find(".vc-data-table__search-header").element.children];
      expect(children[0].classList.contains("vc-search-bar")).toBe(true);
      expect(children[1].querySelector(".custom-action")).not.toBeNull();
    });

    it("without searchBar the slot stays in the old header's actions, with no props", () => {
      const { seen, slot } = actionsSlot();
      const w = mountTable({ searchBar: false }, { "search-header-actions": slot });
      const actions = w.find(".vc-table-search-header__toolbar > .vc-table-search-header__actions");
      expect(actions.find(".custom-action").exists()).toBe(true);
      expect(actions.find(".vc-global-filters-button__label").exists()).toBe(true);
      expect(w.find(".vc-data-table__search-header").exists()).toBe(false);
      expect(seen.props).toEqual({});
    });
  });

  describe("#search-header-actions props", () => {
    it("start wide and unfiltered", () => {
      const { seen, slot } = actionsSlot();
      mountTable({}, { "search-header-actions": slot });
      expect(seen.props!.mode).toBe("wide");
      expect(seen.props!.filtered).toBe(false);
      expect(seen.props!.filterCount).toBe(0);
      expect(seen.props!.search).toBe("");
      expect(typeof seen.props!.clearAll).toBe("function");
    });

    it("mode follows the bar's width", async () => {
      const { seen, slot } = actionsSlot();
      const w = mountTable({}, { "search-header-actions": slot });
      const bar = w.find(".vc-search-bar").element;
      await nextTick();
      resize(bar, 600);
      await nextTick();
      expect(seen.props!.mode).toBe("medium");
      resize(bar, 300);
      await nextTick();
      expect(seen.props!.mode).toBe("narrow");
      resize(bar, 900);
      await nextTick();
      expect(seen.props!.mode).toBe("wide");
    });

    it("mode is phone on a phone, whatever the width", async () => {
      mobile.value = true;
      const { seen, slot } = actionsSlot();
      const w = mountTable({}, { "search-header-actions": slot });
      await nextTick();
      resize(w.find(".vc-search-bar").element, 900);
      await nextTick();
      expect(seen.props!.mode).toBe("phone");
    });

    it("reflect the bar's filters and search", async () => {
      query.orders_filters = "status:Paid,New;store:main";
      const { seen, slot } = actionsSlot();
      mountTable({ searchValue: "acme" }, { "search-header-actions": slot });
      await nextTick();
      expect(seen.props!.filterCount).toBe(2);
      expect(seen.props!.search).toBe("acme");
      expect(seen.props!.filtered).toBe(true);
    });

    it("clearAll clears the filters and the search with one @filter", async () => {
      query.orders_filters = "status:Paid;store:main";
      const { seen, slot } = actionsSlot();
      const w = mountTable({ searchValue: "acme" }, { "search-header-actions": slot });
      await nextTick();
      const before = filterEvents().length;
      seen.props!.clearAll();
      await nextTick();
      expect(filterEvents().length).toBe(before + 1);
      expect(filterEvents().at(-1)![0].filters).toEqual({});
      expect(w.emitted("update:searchValue")!.at(-1)).toEqual([""]);
      expect(seen.props!.filtered).toBe(false);
      expect(seen.props!.filterCount).toBe(0);
    });
  });

  it("clearAll sends the cleared search with the filter change, not after the search pause", async () => {
    vi.useFakeTimers();
    try {
      query.orders_filters = "status:Paid";
      const log: string[] = [];
      const { slot } = actionsSlot();
      let clearAll: (() => void) | undefined;
      mountTable(
        {
          searchValue: "acme",
          searchDebounce: 300,
          onSearch: (v: string) => log.push(`search ${JSON.stringify(v)}`),
          onFilter: (e: { filters: Record<string, unknown> }) => log.push(`filter ${JSON.stringify(e.filters)}`),
        },
        {
          "search-header-actions": (p: SearchBarSlotProps) => {
            clearAll = p.clearAll;
            return slot(p);
          },
        },
      );
      await nextTick();
      vi.advanceTimersByTime(1000);
      log.length = 0;
      clearAll!();
      expect(log).toEqual(['search ""', "filter {}"]);
      vi.advanceTimersByTime(1000);
      expect(log).toEqual(['search ""', "filter {}"]);
    } finally {
      vi.useRealTimers();
    }
  });

  describe("#not-found props", () => {
    const notFoundSlot = () => {
      const seen: { props: SearchBarNotFoundSlotProps | undefined } = { props: undefined };
      const slot = (p: SearchBarNotFoundSlotProps) => {
        seen.props = p;
        return h("p", { class: "custom-not-found" }, "none");
      };
      return { seen, slot };
    };

    it("get the bar's status plus clearSearch and clearFilters", async () => {
      query.orders_filters = "status:Paid;store:main";
      const { seen, slot } = notFoundSlot();
      const w = mountTable({ searchValue: "acme" }, { "not-found": slot });
      await nextTick();
      expect(w.find(".custom-not-found").exists()).toBe(true);
      expect(seen.props).toMatchObject({ mode: "wide", filtered: true, filterCount: 2, search: "acme" });

      seen.props!.clearSearch();
      await nextTick();
      expect(w.emitted("update:searchValue")!.at(-1)).toEqual([""]);
      expect(query.orders_filters).toBe("status:Paid;store:main");

      seen.props!.clearFilters();
      await nextTick();
      expect(filterEvents().at(-1)![0].filters).toEqual({});
    });

    it("clearAll from the not-found slot clears both", async () => {
      query.orders_filters = "status:Paid";
      const { seen, slot } = notFoundSlot();
      const w = mountTable({ searchValue: "acme" }, { "not-found": slot });
      await nextTick();
      seen.props!.clearAll();
      await nextTick();
      expect(filterEvents().at(-1)![0].filters).toEqual({});
      expect(w.emitted("update:searchValue")!.at(-1)).toEqual([""]);
    });

    it("without searchBar the slot gets no props", async () => {
      const { seen, slot } = notFoundSlot();
      const w = mountTable({ searchBar: false, searchValue: "acme" }, { "not-found": slot });
      await nextTick();
      expect(w.find(".custom-not-found").exists()).toBe(true);
      // the compiler's branch key is all it got on v2.11.0 too
      expect(seen.props).toEqual({ key: 0 });
    });
  });
});
