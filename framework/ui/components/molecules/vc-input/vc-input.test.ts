import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcInput from "@ui/components/molecules/vc-input/vc-input.vue";

describe("VcInput", () => {
  const mountInput = (props: Record<string, unknown> = {}) =>
    mount(VcInput as any, {
      props: { modelValue: "", type: "text", ...props },
      global: { stubs: { VcIcon: true, VcLabel: false, VcHint: false } },
    });

  it("renders a native text input", () => {
    const wrapper = mountInput();
    expect(wrapper.find("input[type='text']").exists()).toBe(true);
  });

  it("sets aria-required when required prop is true", () => {
    const wrapper = mountInput({ required: true });
    expect(wrapper.find("input").attributes("aria-required")).toBe("true");
  });

  it("does not set aria-required when required prop is false", () => {
    const wrapper = mountInput({ required: false });
    expect(wrapper.find("input").attributes("aria-required")).toBeUndefined();
  });

  it("sets aria-invalid when error prop is true", () => {
    const wrapper = mountInput({ error: true });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid when errorMessage is provided", () => {
    const wrapper = mountInput({ errorMessage: "Required" });
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("does not set aria-invalid in the default state", () => {
    const wrapper = mountInput();
    expect(wrapper.find("input").attributes("aria-invalid")).toBeUndefined();
  });

  it("links error message via aria-describedby", () => {
    const wrapper = mountInput({ error: true, errorMessage: "Too short" });
    const input = wrapper.find("input");
    const describedBy = input.attributes("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(wrapper.find(`#${describedBy}`).exists()).toBe(true);
    expect(wrapper.find(`#${describedBy}`).text()).toContain("Too short");
  });

  it("links hint via aria-describedby", () => {
    const wrapper = mountInput({ hint: "Max 100 characters" });
    const input = wrapper.find("input");
    const describedBy = input.attributes("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(wrapper.find(`#${describedBy}`).text()).toContain("Max 100 characters");
  });

  it("associates label with input via for/id", () => {
    const wrapper = mountInput({ label: "Username" });
    const input = wrapper.find("input");
    const label = wrapper.find("label");

    expect(label.exists()).toBe(true);
    expect(label.attributes("for")).toBe(input.attributes("id"));
  });

  it("links label via aria-labelledby when label is present", () => {
    const wrapper = mountInput({ label: "Email" });
    const input = wrapper.find("input");
    const labelledBy = input.attributes("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    expect(wrapper.find(`#${labelledBy}`).exists()).toBe(true);
  });

  it("does not set aria-labelledby when no label", () => {
    const wrapper = mountInput();
    expect(wrapper.find("input").attributes("aria-labelledby")).toBeUndefined();
  });

  it("disables input when disabled prop is true", () => {
    const wrapper = mountInput({ disabled: true });
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  it("shows error message only when invalid and errorMessage are set", () => {
    const noError = mountInput({ error: false });
    expect(noError.find('[role="alert"]').exists()).toBe(false);

    const withError = mountInput({ error: true, errorMessage: "Required field" });
    expect(withError.find('[role="alert"]').exists()).toBe(true);
    expect(withError.text()).toContain("Required field");
  });

  it("does not show error when error is true but errorMessage is empty", () => {
    const wrapper = mountInput({ error: true, errorMessage: "" });
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it("has semantic clear button with aria-label", async () => {
    const wrapper = mountInput({ modelValue: "hello", clearable: true });
    const clearBtn = wrapper.find('button[aria-label="Clear"]');
    expect(clearBtn.exists()).toBe(true);
  });

  it("has semantic password toggle with aria-label", () => {
    const wrapper = mountInput({ modelValue: "secret", type: "password" });
    const toggleBtn = wrapper.find('button[aria-label="Show password"]');
    expect(toggleBtn.exists()).toBe(true);
  });
});
