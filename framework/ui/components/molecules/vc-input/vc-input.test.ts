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
    const clearBtn = wrapper.find('button[aria-label="COMPONENTS.CONTROLS.CLEAR"]');
    expect(clearBtn.exists()).toBe(true);
  });

  it("has semantic password toggle with a localized aria-label", () => {
    const wrapper = mountInput({ modelValue: "secret", type: "password" });
    const toggleBtn = wrapper.find(".vc-input__showhide");
    expect(toggleBtn.attributes("aria-label")).toBe("COMPONENTS.CONTROLS.SHOW_PASSWORD");
  });

  it("switches the password toggle label once the value is revealed", async () => {
    const wrapper = mountInput({ modelValue: "secret", type: "password" });
    await wrapper.find(".vc-input__showhide").trigger("click");
    expect(wrapper.find(".vc-input__showhide").attributes("aria-label")).toBe("COMPONENTS.CONTROLS.HIDE_PASSWORD");
  });

  it("sets autocomplete on the native input, not on the root wrapper", () => {
    const wrapper = mountInput({ autocomplete: "username" });
    // inheritAttrs is false and leftover attrs go to the root div, so an
    // autocomplete passed as an attribute would never reach the input — hence
    // the prop. Assert the root does NOT carry it, or the fix is silently lost.
    expect(wrapper.find("input").attributes("autocomplete")).toBe("username");
    expect(wrapper.find(".vc-input").attributes("autocomplete")).toBeUndefined();
  });

  it("leaves autocomplete off the input when the prop is not set", () => {
    const wrapper = mountInput();
    expect(wrapper.find("input").attributes("autocomplete")).toBeUndefined();
  });

  describe("v-model contract", () => {
    it("renders modelValue in the input", () => {
      const wrapper = mountInput({ modelValue: "hello" });
      expect((wrapper.find("input").element as HTMLInputElement).value).toBe("hello");
    });

    it("emits update:modelValue on user input", async () => {
      const wrapper = mountInput({ modelValue: "" });
      await wrapper.find("input").setValue("typed text");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["typed text"]);
    });
  });
  describe("native input attributes", () => {
    it("puts min, max, minlength, pattern and inputmode on the input, not on the wrapper", () => {
      const wrapper = mount(VcInput, {
        props: { modelValue: "", type: "number" },
        attrs: { min: "1", max: "10", minlength: "2", pattern: "[0-9]+", inputmode: "numeric" },
      });
      const input = wrapper.find("input");

      expect(input.attributes("min")).toBe("1");
      expect(input.attributes("max")).toBe("10");
      expect(input.attributes("minlength")).toBe("2");
      expect(input.attributes("pattern")).toBe("[0-9]+");
      expect(input.attributes("inputmode")).toBe("numeric");
      expect(wrapper.find(".vc-input").attributes("min")).toBeUndefined();
      expect(wrapper.find(".vc-input").attributes("inputmode")).toBeUndefined();
    });

    it("keeps data-test-id and other attributes on the wrapper", () => {
      const wrapper = mount(VcInput, {
        props: { modelValue: "" },
        attrs: { "data-test-id": "my-field", min: "1" },
      });

      // The template's root is a fragment (a comment, then the element), so the root is found by class.
      expect(wrapper.find(".vc-input").attributes("data-test-id")).toBe("my-field");
      expect(wrapper.find("input").attributes("data-test-id")).toBeUndefined();
    });

    it("sets step on the input only when it is given", () => {
      const withStep = mount(VcInput, { props: { modelValue: 0, type: "number", step: "0.01" } });
      const withoutStep = mount(VcInput, { props: { modelValue: 0, type: "number" } });

      expect(withStep.find("input").attributes("step")).toBe("0.01");
      expect(withoutStep.find("input").attributes("step")).toBeUndefined();
    });
  });
});
