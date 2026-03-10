import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcMultivalue from "@ui/components/molecules/vc-multivalue/vc-multivalue.vue";

describe("VcMultivalue", () => {
  const mountMultivalue = (props: Record<string, unknown> = {}) =>
    mount(VcMultivalue as any, {
      props: { modelValue: [], ...props },
      global: {
        stubs: {
          VcLabel: false,
          VcHint: false,
          VcIcon: true,
          // MultivalueDropdown is only shown in dictionary mode; stub it to avoid complexity
          MultivalueDropdown: true,
        },
      },
    });

  describe("v-model contract", () => {
    it("renders the correct number of chip items from modelValue", () => {
      const wrapper = mountMultivalue({ modelValue: ["alpha", "beta"] });
      // MultivalueTrigger renders one .vc-multivalue__chip-wrapper per item in modelValue
      const chips = wrapper.findAll(".vc-multivalue__chip-wrapper");
      expect(chips.length).toBe(2);
    });

    it("emits update:model-value containing an array when an item is removed", async () => {
      const wrapper = mountMultivalue({
        modelValue: ["alpha", "beta"],
        // disabled=false (default) — remove icon is rendered
      });
      // The chip remove button emits 'remove' on MultivalueTrigger,
      // which calls removeAtIndex in useMultivalueValues → emits update:model-value
      // VcIcon is stubbed as <vcicon-stub>; find by aria-label attribute
      const removeButtons = wrapper.findAll('[aria-label="Delete item"]');
      expect(removeButtons.length).toBeGreaterThan(0);
      await removeButtons[0].trigger("click");
      const emitted = wrapper.emitted("update:model-value");
      expect(emitted).toBeTruthy();
      expect(Array.isArray(emitted?.[0]?.[0])).toBe(true);
    });
  });
});
