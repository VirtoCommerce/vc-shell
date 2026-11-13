/** Keyboard focus of the desktop menus and of a removed chip */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { focusables } from "./lib/focus";
import { CHIP, editor, fakeResizeObserver, fakeWidths, mountBar, panel } from "./bar.test-helpers";

describe("VcSearchBar focus", () => {
  let wrapper: ReturnType<typeof mountBar> | undefined;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const settle = async () => {
    for (let i = 0; i < 4; i++) await nextTick();
  };
  const active = () => document.activeElement as HTMLElement | null;
  const tab = (shiftKey = false) => {
    active()!.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true }));
  };

  describe("a menu takes the focus when it opens", () => {
    it("the Filters panel: its first control", async () => {
      wrapper = mountBar();
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      await settle();
      expect(panel()!.querySelector(".vc-search-bar__panel-body")!.contains(active())).toBe(true);
      expect(active()!.classList.contains("switch-stub")).toBe(true);
    });

    it("a chip's editor: its input", async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { store: "x" } } });
      await wrapper.get(`${CHIP} .vc-search-bar__chip-main`).trigger("click");
      await settle();
      expect(editor()!.contains(active())).toBe(true);
      expect(active()!.tagName).toBe("INPUT");
    });

    it("+N: the expanded field", async () => {
      const resize = fakeResizeObserver();
      fakeWidths();
      wrapper = mountBar();
      await wrapper.setProps({ modelValue: { search: "", values: { store: "x", status: ["a"], overdue: true } } });
      await resize(760, 600);
      await wrapper.get(".vc-search-bar__more").trigger("click");
      await settle();
      expect(active()!.matches(".vc-search-bar__acc-toggle[aria-expanded='true']")).toBe(true);
    });

    it("Tab and Shift+Tab stay inside the open menu", async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { store: "x" } } });
      await wrapper.get(".vc-search-bar__filters-main").trigger("click");
      await settle();
      const pop = panel()!.closest(".vc-popover") as HTMLElement;
      const all = focusables(pop);
      const [first, last] = [all[0], all[all.length - 1]];
      expect(all.length).toBeGreaterThan(1);
      last.focus();
      tab();
      expect(active()).toBe(first);
      tab(true);
      expect(active()).toBe(last);
    });
  });

  describe("removing a chip with its x", () => {
    async function mountThree() {
      wrapper = mountBar({ modelValue: { search: "", values: { store: "x", status: ["a"] } } });
      await settle();
    }

    it("moves the focus to the next chip", async () => {
      await mountThree();
      const x = wrapper!.findAll(`${CHIP} .vc-search-bar__chip-x`)[0];
      (x.element as HTMLElement).focus();
      await x.trigger("click");
      await settle();
      expect(wrapper!.findAll(CHIP)).toHaveLength(1);
      expect(active()).toBe(wrapper!.get(`${CHIP} .vc-search-bar__chip-main`).element);
    });

    it("the last chip hands the focus to the Filters button", async () => {
      wrapper = mountBar({ modelValue: { search: "", values: { store: "x" } } });
      await settle();
      const x = wrapper.get(`${CHIP} .vc-search-bar__chip-x`);
      (x.element as HTMLElement).focus();
      await x.trigger("click");
      await settle();
      expect(wrapper.find(CHIP).exists()).toBe(false);
      expect(active()).toBe(wrapper.get(".vc-search-bar__filters-main").element);
    });
  });
});
