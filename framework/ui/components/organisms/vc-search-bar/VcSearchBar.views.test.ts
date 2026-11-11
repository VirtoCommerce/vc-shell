import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, ref, type VNode } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { BladeViewSelectorKey, IsMobileKey } from "@framework/injection-keys";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import VcSearchBar from "./VcSearchBar.vue";
import type { SearchBarChange, SearchBarField } from "./types";
import { CHIP, fakeQueryState, fields, global, lastChange, mountBar } from "./bar.test-helpers";

describe("VcSearchBar views and URL", () => {
  let wrapper: ReturnType<typeof mountBar> | undefined;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.useRealTimers();
    localStorage.clear();
  });

  it("filters restored from the URL emit one change at setup", () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1" } });
    wrapper = mountBar({ storageKey: "orders", search: "" }, url.provide);
    const changes = wrapper.emitted("change") as SearchBarChange[][];
    expect(changes).toHaveLength(1);
    expect(changes[0][0]).toMatchObject({ search: "", filters: { overdue: true } });
  });

  it("the default view applies at setup through the same single change; URL filters win over it", () => {
    const views = [{ id: "late", name: "Late", values: { overdue: true }, default: true }];
    const empty = fakeQueryState();
    wrapper = mountBar({ storageKey: "orders", views }, empty.provide);
    expect(wrapper.emitted("change")).toHaveLength(1);
    expect(lastChange(wrapper).filters).toEqual({ overdue: true });
    expect(empty.store.orders).toMatchObject({ filters: "overdue:1", view: "late" });
    wrapper.unmount();

    const url = fakeQueryState({ orders: { filters: "status:a" } });
    wrapper = mountBar({ storageKey: "orders", views }, url.provide);
    expect(wrapper.emitted("change")).toHaveLength(1);
    expect(lastChange(wrapper).filters).toEqual({ status: ["a"] });
  });

  it("a non-empty initial v-model wins over the default view", () => {
    const views = [{ id: "late", name: "Late", values: { overdue: true }, default: true }];
    const url = fakeQueryState();
    wrapper = mountBar(
      { storageKey: "orders", views, modelValue: { search: "", values: { status: ["a"] } } },
      url.provide,
    );
    expect(wrapper.emitted("change")).toBeUndefined();
    expect(wrapper.get(".vc-search-bar__view-btn-name").text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL");
    expect(wrapper.find(".vc-search-bar__view-badge").exists()).toBe(true);
  });

  it("Clear all switches to the system view", async () => {
    const views = [{ id: "late", name: "Late", values: { overdue: true }, default: true }];
    const url = fakeQueryState();
    wrapper = mountBar({ storageKey: "orders", views }, url.provide);
    await wrapper.get(".vc-search-bar__filters-x").trigger("click");
    expect(lastChange(wrapper).filters).toEqual({});
    expect(url.store.orders.view).toBe("all");
    expect(wrapper.get(".vc-search-bar__view-btn-name").text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL");
  });

  it("registers the view selector with the blade; renders it in the row without a blade", async () => {
    const unregister = vi.fn();
    let render: (() => VNode) | undefined;
    const register = vi.fn((r: () => VNode) => {
      render = r;
      return unregister;
    });
    wrapper = mountBar({}, { [BladeViewSelectorKey as symbol]: { register } });
    expect(register).toHaveBeenCalledTimes(1);
    expect(render?.().type).toMatchObject({ name: "ViewSelector" });
    expect(wrapper.find(".vc-search-bar__view-selector").exists()).toBe(false);
    wrapper.unmount();
    expect(unregister).toHaveBeenCalledTimes(1);

    // another bar holds the header
    wrapper = mountBar({}, { [BladeViewSelectorKey as symbol]: { register: () => null } });
    expect(wrapper.find(".vc-search-bar__row .vc-search-bar__view-selector").exists()).toBe(true);
    wrapper.unmount();

    wrapper = mountBar();
    expect(wrapper.find(".vc-search-bar__row .vc-search-bar__view-selector").exists()).toBe(true);
  });

  it("a phone neither registers nor shows a selector", () => {
    const register = vi.fn(() => vi.fn());
    wrapper = mountBar({}, { [BladeViewSelectorKey as symbol]: { register }, [IsMobileKey as symbol]: ref(true) });
    expect(register).not.toHaveBeenCalled();
    expect(wrapper.find(".vc-search-bar__view-selector").exists()).toBe(false);
  });
});

describe("external filters", () => {
  const rating = defineComponent({ name: "RatingEditor", props: ["modelValue"], setup: () => () => h("div") });
  const external: SearchBarField[] = [
    {
      id: "rating",
      label: "Rating",
      filter: { component: rating, label: (v) => `${v}+ stars`, toPhrase: (v) => `rating:[${v} TO]` },
    },
  ];
  let w: ReturnType<typeof mount> | undefined;
  const mountIn = (props: Record<string, unknown> = {}) =>
    mount(VcSearchBar, {
      props: { fields, modelValue: { search: "", values: { status: ["a"], rating: 4 } }, ...props },
      global: { ...global, provide: { [BladeDescriptorKey as symbol]: computed(() => ({ name: "Orders" })) } },
      attachTo: document.body,
    });
  beforeEach(() =>
    registerExternalSearchFilters({
      id: "t13",
      targetBlades: ["orders"],
      fields: external,
      views: [{ id: "top", name: "Top rated", values: { rating: 5 } }],
    }),
  );
  afterEach(() => {
    w?.unmount();
    unregisterExternalSearchFilters("t13");
  });

  it("shows the contributed chip with the custom label", () => {
    w = mountIn();
    expect(w.findAll(CHIP).map((c) => c.text())).toEqual(["Status: A", "Rating: 4+ stars"]);
  });

  it("does not show it for another name", () => {
    w = mountIn({ name: "other" });
    expect(w.text()).not.toContain("Rating");
  });

  it("puts toPhrase output into the phrase", async () => {
    w = mountIn();
    await w.get(`${CHIP} .vc-search-bar__chip-x`).trigger("click");
    expect((w.emitted("change") as SearchBarChange[][]).at(-1)?.[0].phrase).toBe("rating:[4 TO]");
  });

  it("offers the contributed views", async () => {
    w = mountIn();
    await w.get(".vc-search-bar__view-btn").trigger("click");
    expect(document.body.textContent).toContain("Top rated");
  });
});

describe("VcSearchBar exposed controls (driven by the table's footer and empty state)", () => {
  let w: ReturnType<typeof mountBar> | undefined;
  type Exposed = { clearAll(): void; clearFilters(): void; removeFilter(id: string): void };
  const api = () => w!.vm as unknown as Exposed;
  const views = [{ id: "late", name: "Late", values: { overdue: true } }];
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    w?.unmount();
    w = undefined;
    vi.useRealTimers();
    localStorage.clear();
  });

  it("clearAll clears the filters and the search in one change and selects the system view", async () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1;status:a", view: "late" } });
    w = mountBar({ storageKey: "orders", views, search: "acme" }, url.provide);
    const before = (w.emitted("change") ?? []).length;
    api().clearAll();
    const changes = w.emitted("change") as SearchBarChange[][];
    expect(changes).toHaveLength(before + 1);
    expect(lastChange(w)).toMatchObject({ search: "", filters: {} });
    expect(w.emitted("update:search")).toEqual([[""]]);
    await nextTick();
    expect(url.store.orders).toMatchObject({ filters: "", view: undefined });
  });

  it("clearAll without search text emits no search update", () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1" } });
    w = mountBar({ storageKey: "orders" }, url.provide);
    api().clearAll();
    expect(lastChange(w)).toMatchObject({ search: "", filters: {} });
    expect(w.emitted("update:search")).toBeUndefined();
  });

  it("clearFilters keeps the search; removeFilter drops one field", () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1;status:a" } });
    w = mountBar({ storageKey: "orders", search: "acme" }, url.provide);
    api().removeFilter("overdue");
    expect(lastChange(w)).toMatchObject({ search: "acme", filters: { status: ["a"] } });
    api().clearFilters();
    expect(lastChange(w)).toMatchObject({ search: "acme", filters: {} });
  });
});
