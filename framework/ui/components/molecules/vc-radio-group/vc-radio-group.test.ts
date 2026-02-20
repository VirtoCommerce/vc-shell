import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import VcRadioGroup from "@ui/components/molecules/vc-radio-group/vc-radio-group.vue";

describe("VcRadioGroup", () => {
  it("emits update:modelValue when option changes", async () => {
    const wrapper = mount(VcRadioGroup as any, {
      props: {
        modelValue: "card",
        name: "payment",
        options: [
          { label: "Card", value: "card" },
          { label: "Invoice", value: "invoice" },
        ],
      },
    });

    const radios = wrapper.findAll('input[type="radio"]');
    await radios[1].setValue(true);

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["invoice"]);
  });

  it("propagates name and group-level error accessibility to options", async () => {
    const wrapper = mount(VcRadioGroup as any, {
      props: {
        modelValue: null,
        name: "shipping-speed",
        error: true,
        errorMessage: "Choose one option",
        options: [
          { label: "Standard", value: "standard" },
          { label: "Express", value: "express" },
        ],
      },
    });

    await nextTick();

    const fieldset = wrapper.find("fieldset");
    const describedBy = fieldset.attributes("aria-describedby") || "";
    const radios = wrapper.findAll('input[type="radio"]');

    expect(fieldset.attributes("role")).toBe("radiogroup");
    expect(fieldset.attributes("aria-invalid")).toBe("true");
    expect(radios[0].attributes("name")).toBe("shipping-speed");
    expect(radios[1].attributes("name")).toBe("shipping-speed");
    expect(radios[0].attributes("aria-describedby")).toContain(describedBy);
  });
});
