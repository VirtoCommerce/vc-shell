import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcInputCurrency from "@ui/components/molecules/vc-input-currency/vc-input-currency.vue";

// jsdom lacks IntersectionObserver; stub it for VcInputDropdown/VcSelect
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

describe("VcInputCurrency", () => {
  const mountCurrency = (props: Record<string, unknown> = {}) =>
    mount(VcInputCurrency as any, {
      props: { modelValue: null, ...props },
      global: {
        stubs: {
          VcLabel: false,
          VcHint: false,
          VcIcon: true,
          teleport: true,
          // Stub VcInputDropdown to expose a simple input — avoids complex dropdown setup
          VcInputDropdown: {
            template: `<div class="vc-input-dropdown-stub"><slot name="control" :placeholder="placeholder" /><input class="vc-input-dropdown__native" type="number" :value="modelValue" @input="$emit('update:model-value', Number($event.target.value))" /></div>`,
            props: ["modelValue", "placeholder"],
            emits: ["update:model-value", "update:option", "blur"],
          },
        },
      },
    });

  describe("v-model contract", () => {
    it("renders without error when modelValue is a number", () => {
      // VcInputCurrency passes numberValue (a vue-currency-input ref) to VcInputDropdown
      // With VcInputDropdown stubbed, we verify the component mounts cleanly
      const wrapper = mountCurrency({ modelValue: 42.5 });
      expect(wrapper.find(".vc-input-currency").exists()).toBe(true);
    });

    it("emits update:model-value with a numeric value on input", async () => {
      const wrapper = mountCurrency({ modelValue: 0 });
      // Trigger via the stub's native input
      const input = wrapper.find("input.vc-input-dropdown__native");
      await input.setValue("99.9");
      const emitted = wrapper.emitted("update:model-value");
      expect(emitted).toBeTruthy();
      // The stub emits a number
      expect(typeof emitted?.[0]?.[0]).toBe("number");
    });
  });
});
