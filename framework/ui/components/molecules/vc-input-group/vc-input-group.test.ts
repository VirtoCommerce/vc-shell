import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcInputGroup from "@ui/components/molecules/vc-input-group/vc-input-group.vue";

describe("VcInputGroup", () => {
  it("renders semantic fieldset with legend", () => {
    const wrapper = mount(VcInputGroup as any, {
      props: {
        label: "Delivery",
      },
      slots: {
        default: '<input type="checkbox" value="courier" />',
      },
    });

    expect(wrapper.find("fieldset").exists()).toBe(true);
    expect(wrapper.find("legend").text()).toContain("Delivery");
  });

  it("links error message through aria-describedby", () => {
    const wrapper = mount(VcInputGroup as any, {
      props: {
        label: "Channels",
        error: true,
        errorMessage: "Select at least one",
      },
      slots: {
        default: '<input type="checkbox" value="email" />',
      },
    });

    const fieldset = wrapper.find("fieldset");
    const describedBy = fieldset.attributes("aria-describedby");

    expect(fieldset.attributes("aria-invalid")).toBe("true");
    expect(describedBy).toBeTruthy();
    expect(wrapper.find(`#${describedBy}`).exists()).toBe(true);
  });
});
