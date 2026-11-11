import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, ref } from "vue";
import { BladeDescriptorKey, BladeStackKey } from "@core/blade-navigation/types";
import { IsMobileKey } from "@framework/injection-keys";
import VcSearchBar from "./VcSearchBar.vue";
import PillEditor from "./components/PillEditor.vue";
import type { SearchBarChange, SearchBarField, SearchBarState } from "./types";
import {
  CHIP,
  SEARCH,
  editor,
  fakeResizeObserver,
  fakeWidths,
  fields,
  global,
  lastChange,
  listItems,
  mountBar,
  stubs,
} from "./bar.test-helpers";

describe("VcSearchBar", () => {
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

  /** Sets store, status and overdue in that order */
  async function setThree() {
    await wrapper!.setProps({ modelValue: { search: "", values: { store: "x" } } });
    await wrapper!.setProps({ modelValue: { search: "", values: { store: "x", status: ["a"] } } });
    await wrapper!.setProps({ modelValue: { search: "", values: { status: ["a"], overdue: true, store: "x" } } });
  }

  describe("row", () => {
    it("chips show applied fields in applied order; the rest go to +N", async () => {
      const resize = fakeResizeObserver();
      fakeWidths();
      wrapper = mountBar();
      await setThree();
      await resize(1400);
      expect(wrapper.findAll(CHIP).map((c) => c.text())).toEqual(["Store: x", "Status: A", "Overdue"]);
      expect(wrapper.find(".vc-search-bar__divider").exists()).toBe(true);

      // 760: 760 - 200 - 103 = 457 holds two chips and the +N button
      await resize(760);
      expect(wrapper.findAll(CHIP).map((c) => c.text())).toEqual(["Store: x", "Status: A"]);
      const more = wrapper.get(".vc-search-bar__more");
      expect(more.text()).toBe("+1");
      await more.trigger("click");
      expect(listItems().map((b) => b.textContent?.trim())).toEqual(["Overdue"]);
    });

    it("a chip opens its field's editor; x clears the field", async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      await wrapper.get(`${CHIP} .vc-search-bar__chip-main`).trigger("click");
      expect(editor()).not.toBeNull();
      expect(wrapper.findComponent(PillEditor).props("field")).toMatchObject({ id: "status" });
      await wrapper.get(`${CHIP} .vc-search-bar__chip-x`).trigger("click");
      expect(editor()).toBeNull();
      expect(lastChange(wrapper).state.values).toEqual({});
    });

    it("medium and narrow modes show no chips; the Filters button shows the count and clears all", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar({ modelValue: { search: "q", values: { status: ["a"], overdue: true } } });
      await resize(600);
      expect(wrapper.find(".vc-search-bar__chip").exists()).toBe(false);
      expect(wrapper.find(".vc-search-bar__divider").exists()).toBe(false);
      expect(wrapper.get(".vc-search-bar__filters-badge").text()).toBe("2");
      expect(wrapper.get(".vc-search-bar__filters-main").attributes("aria-label")).toBe(
        "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.FILTERS_APPLIED:2",
      );

      await resize(400);
      expect(wrapper.find(".vc-search-bar__filters-btn--icon").exists()).toBe(true);
      expect(wrapper.get(".vc-search-bar__filters-badge").text()).toBe("2");
      expect(wrapper.find(".vc-search-bar__filters-x").exists()).toBe(false);

      await resize(600);
      await wrapper.get(".vc-search-bar__filters-x").trigger("click");
      // Clear all keeps the search
      expect(lastChange(wrapper).state).toEqual({ search: "q", values: {} });
      expect(wrapper.find(".vc-search-bar__filters-badge").exists()).toBe(false);
    });

    it("the mode follows the bar's border box: 720px with its padding is wide", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      await resize(720, 688);
      expect(wrapper.findAll(CHIP)).toHaveLength(1);
    });

    it("summary variant shows field names on the Filters button instead of chips", async () => {
      const resize = fakeResizeObserver();
      wrapper = mountBar({
        variant: "summary",
        modelValue: { search: "", values: { status: ["a"], created: { relative: "today" }, overdue: true } },
      });
      await resize(1000);
      expect(wrapper.find(".vc-search-bar__chip").exists()).toBe(false);
      expect(wrapper.get(".vc-search-bar__filters-names").text()).toBe("Status, Created +1");
      await resize(600);
      expect(wrapper.find(".vc-search-bar__filters-names").exists()).toBe(false);
    });

    it("widening past 720px while +N is open closes the +N popover", async () => {
      const resize = fakeResizeObserver();
      fakeWidths();
      wrapper = mountBar();
      await setThree();
      await resize(760);
      await wrapper.get(".vc-search-bar__more").trigger("click");
      expect(document.body.querySelector(".vc-popover")).not.toBeNull();
      await resize(1400);
      expect(wrapper.find(".vc-search-bar__more").exists()).toBe(false);
      // the popover's leave transition never ends in jsdom; its content is gone
      expect(listItems()).toHaveLength(0);
      expect(editor()).toBeNull();
    });

    it("the Filters button lists every field; a toggle flips, a field opens its editor", async () => {
      wrapper = mountBar();
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      expect(listItems().map((b) => b.textContent?.trim())).toEqual(["Status", "Created", "Overdue", "Store"]);
      listItems()[2].click();
      await nextTick();
      expect(lastChange(wrapper).filters).toEqual({ overdue: true });
      listItems()[3].click();
      await nextTick();
      expect(editor()).not.toBeNull();
      expect(wrapper.findComponent(PillEditor).props("field")).toMatchObject({ id: "store" });
    });

    it("a bar without fields shows only the search", () => {
      wrapper = mountBar({ fields: [] });
      expect(wrapper.find(SEARCH).exists()).toBe(true);
      expect(wrapper.find(".vc-search-bar__filters-btn").exists()).toBe(false);
      expect(wrapper.find(".vc-search-bar__divider").exists()).toBe(false);
      expect(wrapper.find(".vc-search-bar__view-selector").exists()).toBe(false);
    });

    it("the search icon and the funnel are 16px", () => {
      wrapper = mountBar();
      const size = (icon: string) =>
        wrapper!
          .findAllComponents({ name: "VcIcon" })
          .find((c) => c.props("icon") === icon)
          ?.props("customSize");
      expect(size("lucide-search")).toBe(16);
      expect(size("lucide-funnel")).toBe(16);
    });

    it("hides the search input when searchable is false", () => {
      wrapper = mountBar({ searchable: false });
      expect(wrapper.find(SEARCH).exists()).toBe(false);
    });
  });

  describe("search syntax and keys", () => {
    it("status:new + space becomes a chip and leaves the rest of the text", async () => {
      wrapper = mountBar();
      await wrapper.get(SEARCH).setValue("acme status:a ");
      const changes = wrapper.emitted("change") as SearchBarChange[][];
      expect(changes).toHaveLength(1);
      expect(changes[0][0]).toMatchObject({ search: "acme", filters: { status: ["a"] } });
      expect((wrapper.get(SEARCH).element as HTMLInputElement).value).toBe("acme");
      expect(wrapper.findAll(CHIP).map((c) => c.text())).toEqual(["Status: A"]);
    });

    it("unknown field or value stays search text", async () => {
      wrapper = mountBar();
      await wrapper.get(SEARCH).setValue("foo:bar ");
      await wrapper.get(SEARCH).setValue("foo:bar status:xyz ");
      expect(wrapper.emitted("update:search")).toEqual([["foo:bar "], ["foo:bar status:xyz "]]);
      vi.advanceTimersByTime(300);
      expect(lastChange(wrapper)).toMatchObject({ search: "foo:bar status:xyz ", filters: {} });
      expect(wrapper.find(CHIP).exists()).toBe(false);
    });

    it("suggests values after field: and adds the picked one on Enter", async () => {
      wrapper = mountBar();
      const input = wrapper.get(SEARCH);
      await input.trigger("focus");
      await input.setValue("status:");
      expect(wrapper.get(".vc-search-bar__suggest-title").text()).toBe(
        "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SUGGEST.BY:Status",
      );
      expect(input.attributes("aria-expanded")).toBe("true");
      await input.trigger("keydown", { key: "Enter" });
      expect(lastChange(wrapper).filters).toEqual({ status: ["a"] });
      expect((input.element as HTMLInputElement).value).toBe("");
    });

    it("Backspace in an empty search clears the last chip", async () => {
      wrapper = mountBar();
      await setThree();
      await wrapper.get(SEARCH).trigger("keydown", { key: "Backspace" });
      expect(lastChange(wrapper).state.values).toEqual({ status: ["a"], store: "x" });
      await wrapper.get(SEARCH).trigger("keydown", { key: "Backspace" });
      expect(lastChange(wrapper).state.values).toEqual({ store: "x" });
    });

    it("Esc clears the text, then blurs", async () => {
      wrapper = mountBar();
      const input = wrapper.get(SEARCH);
      (input.element as HTMLInputElement).focus();
      await input.setValue("abc");
      await input.trigger("keydown", { key: "Escape" });
      expect((wrapper.emitted("update:search") as string[][]).at(-1)).toEqual([""]);
      expect(document.activeElement).toBe(input.element);
      await input.trigger("keydown", { key: "Escape" });
      expect(document.activeElement).not.toBe(input.element);
    });

    it("/ focuses the search of the active blade only, never while typing elsewhere", async () => {
      const activeBlade = ref<{ id: string } | undefined>({ id: "b1" });
      const provide = {
        [BladeDescriptorKey as symbol]: computed(() => ({ id: "b1", name: "Orders" })),
        [BladeStackKey as symbol]: { activeBlade: computed(() => activeBlade.value) },
      };
      wrapper = mountBar({}, provide);
      const press = () => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
      press();
      expect(document.activeElement).toBe(wrapper.get(SEARCH).element);

      (document.activeElement as HTMLElement).blur();
      activeBlade.value = { id: "b2" };
      press();
      expect(document.activeElement).not.toBe(wrapper.get(SEARCH).element);

      activeBlade.value = { id: "b1" };
      const other = document.createElement("input");
      document.body.append(other);
      other.focus();
      press();
      expect(document.activeElement).toBe(other);
      other.remove();
    });
  });

  describe("search text", () => {
    it("emits update:search immediately and a single change per pause", async () => {
      wrapper = mountBar({ searchDebounce: 300 });
      await wrapper.get(SEARCH).setValue("a");
      await wrapper.get(SEARCH).setValue("ab");
      expect(wrapper.emitted("update:search")).toEqual([["a"], ["ab"]]);
      expect(wrapper.emitted("change")).toBeUndefined();
      vi.advanceTimersByTime(300);
      expect(wrapper.emitted("change")).toHaveLength(1);
      expect(lastChange(wrapper).search).toBe("ab");
      expect(wrapper.emitted("search")).toEqual([["ab"]]);
    });

    it("a filter changed within the search pause carries the typed text in one change", async () => {
      wrapper = mountBar({ searchDebounce: 300 });
      await wrapper.get(SEARCH).setValue("abc");
      vi.advanceTimersByTime(100);
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      listItems()[2].click();
      await nextTick();
      const changes = wrapper.emitted("change") as SearchBarChange[][];
      expect(changes).toHaveLength(1);
      expect(changes[0][0]).toMatchObject({ search: "abc", filters: { overdue: true } });
      vi.advanceTimersByTime(1000);
      expect(wrapper.emitted("change")).toHaveLength(1);
      expect(wrapper.emitted("search")).toEqual([["abc"]]);
    });

    it("the clear button empties the text", async () => {
      wrapper = mountBar();
      await wrapper.get(SEARCH).setValue("abc");
      await wrapper.get(".vc-search-bar__search-clear").trigger("click");
      expect((wrapper.emitted("update:search") as string[][]).at(-1)).toEqual([""]);
      expect(wrapper.find(".vc-search-bar__search-clear").exists()).toBe(false);
    });

    it("an outside search change updates the input without change or search", async () => {
      wrapper = mountBar({ search: "" });
      await wrapper.setProps({ search: "abc" });
      expect((wrapper.get(SEARCH).element as HTMLInputElement).value).toBe("abc");
      vi.advanceTimersByTime(1000);
      expect(wrapper.emitted("change")).toBeUndefined();
      expect(wrapper.emitted("search")).toBeUndefined();
    });

    it("a parent rewrite mid-pause drops the typed text: no change, no search", async () => {
      wrapper = mountBar({ search: "", searchDebounce: 300 });
      await wrapper.get(SEARCH).setValue("ab");
      await wrapper.setProps({ search: "xyz" });
      vi.advanceTimersByTime(1000);
      expect((wrapper.get(SEARCH).element as HTMLInputElement).value).toBe("xyz");
      expect(wrapper.emitted("change")).toBeUndefined();
      expect(wrapper.emitted("search")).toBeUndefined();
    });
  });

  describe("menus", () => {
    const down = (el: Element) => el.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    const openStatus = async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      await wrapper.get(`${CHIP} .vc-search-bar__chip-main`).trigger("click");
      expect(editor()).not.toBeNull();
    };

    it("stays open for a click inside a teleported date menu", async () => {
      await openStatus();
      const menu = document.createElement("div");
      menu.className = "dp__menu";
      document.body.appendChild(menu);
      down(menu);
      await nextTick();
      expect(editor()).not.toBeNull();
      menu.remove();
    });

    it("closes for a click elsewhere", async () => {
      await openStatus();
      down(document.body);
      await nextTick();
      expect(editor()).toBeNull();
    });

    it("a number editor that commits after its editor closed still sets that field", async () => {
      const total: SearchBarField = { id: "total", label: "Total", filter: { number: true } };
      wrapper = mountBar({ fields: [...fields, total] });
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      listItems()
        .find((b) => b.textContent?.includes("Total"))!
        .click();
      await nextTick();
      const input = document.body.querySelector<HTMLInputElement>(".vc-search-bar__editor .input-stub")!;
      input.value = "7";
      input.dispatchEvent(new Event("input"));
      await nextTick();
      const errors: unknown[] = [];
      wrapper.vm.$.appContext.config.errorHandler = (err) => void errors.push(err);
      down(document.body);
      input.dispatchEvent(new Event("blur"));
      await nextTick();
      expect(errors).toEqual([]);
      expect(editor()).toBeNull();
      const models = wrapper.emitted("update:modelValue") as SearchBarState[][];
      expect(models.at(-1)?.[0].values.total).toEqual({ op: "gte", min: 7 });
    });

    it("disabled bar disables the search, the chips and the Filters button", () => {
      wrapper = mountBar({ disabled: true, modelValue: { search: "", values: { status: ["a"] } } });
      expect(wrapper.get(SEARCH).attributes()).toHaveProperty("disabled");
      expect(wrapper.get(`${CHIP} .vc-search-bar__chip-x`).attributes()).toHaveProperty("disabled");
      expect(wrapper.get(".vc-search-bar__filters-main").attributes()).toHaveProperty("disabled");
    });
  });

  describe("phone", () => {
    const SheetStub = defineComponent({
      name: "VcSidebar",
      props: ["modelValue", "title"],
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

    it("phone: the search and an icon Filters button whose list opens in a sheet", async () => {
      wrapper = mountPhone({ modelValue: { search: "", values: { status: ["a"] } } });
      expect(wrapper.find(SEARCH).exists()).toBe(true);
      expect(wrapper.find(".vc-search-bar__chip").exists()).toBe(false);
      expect(wrapper.find(".vc-search-bar__filters-btn--icon").exists()).toBe(true);
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      expect(wrapper.find(".sheet-stub").exists()).toBe(true);
      expect(listItems().map((b) => b.textContent?.trim())).toHaveLength(4);
    });
  });
});
