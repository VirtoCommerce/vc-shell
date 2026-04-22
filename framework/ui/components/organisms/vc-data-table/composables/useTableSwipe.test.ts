import { describe, it, expect } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { provideTableSwipe, useTableSwipe } from "./useTableSwipe";

function mountWithSwipe<T>(setupFn: () => T) {
  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      provideTableSwipe();
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper };
}

describe("provideTableSwipe + useTableSwipe", () => {
  it("throws when used without provider", () => {
    expect(() => {
      const Comp = defineComponent({
        setup() {
          useTableSwipe();
          return () => h("div");
        },
      });
      mount(Comp, {
        global: {
          config: {
            warnHandler: () => undefined,
          },
        },
      });
    }).toThrow("useTableSwipe must be used within a provider");
  });

  it("activeSwipeId starts as null", () => {
    const { result } = mountWithSwipe(() => useTableSwipe());
    expect(result.activeSwipeId.value).toBeNull();
  });

  it("setActiveSwipe sets and clears activeSwipeId", () => {
    const { result } = mountWithSwipe(() => useTableSwipe());
    result.setActiveSwipe("row-1");
    expect(result.activeSwipeId.value).toBe("row-1");
    result.setActiveSwipe(null);
    expect(result.activeSwipeId.value).toBeNull();
  });

  it("provideTableSwipe returns the same context shape", () => {
    let providerCtx: ReturnType<typeof provideTableSwipe>;
    const Comp = defineComponent({
      setup() {
        providerCtx = provideTableSwipe();
        return () => h("div");
      },
    });
    mount(Comp);
    expect(providerCtx!.activeSwipeId.value).toBeNull();
    providerCtx!.setActiveSwipe("test");
    expect(providerCtx!.activeSwipeId.value).toBe("test");
  });
});
