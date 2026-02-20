import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcCheckboxGroup from "@ui/components/molecules/vc-checkbox-group/vc-checkbox-group.vue";

describe("VcCheckboxGroup", () => {
  it("emits updated array when option toggles", async () => {
    const wrapper = mount(VcCheckboxGroup as any, {
      props: {
        modelValue: ["email"],
        name: "channels",
        options: [
          { label: "Email", value: "email" },
          { label: "SMS", value: "sms" },
        ],
      },
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes[1].setValue(true);

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["email", "sms"]]);
  });

  it("applies group disabled state to all checkbox inputs", () => {
    const wrapper = mount(VcCheckboxGroup as any, {
      props: {
        modelValue: [],
        disabled: true,
        options: [
          { label: "Feature A", value: "a" },
          { label: "Feature B", value: "b" },
        ],
      },
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes[0].attributes("disabled")).toBeDefined();
    expect(checkboxes[1].attributes("disabled")).toBeDefined();
  });
});
