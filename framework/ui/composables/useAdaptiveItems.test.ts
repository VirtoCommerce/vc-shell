import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import { defineComponent, h, ref, toRef, type PropType } from "vue";
import { mount, flushPromises } from "@vue/test-utils";

// Container width set by the test; jsdom has no layout
const layout = vi.hoisted(() => ({ width: undefined as unknown as import("vue").Ref<number> }));
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useElementSize: () => ({ width: layout.width, height: ref(0) }),
}));

import { useAdaptiveItems, type IUseAdaptiveItems } from "./useAdaptiveItems";

const ITEM_WIDTH = 100;
// keys with their own width; any other key is ITEM_WIDTH
const WIDTHS: Record<string, number> = { wide: 180, narrow: 60 };
const MORE_WIDTH = 40;

describe("useAdaptiveItems", () => {
  const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");

  const observed = new Set<Element>();

  beforeEach(() => {
    layout.width = ref(300);
    observed.clear();
  });

  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(el: Element) {
          observed.add(el);
        }
        unobserve(el: Element) {
          observed.delete(el);
        }
        disconnect() {}
      },
    );
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        if (this.hasAttribute("data-more-button")) return MORE_WIDTH;
        const key = this.getAttribute("data-item-key");
        return key === null ? 0 : (WIDTHS[key] ?? ITEM_WIDTH);
      },
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    if (offsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
  });

  // moreMargin renders a "more" button pushed to the end the way a consumer does it with an auto margin,
  // which the browser resolves to the free space
  function mountItems(items: string[], moreMargin?: string) {
    let adaptive!: IUseAdaptiveItems<string>;
    const Host = defineComponent({
      props: { items: { type: Array as PropType<string[]>, required: true } },
      setup(props) {
        const containerRef = ref<HTMLElement | null>(null);
        adaptive = useAdaptiveItems({
          containerRef,
          items: toRef(props, "items"),
          getItemKey: (item) => item,
          moreButtonWidth: 40,
          initialItemWidth: 60,
        });
        return () =>
          h("div", { ref: containerRef }, [
            ...adaptive.visibleItems.value.map((key) => h("button", { key, "data-item-key": key })),
            moreMargin && adaptive.showMoreButton.value
              ? h("button", { "data-more-button": "", style: { marginLeft: moreMargin } })
              : null,
          ]);
      },
    });
    return { wrapper: mount(Host, { props: { items } }), adaptive: () => adaptive };
  }

  it("hides what does not fit", async () => {
    const { adaptive } = mountItems(["a", "b", "c", "d"]);
    await flushPromises();

    expect(adaptive().visibleItems.value).toEqual(["a", "b"]);
    expect(adaptive().hiddenItems.value).toEqual(["c", "d"]);
  });

  // Items added after mount used to keep the 60px guess (never rendered while measuring),
  // so 100 + 3 × 60 "fit" in 300px and the toolbar overflowed with no "more" button.
  it("measures items added after mount and hides the ones that do not fit", async () => {
    const { wrapper, adaptive } = mountItems(["a"]);
    await flushPromises();
    expect(adaptive().showMoreButton.value).toBe(false);

    await wrapper.setProps({ items: ["a", "b", "c", "d"] });
    await flushPromises();

    expect(adaptive().showMoreButton.value).toBe(true);
    expect(adaptive().visibleItems.value).toEqual(["a", "b"]);
    expect(adaptive().hiddenItems.value).toEqual(["c", "d"]);
  });

  // 300px less the 40px "more" button leaves 260: "wide" no longer fits after "a", and the narrow item after it
  // must not jump ahead of it, or the toolbar order breaks.
  it("keeps the order: everything after the first item that does not fit goes to more", async () => {
    const { adaptive } = mountItems(["a", "wide", "narrow"]);
    await flushPromises();

    expect(adaptive().visibleItems.value).toEqual(["a"]);
    expect(adaptive().hiddenItems.value).toEqual(["wide", "narrow"]);
  });

  // The free space an auto margin takes is not the button's width: counting it hid one more item per pass,
  // since every hidden item grew the free space, until the mobile widget bar was empty.
  it("does not count the margin of the more button", async () => {
    const { adaptive } = mountItems(["a", "b", "c", "d"], "120px");
    await flushPromises();

    expect(adaptive().visibleItems.value).toEqual(["a", "b"]);
  });

  // An item hidden and shown again renders as a new element. Unobserved, it kept the width measured
  // while it was loading, so the widget strip sized itself too narrow and clipped the last widget.
  it("observes an item rendered again after it was hidden", async () => {
    layout.width.value = 250;
    const { wrapper, adaptive } = mountItems(["a", "b", "c"]);
    await flushPromises();
    expect(adaptive().visibleItems.value).toEqual(["a", "b"]);

    layout.width.value = 400;
    await new Promise((resolve) => setTimeout(resolve, 60));
    await flushPromises();

    expect(adaptive().visibleItems.value).toEqual(["a", "b", "c"]);
    const c = wrapper.find('[data-item-key="c"]').element;
    expect(observed.has(c)).toBe(true);
  });
});
