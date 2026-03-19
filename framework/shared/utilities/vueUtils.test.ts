import { describe, it, expectTypeOf } from "vitest";
import type { ComponentProps, ComponentSlots, ComponentEmit } from "./vueUtils";
import { defineComponent, h } from "vue";

/**
 * vueUtils.ts is purely type-level (no runtime exports).
 * We verify the type utilities produce expected shapes at the type level.
 */

describe("vueUtils type utilities", () => {
  it("ComponentProps extracts props from a class component constructor", () => {
    const Comp = defineComponent({
      props: {
        title: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
      setup() {
        return () => h("div");
      },
    });

    type Props = ComponentProps<typeof Comp>;
    expectTypeOf<Props>().toHaveProperty("title");
    expectTypeOf<Props>().toHaveProperty("count");
  });

  it("ComponentSlots extracts slot types from a component", () => {
    type Slots = ComponentSlots<typeof import("vue").Transition>;
    expectTypeOf<Slots>().toBeObject();
  });

  it("ComponentEmit produces an object type", () => {
    const Comp = defineComponent({
      emits: ["update"],
      setup(_, { emit }) {
        return () => h("div");
      },
    });
    type Emits = ComponentEmit<typeof Comp>;
    expectTypeOf<Emits>().toBeObject();
  });
});
