import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { IsMobileKey } from "@framework/injection-keys";
import VcSearchBar from "./VcSearchBar.vue";
import { SEARCH, accLabels, fields, global, lastChange, mountBar, stubs } from "./bar.test-helpers";

describe("VcSearchBar phone", () => {
  let wrapper: ReturnType<typeof mountBar> | undefined;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const SheetStub = defineComponent({
    name: "VcSidebar",
    props: [
      "modelValue",
      "title",
      "position",
      "height",
      "draggable",
      "dragHandle",
      "closeButton",
      "inset",
      "ariaLabel",
      "panelClass",
    ],
    emits: ["update:modelValue"],
    setup:
      (props, { slots }) =>
      () =>
        props.modelValue ? h("div", { class: "vc-sidebar sheet-stub" }, slots.default?.()) : null,
  });
  const mountPhone = (props: Record<string, unknown> = {}) =>
    mount(VcSearchBar, {
      props: { fields, ...props },
      global: {
        ...global,
        stubs: { ...stubs, VcSidebar: SheetStub },
        provide: { [IsMobileKey as symbol]: ref(true) },
      },
      attachTo: document.body,
    });

  const S = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PHONE.";
  const summary = () => wrapper!.find(".vc-search-bar__summary");
  const parts = () =>
    wrapper!.findAll(".vc-search-bar__summary-part:not(.vc-search-bar__summary-action)").map((p) => p.text());

  it("phone: the search and an icon Filters button with a badge whose panel opens in a sheet", async () => {
    wrapper = mountPhone({ modelValue: { search: "", values: { status: ["a"] } } });
    expect(wrapper.find(SEARCH).exists()).toBe(true);
    expect(wrapper.find(".vc-search-bar__chip").exists()).toBe(false);
    expect(wrapper.find(".vc-search-bar__filters-btn--icon").exists()).toBe(true);
    expect(wrapper.get(".vc-search-bar__filters-badge").text()).toBe("1");
    expect(wrapper.find(".vc-search-bar__filters-x").exists()).toBe(false);
    await wrapper.get(".vc-search-bar__filters-main").trigger("click");
    expect(wrapper.find(".sheet-stub").exists()).toBe(true);
    expect(wrapper.find(".sheet-stub .vc-search-bar__panel--touch").exists()).toBe(true);
    expect(wrapper.find(".sheet-stub .vc-search-bar__sheet-head").exists()).toBe(true);
    expect(accLabels()).toEqual(["Status", "Created", "Store"]);
    expect(wrapper.findComponent(SheetStub).props()).toMatchObject({
      position: "bottom",
      // the Filters sheet takes its content's height
      height: "auto",
      draggable: true,
      dragHandle: true,
      closeButton: false,
      inset: true,
      ariaLabel: "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.FILTERS",
      panelClass: "vc-search-bar__sheet",
    });
  });

  it("the sheet: Done closes it, Clear clears the filters, a view chip applies its view", async () => {
    wrapper = mountPhone({
      modelValue: { search: "", values: { status: ["a"] } },
      views: [{ id: "store-x", name: "Store X", values: { store: "x" } }],
    });
    const open = () => wrapper!.get(".vc-search-bar__filters-main").trigger("click");
    await open();
    await wrapper.get(".vc-search-bar__sheet-clear").trigger("click");
    expect(lastChange(wrapper).state.values).toEqual({});
    const chip = wrapper.findAll(".vc-search-bar__view-chip").find((c) => c.text() === "Store X")!;
    await chip.trigger("click");
    expect(lastChange(wrapper).state.values).toEqual({ store: "x" });
    await wrapper.get(".vc-search-bar__sheet-done").trigger("click");
    expect(wrapper.find(".sheet-stub").exists()).toBe(false);
  });

  it("summary when filtered: results, view, filtered from, filter count and Clear all", async () => {
    wrapper = mountPhone({
      views: [{ id: "mine", name: "Mine", values: { status: ["a"] } }],
      resultCount: 12,
      unfilteredCount: 40,
    });
    await wrapper.get(".vc-search-bar__filters-main").trigger("click");
    await wrapper
      .findAll(".vc-search-bar__view-chip")
      .find((c) => c.text() === "Mine")!
      .trigger("click");
    await wrapper.get(".vc-search-bar__sheet-done").trigger("click");
    expect(parts()).toEqual([`${S}RESULTS:12`, "Mine", `${S}FILTERED_FROM:40`, `${S}FILTER_COUNT:1`]);
    await wrapper.setProps({ modelValue: { search: "", values: { status: ["a"], store: "x" } } });
    expect(parts()).toEqual([`${S}RESULTS:12`, "Mine*", `${S}FILTERED_FROM:40`, `${S}FILTER_COUNT:2`]);
    await wrapper.get(".vc-search-bar__summary-clear").trigger("click");
    expect(lastChange(wrapper).state.values).toEqual({});
  });

  it("summary when not filtered: items only, no filtered from, no Clear all", () => {
    wrapper = mountPhone({ resultCount: 40, unfilteredCount: 40 });
    expect(parts()).toEqual([`${S}ITEMS:40`]);
    expect(wrapper.find(".vc-search-bar__summary-clear").exists()).toBe(false);
  });

  it("summary: a search alone counts as filtered", async () => {
    wrapper = mountPhone({ modelValue: { search: "acme", values: {} }, resultCount: 3, unfilteredCount: 40 });
    expect(parts()).toEqual([`${S}RESULTS:3`, `${S}FILTERED_FROM:40`]);
  });

  it("summary leaves out what it has no data for, and is gone when empty", () => {
    wrapper = mountPhone({ modelValue: { search: "", values: { status: ["a"] } } });
    expect(parts()).toEqual(["COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL*", `${S}FILTER_COUNT:1`]);
    wrapper.unmount();
    wrapper = mountPhone();
    expect(summary().exists()).toBe(false);
  });

  it("summary shows the system view only when it is modified", async () => {
    wrapper = mountPhone({ resultCount: 40 });
    expect(parts()).toEqual([`${S}ITEMS:40`]);
    await wrapper.setProps({ modelValue: { search: "", values: { status: ["a"] } } });
    expect(parts()).toEqual([`${S}RESULTS:40`, "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL*", `${S}FILTER_COUNT:1`]);
  });

  it("no slash hint in the phone search", () => {
    wrapper = mountPhone();
    expect(wrapper.find(SEARCH).exists()).toBe(true);
    expect(wrapper.find(".vc-search-bar__search-hint").exists()).toBe(false);
  });

  it("no summary on desktop", () => {
    wrapper = mountBar({ resultCount: 12, modelValue: { search: "", values: { status: ["a"] } } });
    expect(wrapper.find(".vc-search-bar__summary").exists()).toBe(false);
  });
});
