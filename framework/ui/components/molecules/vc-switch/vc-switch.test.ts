import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcSwitch from "@ui/components/molecules/vc-switch/vc-switch.vue";

describe("VcSwitch", () => {
  const mountSwitch = (props: Record<string, unknown> = {}) =>
    mount(VcSwitch as any, {
      props: { modelValue: false, ...props },
      global: { stubs: { VcLabel: false, VcHint: false } },
    });

  describe("v-model contract", () => {
    it("reflects modelValue=true via aria-checked on the switch input", () => {
      const wrapper = mountSwitch({ modelValue: true });
      // VcSwitch uses input[role="switch"] with :aria-checked="!!invertValue(modelValue)"
      // invertValue(true) with default trueValue=true returns true
      expect(wrapper.find('[role="switch"]').attributes("aria-checked")).toBe("true");
    });

    it("emits update:modelValue on switch input change", async () => {
      const wrapper = mountSwitch({ modelValue: false });
      // Trigger an input event on the checkbox (VcSwitch uses @input not @change)
      const input = wrapper.find('[role="switch"]');
      await input.trigger("input");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });
  });
});
