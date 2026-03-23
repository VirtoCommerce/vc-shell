import { describe, it, expect } from "vitest";
import { ref, computed, defineComponent, h, type ComputedRef } from "vue";
import { mount } from "@vue/test-utils";
import { defineBladeContext, injectBladeContext } from "./useBladeContext";

describe("defineBladeContext / injectBladeContext", () => {
  it("provides and injects blade context", () => {
    const item = ref({ id: "123" });
    const disabled = computed(() => false);
    let injected: ComputedRef<Record<string, unknown>> | undefined;

    const Child = defineComponent({
      setup() {
        injected = injectBladeContext();
        return () => h("div");
      },
    });

    const Parent = defineComponent({
      setup() {
        defineBladeContext({ item, disabled });
        return () => h(Child);
      },
    });

    mount(Parent);

    expect(injected).toBeDefined();
    expect(injected!.value.item).toBe(item);
    expect(injected!.value.disabled).toBe(disabled);
  });

  it("throws InjectionError when no context provided", () => {
    expect(() => {
      mount(
        defineComponent({
          setup() {
            injectBladeContext();
            return () => h("div");
          },
        }),
      );
    }).toThrow("BladeContext");
  });

  it("grandchild component accesses context from ancestor blade", () => {
    const item = ref("test-item");
    let injectedItem: unknown;

    const GrandChild = defineComponent({
      setup() {
        const ctx = injectBladeContext();
        injectedItem = ctx.value.item;
        return () => h("div");
      },
    });

    const Child = defineComponent({
      setup() {
        return () => h(GrandChild);
      },
    });

    const Blade = defineComponent({
      setup() {
        defineBladeContext({ item });
        return () => h(Child);
      },
    });

    mount(Blade);

    expect(injectedItem).toBe(item);
  });
});
