import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcCheckbox from "@ui/components/molecules/vc-checkbox/vc-checkbox.vue";

describe("VcCheckbox", () => {
  const mountCheckbox = (props: Record<string, unknown> = {}) =>
    mount(VcCheckbox as any, {
      props: { modelValue: false, ...props },
      global: { stubs: { VcIcon: true, VcLabel: false, VcHint: false } },
    });

  it("renders a native checkbox input", () => {
    const wrapper = mountCheckbox();
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it("sets aria-required when required prop is true", () => {
    const wrapper = mountCheckbox({ required: true });
    expect(wrapper.find("input").attributes("aria-required")).toBe("true");
  });

  it("does not set aria-required when not required", () => {
    const wrapper = mountCheckbox();
    expect(wrapper.find("input").attributes("aria-required")).toBeUndefined();
  });

  it("sets aria-invalid when error prop is true", () => {
    const wrapper = mountCheckbox({ error: true });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("does not set aria-invalid in default state", () => {
    const wrapper = mountCheckbox();
    expect(wrapper.find("input").attributes("aria-invalid")).toBeUndefined();
  });

  it("links error message via aria-describedby", () => {
    const wrapper = mountCheckbox({ error: true, errorMessage: "Must accept terms" });
    const input = wrapper.find("input");
    const describedBy = input.attributes("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(wrapper.find(`#${describedBy}`).exists()).toBe(true);
    expect(wrapper.find(`#${describedBy}`).text()).toContain("Must accept terms");
  });

  it("shows error only when invalid and errorMessage are both present", () => {
    const noError = mountCheckbox({ error: false });
    expect(noError.find('[role="alert"]').exists()).toBe(false);

    const withError = mountCheckbox({ error: true, errorMessage: "Required" });
    expect(withError.find('[role="alert"]').exists()).toBe(true);
  });

  it("associates label with checkbox via for/id", () => {
    const wrapper = mountCheckbox({ label: "I agree" });
    const input = wrapper.find("input");
    const label = wrapper.find("label[for]");

    expect(label.exists()).toBe(true);
    expect(label.attributes("for")).toBe(input.attributes("id"));
  });

  it("emits update:modelValue on toggle", async () => {
    const wrapper = mountCheckbox({ modelValue: false });
    await wrapper.find("input").setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("disables input when disabled prop is true", () => {
    const wrapper = mountCheckbox({ disabled: true });
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    expect(wrapper.find(".vc-checkbox--disabled").exists()).toBe(true);
  });
});
