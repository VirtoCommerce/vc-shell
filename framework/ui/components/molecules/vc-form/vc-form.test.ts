import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcForm from "@ui/components/molecules/vc-form/vc-form.vue";

describe("VcForm", () => {
  const mountComponent = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
    mount(VcForm as any, { props, slots });

  it("renders a form element", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("has novalidate attribute", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
  });

  it("has vc-form class", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("form.vc-form").exists()).toBe(true);
  });

  it("renders default slot content", () => {
    const wrapper = mountComponent({}, { default: '<input type="text" class="form-input" />' });
    expect(wrapper.find(".form-input").exists()).toBe(true);
  });

  it("renders fallback text when no slot content", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("form").text()).toContain("vc-form");
  });

  it("emits submit on form submission", async () => {
    const wrapper = mountComponent();
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("submit")).toBeTruthy();
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });

  it("sets aria-label when provided", () => {
    const wrapper = mountComponent({ ariaLabel: "Login form" });
    expect(wrapper.find("form").attributes("aria-label")).toBe("Login form");
  });

  it("sets aria-labelledby when provided", () => {
    const wrapper = mountComponent({ ariaLabelledby: "form-title" });
    expect(wrapper.find("form").attributes("aria-labelledby")).toBe("form-title");
  });
});
