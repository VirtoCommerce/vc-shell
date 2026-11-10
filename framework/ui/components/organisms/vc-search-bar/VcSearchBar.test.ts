import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, ref } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { IsMobileKey } from "@framework/injection-keys";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import VcSearchBar from "./VcSearchBar.vue";
import DateRangeEditor from "./components/editors/DateRangeEditor.vue";
import SelectEditor from "./components/editors/SelectEditor.vue";
import NumberEditor from "./components/editors/NumberEditor.vue";
import MenuHost from "./components/MenuHost.vue";
import PillEditor from "./components/PillEditor.vue";
import FilterRow from "./components/FilterRow.vue";
import AllPresets from "./components/AllPresets.vue";
import PresetSaveInline from "./components/PresetSaveInline.vue";
import { normalizeField } from "./lib/fields";
import {
  TableQueryStateKey,
  type ITableQueryStateService,
  type TableQueryPatch,
} from "@core/blade-navigation/table-query-state";
import type { SearchBarChange, SearchBarField, SearchBarState } from "./types";

// Captures the row reveal options, so a test can read keepOpen
const reveal = vi.hoisted(() => ({ keepOpen: undefined as undefined | (() => boolean) }));
vi.mock("./composables/useRowReveal", async (importOriginal) => {
  const m = await importOriginal<typeof import("./composables/useRowReveal")>();
  return {
    ...m,
    useRowReveal: (o: Parameters<typeof m.useRowReveal>[0]) => {
      reveal.keepOpen = o.keepOpen;
      return m.useRowReveal(o);
    },
  };
});

const DatePickerStub = defineComponent({
  name: "VcDatePicker",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup: () => () => h("div", { class: "date-picker-stub" }),
});
const InputStub = defineComponent({
  name: "VcInput",
  props: ["modelValue"],
  emits: ["update:modelValue", "blur"],
  setup:
    (props, { emit, slots }) =>
    () =>
      h("div", [
        slots["prepend-inner"]?.(),
        h("input", {
          class: "input-stub",
          value: props.modelValue,
          onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
          onBlur: () => emit("blur"),
        }),
      ]),
});
const stubs = { VcDatePicker: DatePickerStub, VcInput: InputStub, VcIcon: true, VcCheckbox: true };
const global = {
  stubs,
  mocks: { $t: (k: string, p?: Record<string, string>) => (p ? `${k}:${Object.values(p).join(",")}` : k) },
};

const fields: SearchBarField[] = [
  { id: "status", label: "Status", filter: { options: [{ value: "a", label: "A" }], multiple: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "store", label: "Store", filter: true, pinned: false },
];

/** Row pills, without the "+ Filter" button */
const PILL = ".vc-search-bar__pill:not(.vc-search-bar__pill--add)";
const BUILDER_BTN = '[aria-label="COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TITLE"]';

/** ResizeObserver stand-in: `resize(w)` reports a new width of the bar root */
function fakeResizeObserver() {
  const observers: { cb: ResizeObserverCallback; el?: Element }[] = [];
  class FakeResizeObserver {
    el?: Element;
    constructor(public cb: ResizeObserverCallback) {
      observers.push(this);
    }
    observe(el: Element) {
      this.el = el;
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  return async (width: number) => {
    // the bar starts observing its root after mount
    await nextTick();
    for (const o of observers)
      if (o.el?.classList.contains("vc-search-bar"))
        o.cb([{ contentRect: { width } } as ResizeObserverEntry], o as unknown as ResizeObserver);
    await nextTick();
  };
}

const mountBar = (props: Record<string, unknown> = {}, provide: Record<symbol, unknown> = {}) =>
  mount(VcSearchBar, { props: { fields, ...props }, global: { ...global, provide }, attachTo: document.body });

/** In-memory stand-in for the blade's URL query service */
function fakeQueryState(initial: Record<string, TableQueryPatch> = {}) {
  const store: Record<string, TableQueryPatch> = { ...initial };
  const service: ITableQueryStateService = {
    read: (key = "") => ({ ...(store[key] ?? {}) }),
    write: (key = "", patch) => {
      store[key] = { ...(store[key] ?? {}), ...patch };
    },
  };
  return { store, provide: { [TableQueryStateKey as symbol]: service } };
}

describe("VcSearchBar", () => {
  let wrapper: ReturnType<typeof mountBar> | undefined;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders pills only for visible fields", () => {
    wrapper = mountBar();
    const pills = wrapper.findAll(PILL);
    expect(pills).toHaveLength(3);
    expect(wrapper.text()).not.toContain("Store");
  });

  it("shows an unpinned field once it has a value", () => {
    wrapper = mountBar({ modelValue: { search: "", values: { store: "x" } } });
    expect(wrapper.text()).toContain("Store");
  });

  it("the x button removes the filter and emits change without it", async () => {
    const state: SearchBarState = { search: "", values: { status: ["a"], created: { relative: "today" } } };
    wrapper = mountBar({ modelValue: state });
    await wrapper.find(".vc-search-bar__pill-x").trigger("click");
    const changes = wrapper.emitted("change") as { filters: Record<string, unknown>; state: SearchBarState }[][];
    const last = changes[changes.length - 1][0];
    expect(last.state.values).not.toHaveProperty("status");
    expect(last.state.values).toHaveProperty("created");
  });

  it("the x button has an accessible name from REMOVE_FILTER", () => {
    wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
    const label = wrapper.find(".vc-search-bar__pill-x").attributes("aria-label");
    expect(label).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER:Status");
  });

  it("Clear all is visible only when something is set and clears everything", async () => {
    wrapper = mountBar();
    expect(wrapper.find(".vc-search-bar__clear").exists()).toBe(false);
    await wrapper.setProps({ modelValue: { search: "", values: { status: ["a"] } } });
    const clear = wrapper.find(".vc-search-bar__clear");
    expect(clear.exists()).toBe(true);
    await clear.trigger("click");
    const changes = wrapper.emitted("change") as { state: SearchBarState }[][];
    expect(changes[changes.length - 1][0].state).toEqual({ search: "", values: {} });
  });

  it("clicking a toggle pill flips it", async () => {
    wrapper = mountBar();
    const toggle = () => wrapper!.find(".vc-search-bar__pill--toggle");
    expect(toggle().attributes("aria-pressed")).toBe("false");
    await toggle().trigger("click");
    expect(toggle().attributes("aria-pressed")).toBe("true");
    await toggle().trigger("click");
    expect(toggle().attributes("aria-pressed")).toBe("false");
    const changes = wrapper.emitted("change") as { filters: Record<string, unknown> }[][];
    expect(changes[0][0].filters).toEqual({ overdue: true });
  });

  it("emits update:search immediately and a single change per pause", async () => {
    wrapper = mountBar({ searchDebounce: 300 });
    const input = wrapper.find(".input-stub");
    await input.setValue("a");
    await input.setValue("ab");
    expect(wrapper.emitted("update:search")).toEqual([["a"], ["ab"]]);
    expect(wrapper.emitted("change")).toBeUndefined();
    vi.advanceTimersByTime(300);
    expect(wrapper.emitted("change")).toHaveLength(1);
    expect((wrapper.emitted("change") as { search: string }[][])[0][0].search).toBe("ab");
    expect(wrapper.emitted("search")).toEqual([["ab"]]);
  });

  it("Clear all after typing emits an empty search once", async () => {
    wrapper = mountBar({ searchDebounce: 300 });
    await wrapper.find(".input-stub").setValue("abc");
    vi.advanceTimersByTime(300);
    await wrapper.find(".vc-search-bar__pill--toggle").trigger("click");
    await wrapper.find(".vc-search-bar__clear").trigger("click");
    const updates = wrapper.emitted("update:search") as string[][];
    expect(updates[updates.length - 1]).toEqual([""]);
    expect((wrapper.emitted("search") as string[][]).filter((e) => e[0] === "")).toHaveLength(1);
    expect((wrapper.find(".input-stub").element as HTMLInputElement).value).toBe("");
  });

  it("a filter changed within the search pause carries the typed text in one change", async () => {
    wrapper = mountBar({ searchDebounce: 300 });
    await wrapper.find(".input-stub").setValue("abc");
    vi.advanceTimersByTime(100);
    await wrapper.find(".vc-search-bar__pill--toggle").trigger("click");
    const changes = wrapper.emitted("change") as SearchBarChange[][];
    expect(changes).toHaveLength(1);
    expect(changes[0][0].search).toBe("abc");
    expect(changes[0][0].filters).toEqual({ overdue: true });
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(wrapper.emitted("change")).toHaveLength(1);
    expect(wrapper.emitted("search")).toEqual([["abc"]]);
    expect((wrapper.find(".input-stub").element as HTMLInputElement).value).toBe("abc");
  });

  it("pill text is 'Field: values'", () => {
    wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
    expect(wrapper.find(".vc-search-bar__pill-main").text()).toContain("Status: A");
  });

  describe("editor outside click", () => {
    const openStatus = async () => {
      wrapper = mountBar();
      await wrapper.find(".vc-search-bar__pill-main").trigger("click");
      expect(document.body.querySelector(".vc-popover")).not.toBeNull();
    };
    const down = (el: Element) => el.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    it("stays open for a click inside a teleported date menu", async () => {
      await openStatus();
      const menu = document.createElement("div");
      menu.className = "dp__menu";
      document.body.appendChild(menu);
      down(menu);
      await wrapper!.vm.$nextTick();
      expect(document.body.querySelector(".vc-popover")).not.toBeNull();
      menu.remove();
    });

    it("closes for a click elsewhere", async () => {
      await openStatus();
      down(document.body);
      await wrapper!.vm.$nextTick();
      await wrapper!.vm.$nextTick();
      expect(wrapper!.find(".vc-search-bar__pill--open").exists()).toBe(false);
    });
  });

  it("hides the search input when searchable is false", () => {
    wrapper = mountBar({ searchable: false });
    expect(wrapper.find(".input-stub").exists()).toBe(false);
  });

  it("shows Edit filters only with builder or advanced, even without visible pills", async () => {
    wrapper = mountBar({ fields: [] });
    expect(wrapper.find(BUILDER_BTN).exists()).toBe(false);
    await wrapper.setProps({ advanced: true });
    expect(wrapper.find(BUILDER_BTN).exists()).toBe(true);
  });

  it("an applied query shows one Query pill: x clears it, the label is cut at 40 characters", async () => {
    const query = `status:a OR store:${"x".repeat(60)}`;
    wrapper = mountBar({ advanced: true, modelValue: { search: "", values: {}, query } });
    const pill = wrapper.find(".vc-search-bar__pill--query");
    expect(pill.text()).toContain(`ADVANCED.PILL:${query.slice(0, 40)}…`);
    await pill.find(".vc-search-bar__pill-x").trigger("click");
    expect(wrapper.find(".vc-search-bar__pill--query").exists()).toBe(false);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toMatchObject({ state: { values: {} }, phrase: "" });
  });

  it("without Advanced the Query pill has no open action but still clears", async () => {
    wrapper = mountBar({ modelValue: { search: "", values: {}, query: "a OR b" } });
    const pill = wrapper.find(".vc-search-bar__pill--query");
    expect(pill.find("button.vc-search-bar__pill-main").exists()).toBe(false);
    await pill.find(".vc-search-bar__pill-x").trigger("click");
    expect(wrapper.find(".vc-search-bar__pill--query").exists()).toBe(false);
  });

  it("clicking the Query pill opens the panel on Advanced with the query text", async () => {
    wrapper = mountBar({ builder: true, advanced: true, modelValue: { search: "", values: {}, query: "a OR b" } });
    await wrapper.find(".vc-search-bar__pill--query .vc-search-bar__pill-main").trigger("click");
    const ta = document.body.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.value).toBe("a OR b");
  });

  it("Apply in the panel updates the state and closes it", async () => {
    wrapper = mountBar({ builder: true });
    const q = (sel: string) => document.body.querySelector(sel) as HTMLElement;
    const all = (sel: string) => [...document.body.querySelectorAll(sel)] as HTMLElement[];
    await wrapper.find(BUILDER_BTN).trigger("click");
    q(".vc-search-bar__add").click();
    await nextTick();
    all(".vc-search-bar__add-item")[2].click();
    await nextTick();
    all(".vc-search-bar__panel-foot button")[2].click();
    await nextTick();
    expect(q(".vc-search-bar__panel")).toBeNull();
    const changes = wrapper.emitted("change") as { filters: Record<string, unknown> }[][];
    expect(changes[changes.length - 1][0].filters).toEqual({ overdue: true });
  });

  it("Apply in the panel within the search pause keeps the typed text in one change", async () => {
    wrapper = mountBar({ builder: true, searchDebounce: 300 });
    const q = (sel: string) => document.body.querySelector(sel) as HTMLElement;
    const all = (sel: string) => [...document.body.querySelectorAll(sel)] as HTMLElement[];
    await wrapper.find(".input-stub").setValue("abc");
    await wrapper.find(BUILDER_BTN).trigger("click");
    q(".vc-search-bar__add").click();
    await nextTick();
    all(".vc-search-bar__add-item")[2].click();
    await nextTick();
    all(".vc-search-bar__panel-foot button")[2].click();
    await nextTick();
    vi.advanceTimersByTime(1000);
    await nextTick();
    const changes = wrapper.emitted("change") as SearchBarChange[][];
    expect(changes).toHaveLength(1);
    expect(changes[0][0].search).toBe("abc");
    expect(changes[0][0].filters).toEqual({ overdue: true });
    expect((wrapper.find(".input-stub").element as HTMLInputElement).value).toBe("abc");
  });

  describe("opening the panel with nested values", () => {
    const rowCount = () => document.body.querySelectorAll(".vc-search-bar__crow").length;
    // VcSelect needs IntersectionObserver, which jsdom lacks
    const panelGlobal = { ...global, stubs: { ...stubs, VcSelect: true } };

    it("opens after two pills were set (a multiselect array among them)", async () => {
      const url = fakeQueryState({ nested: { filters: "status:a" } });
      wrapper = mount(VcSearchBar, {
        props: { fields, builder: true, storageKey: "nested" },
        global: { ...panelGlobal, provide: url.provide },
        attachTo: document.body,
      });
      await wrapper.find(".vc-search-bar__pill--toggle").trigger("click");
      await wrapper.find(BUILDER_BTN).trigger("click");
      expect(rowCount()).toBe(2);
    });

    it("opens with v-model bound to a parent ref", async () => {
      const Parent = defineComponent({
        components: { VcSearchBar },
        setup: () => ({ s: ref<SearchBarState>({ search: "", values: { status: ["a"] } }), fields }),
        template: `<VcSearchBar v-model="s" :fields="fields" builder />`,
      });
      const w = mount(Parent, { global: panelGlobal, attachTo: document.body });
      await w.find(BUILDER_BTN).trigger("click");
      expect(rowCount()).toBe(1);
      w.unmount();
    });
  });

  it("a search-only bar with a storage key shows no preset tray (nothing to save)", () => {
    wrapper = mountBar({ fields: [], storageKey: "search-only" });
    expect(wrapper.find(".vc-search-bar__presets").exists()).toBe(false);
  });

  describe("controlled search prop", () => {
    it("an outside change updates the input and state.search without change or search", async () => {
      wrapper = mountBar({ search: "" });
      await wrapper.setProps({ search: "abc" });
      expect((wrapper.find(".input-stub").element as HTMLInputElement).value).toBe("abc");
      vi.advanceTimersByTime(1000);
      expect(wrapper.emitted("change")).toBeUndefined();
      expect(wrapper.emitted("search")).toBeUndefined();
      await wrapper.find(".vc-search-bar__pill--toggle").trigger("click");
      expect((wrapper.emitted("change") as { state: SearchBarState }[][])[0][0].state.search).toBe("abc");
    });

    it("typing that the parent echoes back emits no change", async () => {
      wrapper = mountBar({ search: "", searchDebounce: 300 });
      await wrapper.find(".input-stub").setValue("ab");
      await wrapper.setProps({ search: "ab" });
      vi.advanceTimersByTime(300);
      expect(wrapper.emitted("update:search")).toEqual([["ab"]]);
      expect(wrapper.emitted("search")).toEqual([["ab"]]);
      expect(wrapper.emitted("change")).toBeUndefined();
    });

    it("a parent rewrite mid-pause drops the typed text: no change, no search", async () => {
      wrapper = mountBar({ search: "", searchDebounce: 300 });
      await wrapper.find(".input-stub").setValue("ab");
      await wrapper.setProps({ search: "xyz" });
      vi.advanceTimersByTime(1000);
      expect((wrapper.find(".input-stub").element as HTMLInputElement).value).toBe("xyz");
      expect(wrapper.emitted("change")).toBeUndefined();
      expect(wrapper.emitted("search")).toBeUndefined();
    });

    it("writes the filters but not the search text to the URL", async () => {
      const url = fakeQueryState();
      wrapper = mountBar({ storageKey: "orders", search: "" }, url.provide);
      await wrapper.find(".input-stub").setValue("ab");
      await wrapper.setProps({ search: "ab" });
      await wrapper.find(".vc-search-bar__pill--toggle").trigger("click");
      expect(url.store.orders).toEqual({ filters: "overdue:1" });
      expect(localStorage.getItem("VC_SEARCHBAR_ORDERS")).toBeNull();
    });

    it("keeps the controlled search; filters restored from the URL still emit one change", () => {
      const url = fakeQueryState({ orders: { filters: "overdue:1" } });
      wrapper = mountBar({ storageKey: "orders", search: "" }, url.provide);
      expect((wrapper.find(".input-stub").element as HTMLInputElement).value).toBe("");
      const changes = wrapper.emitted("change") as { search: string; filters: Record<string, unknown> }[][];
      expect(changes).toHaveLength(1);
      expect(changes[0][0]).toMatchObject({ search: "", filters: { overdue: true } });
    });

    it("no URL service: nothing is restored and no change is emitted", () => {
      localStorage.setItem(
        "VC_SEARCHBAR_ORDERS",
        JSON.stringify({ v: 1, presets: [], applied: { search: "", values: { overdue: true } } }),
      );
      wrapper = mountBar({ storageKey: "orders", search: "" });
      expect(wrapper.emitted("change")).toBeUndefined();
      localStorage.clear();
    });
  });

  describe("compact row", () => {
    const menuItems = () => [...document.body.querySelectorAll(".vc-search-bar__menu-item")] as HTMLElement[];
    const editor = () => document.body.querySelector(".vc-search-bar__editor");

    it("wide bar shows empty pinned fields; narrow bar shows only set ones", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      await resize(1000);
      expect(wrapper.findAll(PILL).map((p) => p.text())).toEqual([
        expect.stringContaining("Status"),
        expect.stringContaining("Created"),
        expect.stringContaining("Overdue"),
      ]);
      await resize(500);
      const pills = wrapper.findAll(PILL);
      expect(pills).toHaveLength(1);
      expect(pills[0].text()).toContain("Status");
    });

    it("+ Filter lists the fields not in the row and opens the picked field's editor", async () => {
      wrapper = mountBar();
      await wrapper.find(".vc-search-bar__pill--add").trigger("click");
      expect(menuItems().map((b) => b.textContent?.trim())).toEqual(["Store"]);
      menuItems()[0].click();
      await nextTick();
      expect(menuItems()).toHaveLength(0);
      expect(editor()).not.toBeNull();
      expect(document.body.querySelector(".vc-popover")?.textContent).toContain("Store");
    });

    it("picking a toggle in + Filter sets it", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar();
      await resize(500);
      await wrapper.find(".vc-search-bar__pill--add").trigger("click");
      expect(menuItems().map((b) => b.textContent?.trim())).toEqual(["Status", "Created", "Overdue", "Store"]);
      menuItems()[2].click();
      await nextTick();
      expect(menuItems()).toHaveLength(0);
      expect((wrapper.emitted("change") as SearchBarChange[][]).at(-1)?.[0].filters).toEqual({ overdue: true });
      expect(wrapper.find(".vc-search-bar__pill--toggle").attributes("aria-pressed")).toBe("true");
    });

    it("collapseSearch true renders the search button even on a wide bar", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar({ collapseSearch: true });
      await resize(1000);
      expect(wrapper.find(".vc-search-bar__search-btn").exists()).toBe(true);
      expect(wrapper.find(".input-stub").exists()).toBe(false);
    });

    it("a narrow bar hides the search behind a button by default", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar();
      await resize(1000);
      expect(wrapper.find(".input-stub").exists()).toBe(true);
      await resize(500);
      expect(wrapper.find(".vc-search-bar__search-btn").exists()).toBe(true);
    });

    it("closes the editor of an empty pinned field when the bar turns narrow", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar();
      await resize(1000);
      await wrapper.find(".vc-search-bar__pill-main").trigger("click");
      expect(editor()).not.toBeNull();
      await resize(500);
      await nextTick();
      expect(editor()).toBeNull();
    });

    it("emptying a set pill through its editor in a narrow bar keeps the editor open", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      await resize(500);
      await wrapper.find(".vc-search-bar__pill-main").trigger("click");
      expect(editor()).not.toBeNull();
      wrapper.findComponent(PillEditor).vm.$emit("update:value", undefined);
      await nextTick();
      await nextTick();
      expect(editor()).not.toBeNull();
      expect(wrapper.findAll(PILL).map((p) => p.text())).toEqual([expect.stringContaining("Status")]);
    });

    it("picking the last addable toggle moves focus to its new pill", async () => {
      wrapper = mountBar({ fields: [{ id: "overdue", label: "Overdue", filter: { toggle: true }, pinned: false }] });
      await wrapper.find(".vc-search-bar__pill--add").trigger("click");
      menuItems()[0].click();
      await nextTick();
      await nextTick();
      expect(wrapper.find(".vc-search-bar__pill--add").exists()).toBe(false);
      expect(document.activeElement).toBe(wrapper.find(".vc-search-bar__pill--toggle").element);
    });

    it("an open preset tray menu keeps the row unfolded", async () => {
      wrapper = mountBar({ presets: [{ id: "p1", name: "Mine", values: { overdue: true } }] });
      expect(reveal.keepOpen?.()).toBe(false);
      await wrapper.find(".vc-search-bar__tray-all").trigger("click");
      expect(reveal.keepOpen?.()).toBe(true);
      await wrapper.find(".vc-search-bar__tray-all").trigger("click");
      expect(reveal.keepOpen?.()).toBe(false);
    });

    it("disabled bar disables the search button, + Filter and the constructor button", () => {
      wrapper = mountBar({ disabled: true, builder: true, collapseSearch: true });
      expect(wrapper.get(".vc-search-bar__search-btn").attributes()).toHaveProperty("disabled");
      expect(wrapper.get(".vc-search-bar__pill--add").attributes()).toHaveProperty("disabled");
      expect(wrapper.get(BUILDER_BTN).attributes()).toHaveProperty("disabled");
    });

    it("emptying the open search in a narrow bar keeps it open and focused", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar();
      await resize(500);
      await wrapper.get(".vc-search-bar__search-btn").trigger("click");
      await nextTick();
      await wrapper.get(".input-stub").setValue("a");
      await wrapper.get(".input-stub").setValue("");
      await nextTick();
      expect(wrapper.find(".input-stub").exists()).toBe(true);
      expect(document.activeElement).toBe(wrapper.get(".input-stub").element);
    });

    it("a number editor that commits after its editor closed still sets that field", async () => {
      const total: SearchBarField = { id: "total", label: "Total", filter: { number: true }, pinned: false };
      wrapper = mountBar({ fields: [...fields, total] });
      await wrapper.find(".vc-search-bar__pill--add").trigger("click");
      menuItems()
        .find((b) => b.textContent?.includes("Total"))!
        .click();
      await nextTick();
      const input = document.body.querySelector<HTMLInputElement>(".vc-search-bar__editor .input-stub")!;
      input.value = "7";
      input.dispatchEvent(new Event("input"));
      await nextTick();
      // the outside click closes the editor; the input's blur arrives before it is gone
      const errors: unknown[] = [];
      wrapper.vm.$.appContext.config.errorHandler = (err) => void errors.push(err);
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      input.dispatchEvent(new Event("blur"));
      await nextTick();
      expect(errors).toEqual([]);
      expect(editor()).toBeNull();
      const models = wrapper.emitted("update:modelValue") as SearchBarState[][];
      expect(models.at(-1)?.[0].values.total).toEqual({ op: "gte", min: 7 });
    });

    it("cancel in Save as preset returns focus to the Save link", async () => {
      wrapper = mountBar({ storageKey: "desk-focus", modelValue: { search: "", values: { status: ["a"] } } });
      const save = wrapper.get<HTMLButtonElement>(".vc-search-bar__save");
      save.element.focus();
      await save.trigger("click");
      await wrapper.get(".vc-search-bar__save-inline").trigger("keydown", { key: "Escape" });
      await nextTick();
      expect(document.activeElement).toBe(save.element);
    });

    it("has no actions slot", () => {
      wrapper = mount(VcSearchBar, {
        props: { fields },
        slots: { actions: "<button class='custom-action'>Go</button>" },
        global,
        attachTo: document.body,
      });
      expect(wrapper.find(".custom-action").exists()).toBe(false);
    });
  });

  describe("phone", () => {
    const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR";
    // The real sheet teleports and animates; what is under test is what it holds
    const SheetStub = defineComponent({
      name: "VcSidebar",
      props: ["modelValue", "title"],
      emits: ["update:modelValue"],
      setup:
        (props, { slots }) =>
        () =>
          props.modelValue
            ? h("div", { class: "vc-sidebar sheet-stub", "data-title": props.title }, slots.default?.())
            : null,
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
    const sheet = () => wrapper!.find(".sheet-stub");
    const status = { search: "", values: { status: ["a"] } };

    it("phone: one row with the search button, the filters and the presets button", () => {
      wrapper = mountPhone({ storageKey: "phone", modelValue: status });
      expect(wrapper.findAll(".vc-search-bar__row")).toHaveLength(1);
      const row = wrapper.get(".vc-search-bar__row");
      expect(row.find(".vc-search-bar__search-btn").exists()).toBe(true);
      const scroll = row.get(".vc-search-bar__filters--scroll");
      expect(scroll.findAll(PILL).map((p) => p.text())).toEqual([expect.stringContaining("Status")]);
      expect(wrapper.find(".vc-search-bar__save").exists()).toBe(false);
      const presets = row.get(".vc-search-bar__phone-presets");
      expect(presets.attributes("aria-label")).toBe(`${P}.PRESETS.LABEL`);
      expect(presets.attributes("title")).toBe(`${P}.PRESETS.LABEL`);
      expect(scroll.find(".vc-search-bar__phone-presets").exists()).toBe(false);
      expect(wrapper.find(".vc-search-bar__presets").exists()).toBe(false);
    });

    it("phone: opening the search hides the filters and presets until it folds", async () => {
      wrapper = mountPhone({ storageKey: "phone" });
      await wrapper.get(".vc-search-bar__search-btn").trigger("click");
      await nextTick();
      expect(wrapper.find(".input-stub").exists()).toBe(true);
      // hidden by CSS (squeezed and faded by the widening search), so the classes are the contract
      expect(wrapper.get(".vc-search-bar__filters").classes()).toContain("vc-search-bar__filters--hidden");
      expect(wrapper.get(".vc-search-bar__phone-tray").classes()).toContain("vc-search-bar__phone-tray--hidden");
      await wrapper.get(".vc-search-bar__search").trigger("focusout");
      expect(wrapper.find(".vc-search-bar__search-btn").exists()).toBe(true);
      expect(wrapper.get(".vc-search-bar__filters").classes()).not.toContain("vc-search-bar__filters--hidden");
      expect(wrapper.get(".vc-search-bar__phone-tray").classes()).not.toContain("vc-search-bar__phone-tray--hidden");
    });

    it("phone: collapseSearch false puts the full search on its own row above", () => {
      wrapper = mountPhone({ storageKey: "phone", collapseSearch: false });
      const search = wrapper.get(".vc-search-bar__search");
      expect(search.classes()).toContain("vc-search-bar__search--full");
      expect(search.element.closest(".vc-search-bar__row")).toBeNull();
      expect(wrapper.find(".vc-search-bar__search-btn").exists()).toBe(false);
      expect(wrapper.get(".vc-search-bar__row").find(".vc-search-bar__filters").exists()).toBe(true);
    });

    it("phone: collapseSearch false with nothing else renders no empty row", () => {
      wrapper = mountPhone({ fields: [], collapseSearch: false });
      expect(wrapper.find(".vc-search-bar__search--full").exists()).toBe(true);
      expect(wrapper.find(".vc-search-bar__row").exists()).toBe(false);
    });

    it("phone: a pill opens its editor in a bottom sheet with Done", async () => {
      wrapper = mountPhone({ modelValue: status });
      await wrapper.get(".vc-search-bar__pill-main").trigger("click");
      expect(wrapper.getComponent(MenuHost).props("sheet")).toBe(true);
      expect(sheet().attributes("data-title")).toBe("Status");
      expect(sheet().findComponent(PillEditor).exists()).toBe(true);
      const done = sheet().get(".vc-search-bar__done");
      expect(done.text()).toBe(`${P}.MOBILE.DONE`);
      await done.trigger("click");
      expect(sheet().exists()).toBe(false);
    });

    it("phone: + Filter opens a sheet; picking a field turns it into the editor", async () => {
      wrapper = mountPhone();
      await wrapper.get(".vc-search-bar__pill--add").trigger("click");
      expect(sheet().attributes("data-title")).toBe(`${P}.MOBILE.ADD`);
      const items = sheet().findAll(".vc-search-bar__menu-item");
      expect(items.map((i) => i.text())).toEqual(["Status", "Created", "Overdue", "Store"]);
      await items[1].trigger("click");
      expect(sheet().attributes("data-title")).toBe("Created");
      expect(sheet().findComponent(PillEditor).exists()).toBe(true);
      expect(sheet().find(".vc-search-bar__done").exists()).toBe(true);
    });

    it("phone: presets button opens a sheet with all presets and Save as preset", async () => {
      const presets = [{ id: "p1", name: "Mine", values: { overdue: true } }];
      wrapper = mountPhone({ storageKey: "phone", presets, modelValue: status });
      const btn = wrapper.get(".vc-search-bar__phone-presets");
      expect(btn.classes()).not.toContain("vc-search-bar__phone-presets--on");
      await btn.trigger("click");
      expect(sheet().attributes("data-title")).toBe(`${P}.PRESETS.LABEL`);
      expect(sheet().getComponent(AllPresets).text()).toContain("Mine");
      await sheet().get(".vc-search-bar__save").trigger("click");
      expect(sheet().findComponent(PresetSaveInline).exists()).toBe(true);
      wrapper.unmount();

      wrapper = mountPhone({ storageKey: "phone", presets, modelValue: { search: "", values: { overdue: true } } });
      expect(wrapper.get(".vc-search-bar__phone-presets").classes()).toContain("vc-search-bar__phone-presets--on");
    });

    describe("phone: focus after saving a preset", () => {
      const openSave = async (storageKey = "phone-focus") => {
        wrapper = mountPhone({ storageKey, modelValue: status });
        await wrapper.get(".vc-search-bar__phone-presets").trigger("click");
        const save = sheet().get<HTMLButtonElement>(".vc-search-bar__save");
        save.element.focus();
        await save.trigger("click");
        expect(document.activeElement).toBe(sheet().get(".input-stub").element);
        return save;
      };

      it("cancel returns focus to Save as preset", async () => {
        const save = await openSave();
        await sheet().get(".vc-search-bar__save-inline").trigger("keydown", { key: "Escape" });
        await nextTick();
        expect(document.activeElement).toBe(save.element);
      });

      it("save focuses this bar's new preset, not a same-id one elsewhere on the page", async () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);
        const id = `user-${Date.now().toString(36)}${(0.5).toString(36).slice(2, 6)}`;
        const decoy = document.createElement("div");
        decoy.dataset.presetId = id;
        decoy.innerHTML = "<button class='vc-search-bar__all-main'>Decoy</button>";
        document.body.prepend(decoy);
        try {
          await openSave("phone-focus-two-bars");
          await sheet().get(".input-stub").setValue("Fresh");
          await sheet().get(".vc-search-bar__save-inline").trigger("keydown", { key: "Enter" });
          for (let i = 0; i < 10; i++) await nextTick();
          expect((document.activeElement as HTMLElement).textContent).toContain("Fresh");
        } finally {
          decoy.remove();
          vi.restoreAllMocks();
        }
      });

      it("save moves focus to the new preset in the sheet", async () => {
        await openSave();
        await sheet().get(".input-stub").setValue("Fresh");
        await sheet().get(".vc-search-bar__save-inline").trigger("keydown", { key: "Enter" });
        for (let i = 0; i < 10; i++) await nextTick();
        const active = document.activeElement as HTMLElement;
        expect(active.classList.contains("vc-search-bar__all-main")).toBe(true);
        expect(active.textContent).toContain("Fresh");
      });
    });
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
      props: { fields, modelValue: { search: "", values: { rating: 4 } }, ...props },
      global: {
        ...global,
        provide: { [BladeDescriptorKey as symbol]: computed(() => ({ name: "Orders" })) },
      },
      attachTo: document.body,
    });
  beforeEach(() => registerExternalSearchFilters({ id: "t13", targetBlades: ["orders"], fields: external }));
  afterEach(() => {
    w?.unmount();
    unregisterExternalSearchFilters("t13");
  });

  it("shows the contributed pill after the screen's own, with the custom label", () => {
    w = mountIn();
    const texts = w.findAll(PILL).map((p) => p.text());
    expect(texts).toHaveLength(fields.filter((f) => f.pinned !== false).length + external.length);
    expect(texts.at(-1)).toContain("Rating");
    expect(texts.at(-1)).toContain("4+ stars");
  });

  it("does not show it for another name", () => {
    w = mountIn({ name: "other" });
    expect(w.text()).not.toContain("Rating");
  });

  it("puts toPhrase output into the phrase", async () => {
    w = mountIn({ modelValue: { search: "", values: { rating: 4, overdue: true } } });
    await w.find(".vc-search-bar__pill--toggle").trigger("click");
    const changes = w.emitted("change") as { phrase: string }[][];
    // the click switched Overdue off; the contributed field stays in the phrase
    expect(changes.at(-1)?.[0].phrase).toBe("rating:[4 TO]");
  });
});

describe("DateRangeEditor", () => {
  it("writing the same range twice emits once", async () => {
    const field = normalizeField(fields[1]);
    const w = mount(DateRangeEditor, { props: { field, value: undefined }, global });
    const picker = w.findComponent(DatePickerStub);
    const range = [new Date(2026, 0, 5), new Date(2026, 0, 9)];
    picker.vm.$emit("update:modelValue", range);
    expect(w.emitted("update:value")).toEqual([[{ start: "2026-01-05", end: "2026-01-09" }]]);
    await w.setProps({ value: { start: "2026-01-05", end: "2026-01-09" } });
    picker.vm.$emit("update:modelValue", range);
    expect(w.emitted("update:value")).toHaveLength(1);
  });

  it("a quick button writes a relative value", async () => {
    const field = normalizeField(fields[1]);
    const w = mount(DateRangeEditor, { props: { field, value: undefined }, global });
    await w.findAll("button")[1].trigger("click");
    expect(w.emitted("update:value")).toEqual([[{ relative: "7d" }]]);
  });
});

describe("NumberEditor", () => {
  const field = normalizeField({ id: "total", label: "Total", filter: { number: true } });
  const type = async (w: ReturnType<typeof mount>, i: number, v: string) => {
    const inputs = w.findAll(".input-stub");
    await inputs[i].setValue(v);
    await inputs[i].trigger("blur");
  };

  it("emits gte with min on blur", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await type(w, 0, "5");
    expect(w.emitted("update:value")).toEqual([[{ op: "gte", min: 5 }]]);
  });

  it("emits lte with max, never a min", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await w.findAll("button")[1].trigger("click");
    await type(w, 0, "9");
    expect(w.emitted("update:value")).toEqual([[{ op: "lte", max: 9 }]]);
  });

  it("emits between only with both bounds", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await w.findAll("button")[3].trigger("click");
    await type(w, 0, "1");
    expect(w.emitted("update:value")).toBeUndefined();
    await type(w, 1, "4");
    expect(w.emitted("update:value")).toEqual([[{ op: "between", min: 1, max: 4 }]]);
  });

  it("emits nothing for non-numeric input", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await type(w, 0, "abc");
    expect(w.emitted("update:value")).toBeUndefined();
  });
});

describe("SelectEditor", () => {
  const field = normalizeField({
    id: "s",
    label: "S",
    operators: ["any", "not"],
    filter: { options: [{ value: "a", label: "A" }], multiple: true },
  });
  const stubsCb = {
    ...stubs,
    VcCheckbox: {
      props: ["modelValue"],
      emits: ["update:modelValue"],
      template: "<input type='checkbox' @change=\"$emit('update:modelValue', $event.target.checked)\" />",
    },
  };

  it("keeps Is not chosen with nothing selected and writes a not value", async () => {
    const w = mount(SelectEditor, { props: { field, value: undefined }, global: { ...global, stubs: stubsCb } });
    const [any, not] = w.findAll(".vc-search-bar-editor__segment");
    await not.trigger("click");
    expect(not.attributes("aria-pressed")).toBe("true");
    expect(any.attributes("aria-pressed")).toBe("false");
    await w.find("input").setValue(true);
    expect(w.emitted("update:value")).toEqual([[{ not: ["a"] }]]);
  });
});

describe("MenuHost", () => {
  const PopoverStub = defineComponent({
    name: "VcPopover",
    props: ["show", "anchorRef", "title", "closeOnClickOutside", "width", "maxWidth"],
    emits: ["update:show"],
    setup:
      (_, { slots }) =>
      () =>
        h("div", { class: "popover-stub" }, slots.default?.()),
  });
  const SidebarStub = defineComponent({
    name: "VcSidebar",
    props: ["modelValue", "position", "size", "draggable", "dragHandle", "closeButton", "inset", "title"],
    emits: ["update:modelValue"],
    setup:
      (_, { slots }) =>
      () =>
        h("div", { class: "sidebar-stub" }, slots.default?.()),
  });
  const mountHost = (props: Record<string, unknown>) =>
    mount(MenuHost, {
      props,
      slots: { default: "<span class='content'>menu</span>" },
      global: { stubs: { VcPopover: PopoverStub, VcSidebar: SidebarStub } },
    });

  it("renders a popover anchored to the element", () => {
    const anchor = document.createElement("button");
    const w = mountHost({ sheet: false, anchor, title: "T", closeOnOutside: true });
    const pop = w.findComponent(PopoverStub);
    expect(pop.exists()).toBe(true);
    expect(w.findComponent(SidebarStub).exists()).toBe(false);
    expect(pop.props()).toMatchObject({
      show: true,
      anchorRef: anchor,
      title: "T",
      closeOnClickOutside: true,
      width: "280px",
      maxWidth: "360px",
    });
    expect(w.find(".content").exists()).toBe(true);
  });

  it("renders a bottom sheet when sheet", () => {
    const w = mountHost({ sheet: true, title: "T" });
    const sb = w.findComponent(SidebarStub);
    expect(sb.exists()).toBe(true);
    expect(w.findComponent(PopoverStub).exists()).toBe(false);
    expect(sb.props()).toMatchObject({
      modelValue: true,
      position: "bottom",
      size: "sm",
      draggable: true,
      dragHandle: true,
      closeButton: false,
      inset: false,
      title: "T",
    });
    expect(w.find(".content").exists()).toBe(true);
  });

  it("emits close from either host", async () => {
    const p = mountHost({ sheet: false });
    await p.findComponent(PopoverStub).vm.$emit("update:show", false);
    expect(p.emitted("close")).toHaveLength(1);
    const s = mountHost({ sheet: true });
    await s.findComponent(SidebarStub).vm.$emit("update:modelValue", false);
    expect(s.emitted("close")).toHaveLength(1);
  });
});

describe("FilterRow", () => {
  const barFields = fields.map(normalizeField);
  const presets = (canSave = false) =>
    ({ canSave: ref(canSave), saving: ref(false), startSave: vi.fn() }) as unknown as InstanceType<
      typeof FilterRow
    >["$props"]["presets"];
  const mountRow = (props: Record<string, unknown> = {}) =>
    mount(FilterRow, {
      props: {
        fields: barFields.slice(0, 2),
        state: { search: "", values: {} } as SearchBarState,
        queryLabel: "",
        presets: presets(),
        showSave: true,
        builderButton: false,
        queryEditable: false,
        panelOpen: false,
        canAdd: true,
        ...props,
      },
      global,
    });

  it("puts + Filter after the pills and only when something can be added", async () => {
    const w = mountRow();
    const kids = Array.from(w.element.children);
    const add = w.get(".vc-search-bar__pill--add");
    expect(kids.indexOf(add.element)).toBe(kids.length - 1);
    expect(add.text()).toBe("+ COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADD_FILTER");
    expect(add.attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.MOBILE.ADD");
    await add.trigger("click");
    expect(w.emitted("add")).toHaveLength(1);

    await w.setProps({ canAdd: false });
    expect(w.find(".vc-search-bar__pill--add").exists()).toBe(false);
  });

  it("Clear all and Save as preset are links after a divider", async () => {
    const w = mountRow({
      state: { search: "", values: { status: ["a"] } },
      presets: presets(true),
    });
    const clear = w.get(".vc-search-bar__clear");
    const save = w.get(".vc-search-bar__save");
    const kids = Array.from(w.element.children);
    expect(kids.indexOf(clear.element)).toBeGreaterThan(kids.indexOf(w.get(".vc-search-bar__pill--add").element));
    expect(kids.indexOf(save.element)).toBeGreaterThan(kids.indexOf(clear.element));
    await clear.trigger("click");
    expect(w.emitted("clear")).toHaveLength(1);

    await w.setProps({ state: { search: "", values: {} } });
    expect(w.find(".vc-search-bar__clear").exists()).toBe(false);
  });

  it("the constructor button is icon-only with a name, only with builder", async () => {
    const w = mountRow();
    expect(w.find(".vc-search-bar__constructor-btn").exists()).toBe(false);

    await w.setProps({ builderButton: true, panelOpen: true });
    const btn = w.get(".vc-search-bar__constructor-btn");
    expect(btn.text()).toBe("");
    expect(btn.attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TITLE");
    expect(btn.attributes("title")).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.TITLE");
    expect(btn.attributes("aria-expanded")).toBe("true");
    await btn.trigger("click");
    expect(w.emitted("edit")).toHaveLength(1);
  });

  it("the Query pill opens the panel only when queryEditable", async () => {
    const w = mountRow({
      state: { search: "", values: {}, query: "a OR b" },
      queryLabel: "a OR b",
      builderButton: true,
    });
    expect(w.find(".vc-search-bar__pill--query button.vc-search-bar__pill-main").exists()).toBe(false);
    await w.setProps({ queryEditable: true, builderButton: false });
    const main = w.get(".vc-search-bar__pill--query button.vc-search-bar__pill-main");
    await main.trigger("click");
    expect(w.emitted("edit")).toHaveLength(1);
  });

  it("hides Save when showSave is false", async () => {
    const w = mountRow({ presets: presets(true) });
    expect(w.find(".vc-search-bar__save").exists()).toBe(true);
    await w.setProps({ showSave: false });
    expect(w.find(".vc-search-bar__save").exists()).toBe(false);
  });
});
