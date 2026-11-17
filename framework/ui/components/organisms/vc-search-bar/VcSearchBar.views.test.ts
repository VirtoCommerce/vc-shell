import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, ref, type VNode } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { IsMobileKey } from "@framework/injection-keys";
import { BladeTitleAddonKey } from "@ui/components/organisms/vc-blade/_internal/composables/useBladeTitleAddon";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import VcSearchBar from "./VcSearchBar.vue";
import type { SearchBarChange, SearchBarField } from "./types";
import { CHIP, SEARCH, fakeQueryState, fields, global, lastChange, mountBar } from "./bar.test-helpers";

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
    wrapper = mountBar({ storageKey: "orders" }, url.provide);
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

  it("a link with only the view applies its values in the one setup change", () => {
    const views = [{ id: "late", name: "Late", values: { overdue: true } }];
    const url = fakeQueryState({ orders: { view: "late" } });
    wrapper = mountBar({ storageKey: "orders", views }, url.provide);
    expect(wrapper.emitted("change")).toHaveLength(1);
    expect(lastChange(wrapper).filters).toEqual({ overdue: true });
    expect(wrapper.get(".vc-search-bar__view-btn-name").text()).toBe("Late");
    expect(wrapper.find(".vc-search-bar__view-badge").exists()).toBe(false);
    expect(url.store.orders).toMatchObject({ filters: "overdue:1", view: "late" });
  });

  it("a view registered after setup applies when it arrives, if nothing was set meanwhile", async () => {
    const views = ref<{ id: string; name: string; values: Record<string, unknown> }[]>([]);
    const url = fakeQueryState({ orders: { view: "late" } });
    wrapper = mountBar({ storageKey: "orders", views: views.value }, url.provide);
    expect(wrapper.emitted("change")).toBeUndefined();
    await wrapper.setProps({ views: [{ id: "late", name: "Late", values: { overdue: true } }] });
    expect(wrapper.emitted("change")).toHaveLength(1);
    expect(lastChange(wrapper).filters).toEqual({ overdue: true });
    expect(wrapper.get(".vc-search-bar__view-btn-name").text()).toBe("Late");
  });

  it.each([
    ["without a default view", false],
    ["with a default view", true],
  ])(
    "removing the last chip of a view switches to the system view (%s); a reload stays there",
    async (_n, withDefault) => {
      const views = [
        { id: "late", name: "Late", values: { overdue: true } },
        ...(withDefault ? [{ id: "paid", name: "Paid", values: { status: ["a"] }, default: true }] : []),
      ];
      const url = fakeQueryState({ orders: { view: "late", filters: "overdue:1" } });
      wrapper = mountBar({ storageKey: "orders", views }, url.provide);
      await wrapper.get(`${CHIP} .vc-search-bar__chip-x`).trigger("click");
      await nextTick();
      expect(lastChange(wrapper).filters).toEqual({});
      expect(wrapper.get(".vc-search-bar__view-btn-name").text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL");
      expect(wrapper.find(".vc-search-bar__view-badge").exists()).toBe(false);
      expect(url.store.orders.view).toBe("all");
      expect(url.store.orders.filters).toBe("");
      wrapper.unmount();

      const reload = fakeQueryState({ orders: { ...url.store.orders } });
      wrapper = mountBar({ storageKey: "orders", views }, reload.provide);
      expect(wrapper.emitted("change")).toBeUndefined();
      expect(wrapper.get(".vc-search-bar__view-btn-name").text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL");
      expect(wrapper.find(CHIP).exists()).toBe(false);
    },
  );

  it("registers the view selector with the blade; renders it in the row without a blade", async () => {
    const unregister = vi.fn();
    let render: (() => VNode) | undefined;
    const register = vi.fn((r: () => VNode) => {
      render = r;
      return unregister;
    });
    wrapper = mountBar({}, { [BladeTitleAddonKey as symbol]: { register } });
    expect(register).toHaveBeenCalledTimes(1);
    expect(render?.().type).toMatchObject({ name: "ViewSelector" });
    expect(wrapper.find(".vc-search-bar__view-selector").exists()).toBe(false);
    wrapper.unmount();
    expect(unregister).toHaveBeenCalledTimes(1);

    // another bar holds the header
    wrapper = mountBar({}, { [BladeTitleAddonKey as symbol]: { register: () => null } });
    expect(wrapper.find(".vc-search-bar__row .vc-search-bar__view-selector").exists()).toBe(true);
    wrapper.unmount();

    wrapper = mountBar();
    expect(wrapper.find(".vc-search-bar__row .vc-search-bar__view-selector").exists()).toBe(true);
  });

  it("a phone neither registers nor shows a selector", () => {
    const register = vi.fn(() => vi.fn());
    wrapper = mountBar({}, { [BladeTitleAddonKey as symbol]: { register }, [IsMobileKey as symbol]: ref(true) });
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
      filter: { component: rating, label: (v) => `${v}+ stars` },
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

  it("offers the contributed views", async () => {
    w = mountIn();
    await w.get(".vc-search-bar__view-btn").trigger("click");
    expect(document.body.textContent).toContain("Top rated");
  });
});

describe("VcSearchBar written by its host through v-model (the table's footer and empty state)", () => {
  let w: ReturnType<typeof mountBar> | undefined;
  const views = [{ id: "late", name: "Late", values: { overdue: true } }];
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    w?.unmount();
    w = undefined;
    vi.useRealTimers();
    localStorage.clear();
  });

  it("a host write clears the values and the search: the URL follows, the view ends on All, nothing is emitted", async () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1;status:a", view: "late" } });
    w = mountBar({ storageKey: "orders", views, modelValue: { search: "acme", values: {} } }, url.provide);
    const changes = (w.emitted("change") ?? []).length;
    const models = (w.emitted("update:modelValue") ?? []).length;
    await w.setProps({ modelValue: { search: "", values: {} } });
    await nextTick();
    expect((w.get(SEARCH).element as HTMLInputElement).value).toBe("");
    expect(w.find(CHIP).exists()).toBe(false);
    expect(url.store.orders).toMatchObject({ filters: "", view: "all" });
    expect(w.emitted("change") ?? []).toHaveLength(changes);
    expect(w.emitted("update:modelValue") ?? []).toHaveLength(models);
    expect(w.emitted("search")).toBeUndefined();
  });

  it("a host write without one field keeps the rest and the search", async () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1;status:a" } });
    w = mountBar({ storageKey: "orders", modelValue: { search: "acme", values: {} } }, url.provide);
    await w.setProps({ modelValue: { search: "acme", values: { status: ["a"] } } });
    expect(w.findAll(CHIP).map((c) => c.text())).toEqual(["Status: A"]);
    expect((w.get(SEARCH).element as HTMLInputElement).value).toBe("acme");
    expect(url.store.orders.filters).toBe("status:a");
  });
});
