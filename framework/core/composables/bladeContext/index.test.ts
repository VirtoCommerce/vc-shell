import { describe, it, expect } from "vitest";
import { ref, computed, defineComponent, h, nextTick, type ComputedRef } from "vue";
import { mount } from "@vue/test-utils";
import { defineBladeContext, injectBladeContext } from ".";

describe("defineBladeContext / injectBladeContext", () => {
  it("unwraps ref values so consumers access them directly", () => {
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
    // Values are unwrapped — no .value needed
    expect(injected!.value.item).toEqual({ id: "123" });
    expect(injected!.value.disabled).toBe(false);
  });

  it("tracks ref changes reactively", async () => {
    const item = ref({ id: "1" });
    let injected: ComputedRef<Record<string, unknown>> | undefined;

    const Child = defineComponent({
      setup() {
        injected = injectBladeContext();
        return () => h("div");
      },
    });

    const Parent = defineComponent({
      setup() {
        defineBladeContext({ item });
        return () => h(Child);
      },
    });

    mount(Parent);

    expect(injected!.value.item).toEqual({ id: "1" });

    item.value = { id: "2" };
    await nextTick();

    expect(injected!.value.item).toEqual({ id: "2" });
  });

  it("passes plain (non-ref) values through unchanged", () => {
    let injected: ComputedRef<Record<string, unknown>> | undefined;

    const Child = defineComponent({
      setup() {
        injected = injectBladeContext();
        return () => h("div");
      },
    });

    const Parent = defineComponent({
      setup() {
        defineBladeContext({ name: "test", count: 42 });
        return () => h(Child);
      },
    });

    mount(Parent);

    expect(injected!.value.name).toBe("test");
    expect(injected!.value.count).toBe(42);
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

  it("grandchild component accesses unwrapped context from ancestor blade", () => {
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

    expect(injectedItem).toBe("test-item");
  });
});
