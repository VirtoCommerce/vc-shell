import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed, nextTick, ref } from "vue";
import { BladeDescriptorKey, BladeStackKey } from "@core/blade-navigation/types";
import PillEditor from "./components/PillEditor.vue";
import type { SearchBarChange, SearchBarField, SearchBarState } from "./types";
import {
  CHIP,
  SEARCH,
  editor,
  fakeResizeObserver,
  fakeWidths,
  fields,
  expandField,
  lastChange,
  accLabels,
  mountBar,
  panel,
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
      expect(accLabels()).toEqual(["Overdue"]);
      expect(panel()).toBeNull();
    });

    it("+N opens an accordion of the hidden fields with the first one expanded", async () => {
      const resize = fakeResizeObserver();
      fakeWidths();
      wrapper = mountBar();
      await setThree();
      // 600 - 200 - 103 = 297 holds one chip and the +N button
      await resize(760, 600);
      expect(wrapper.findAll(CHIP).map((c) => c.text())).toEqual(["Store: x"]);
      await wrapper.get(".vc-search-bar__more").trigger("click");
      expect(accLabels()).toEqual(["Status", "Overdue"]);
      const open = document.body.querySelector(".vc-search-bar__acc-toggle[aria-expanded='true']");
      expect(open?.textContent).toContain("Status");
      document.body.querySelector<HTMLElement>(".vc-search-bar__acc-clear")!.click();
      await nextTick();
      expect(lastChange(wrapper).state.values).toEqual({ store: "x", overdue: true });
    });

    it("a chip is not a named group: its title would read the chip twice", async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      const chip = wrapper.get(CHIP);
      expect(chip.attributes("role")).toBe("presentation");
      expect(chip.attributes("title")).toBeTruthy();
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
      expect(accLabels()).toHaveLength(0);
      expect(editor()).toBeNull();
    });

    it("the Filters button opens the panel: toggles as switches, the rest in the accordion", async () => {
      wrapper = mountBar();
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      expect(panel()).not.toBeNull();
      expect(document.body.querySelector(".vc-search-bar__toggle")?.textContent?.trim()).toBe("Overdue");
      expect(accLabels()).toEqual(["Status", "Created", "Store"]);
      const sw = document.body.querySelector<HTMLInputElement>(".switch-stub")!;
      sw.checked = true;
      sw.dispatchEvent(new Event("change"));
      await nextTick();
      expect(lastChange(wrapper).filters).toEqual({ overdue: true });
      expect(panel()).not.toBeNull();
    });

    it("the panel is a 360px popover at the end of the Filters button", async () => {
      wrapper = mountBar();
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      const pop = wrapper.findComponent({ name: "VcPopover" });
      expect(pop.props()).toMatchObject({
        placement: "bottom-end",
        width: "360px",
        maxWidth: "360px",
        anchorRef: wrapper.get(".vc-search-bar__filters-btn").element,
      });
    });

    it("the panel expands the field applied first, not the first in the field list", async () => {
      wrapper = mountBar();
      await wrapper.setProps({ modelValue: { search: "", values: { store: "x" } } });
      await wrapper.setProps({ modelValue: { search: "", values: { store: "x", status: ["a"] } } });
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      const open = [...document.body.querySelectorAll(".vc-search-bar__acc-toggle[aria-expanded='true']")];
      expect(open.map((b) => b.querySelector(".vc-search-bar__acc-label")?.textContent)).toEqual(["Store"]);
    });

    it("the panel shows the result count and Clear filters switches to the system view", async () => {
      wrapper = mountBar({ resultCount: 12, modelValue: { search: "q", values: { overdue: true } } });
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      expect(panel()!.querySelector(".vc-search-bar__panel-status")?.textContent).toContain("12");
      panel()!.querySelector<HTMLElement>(".vc-search-bar__panel-clear")!.click();
      await nextTick();
      expect(lastChange(wrapper).state).toMatchObject({ search: "q", values: {} });
      expect(panel()).not.toBeNull();
    });

    it("a new counts prop reaches an open editor without reopening it", async () => {
      wrapper = mountBar({ counts: { status: { a: 3 } } });
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      const count = () => panel()!.querySelector(".vc-search-bar-editor__count")?.textContent;
      expect(count()).toBe("3");
      await wrapper.setProps({ counts: { status: { a: 8 } } });
      expect(count()).toBe("8");
    });

    it("the panel's close button closes it and returns focus to the Filters button", async () => {
      wrapper = mountBar();
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      panel()!.querySelector<HTMLElement>(".vc-search-bar__panel-close")!.click();
      await nextTick();
      await nextTick();
      expect(panel()).toBeNull();
      expect(document.activeElement).toBe(wrapper.get(".vc-search-bar__filters-main").element);
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

    const pq: SearchBarField[] = [
      {
        id: "status",
        label: "Status",
        filter: {
          options: [
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "new", label: "New" },
          ],
        },
      },
    ];

    it("a space after a prefix of several values keeps the word and the suggestions; a unique one commits", async () => {
      wrapper = mountBar({ fields: pq });
      const input = wrapper.get(SEARCH);
      await input.trigger("focus");
      await input.setValue("status:p ");
      expect(wrapper.emitted("change")).toBeUndefined();
      expect(wrapper.find(CHIP).exists()).toBe(false);
      expect((input.element as HTMLInputElement).value).toBe("status:p");
      expect(input.attributes("aria-expanded")).toBe("true");
      expect(wrapper.findAll(".vc-search-bar__suggest-token").map((t) => t.text())).toEqual([
        "status:pending",
        "status:paid",
      ]);
      await input.setValue("status:pe ");
      expect(lastChange(wrapper).filters).toEqual({ status: "pending" });
    });

    it("ArrowDown/ArrowUp move through the value suggestions and Enter adds the active one", async () => {
      wrapper = mountBar({ fields: pq });
      const input = wrapper.get(SEARCH);
      await input.trigger("focus");
      await input.setValue("status:");
      const active = () => wrapper!.get(".vc-search-bar__suggest-item--active .vc-search-bar__suggest-token").text();
      expect(active()).toBe("status:pending");
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "ArrowDown" });
      expect(active()).toBe("status:new");
      await input.trigger("keydown", { key: "ArrowDown" });
      expect(active()).toBe("status:pending");
      await input.trigger("keydown", { key: "ArrowUp" });
      expect(active()).toBe("status:new");
      await input.trigger("keydown", { key: "ArrowUp" });
      expect(active()).toBe("status:paid");
      expect(input.attributes("aria-activedescendant")).toBe(
        wrapper.get(".vc-search-bar__suggest-item--active").attributes("id"),
      );
      await input.trigger("keydown", { key: "Enter" });
      expect(lastChange(wrapper).filters).toEqual({ status: "paid" });
      expect(input.attributes("aria-expanded")).toBe("false");
    });

    it("the suggestions header carries the add hint; the value already selected gets a check", async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { status: ["a"] } } });
      const input = wrapper.get(SEARCH);
      await input.trigger("focus");
      await input.setValue("status:");
      expect(wrapper.find(".vc-search-bar__suggest-foot").exists()).toBe(false);
      const head = wrapper.get(".vc-search-bar__suggest-head");
      expect(head.get(".vc-search-bar__suggest-title").text()).toContain("Status");
      expect(head.get(".vc-search-bar__suggest-key").text()).toContain(
        "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SUGGEST.ADD",
      );
      const iconProps = (root: string) =>
        wrapper!
          .findAllComponents({ name: "VcIcon" })
          .filter((c) => c.element.closest(root))
          .map((c) => c.props("icon"));
      expect(iconProps(".vc-search-bar__suggest-key")).toEqual(["lucide-corner-down-left"]);
      expect(iconProps(".vc-search-bar__suggest-item")).toEqual(["lucide-check"]);

      await input.setValue("overdue:");
      expect(iconProps(".vc-search-bar__suggest-item")).toEqual([]);
      await wrapper.setProps({ modelValue: { search: "", values: { overdue: true } } });
      await input.setValue("overdue:");
      expect(iconProps(".vc-search-bar__suggest-item")).toEqual(["lucide-check"]);
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
      document.body.querySelector<HTMLInputElement>(".switch-stub")!.click();
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

    it("Enter in the panel's number editor sets the field", async () => {
      const total: SearchBarField = { id: "total", label: "Total", filter: { number: true } };
      wrapper = mountBar({ fields: [...fields, total] });
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      await expandField("Total");
      const input = panel()!.querySelector<HTMLInputElement>(".vc-search-bar-editor__range .input-stub")!;
      input.value = "7";
      input.dispatchEvent(new Event("input"));
      await nextTick();
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await nextTick();
      const models = wrapper.emitted("update:modelValue") as SearchBarState[][];
      expect(models.at(-1)?.[0].values.total).toEqual({ op: "gte", min: 7 });
    });

    it("stays open for a click inside its own panel", async () => {
      wrapper = mountBar();
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      down(panel()!.querySelector(".vc-search-bar__acc-toggle")!);
      await nextTick();
      expect(panel()).not.toBeNull();
    });

    it("disabled bar disables the search, the chips and the Filters button", () => {
      wrapper = mountBar({ disabled: true, modelValue: { search: "", values: { status: ["a"] } } });
      expect(wrapper.get(SEARCH).attributes()).toHaveProperty("disabled");
      expect(wrapper.get(`${CHIP} .vc-search-bar__chip-x`).attributes()).toHaveProperty("disabled");
      expect(wrapper.get(".vc-search-bar__filters-main").attributes()).toHaveProperty("disabled");
    });
  });
});
