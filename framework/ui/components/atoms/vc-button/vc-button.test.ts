import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcButton from "@ui/components/atoms/vc-button/vc-button.vue";

describe("VcButton", () => {
  const mountButton = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
    mount(VcButton as any, {
      props,
      slots,
      global: { stubs: { VcIcon: true } },
    });

  it("renders a native button element", () => {
    const wrapper = mountButton({}, { default: "Click me" });
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Click me");
  });

  it("defaults to type=button", () => {
    const wrapper = mountButton();
    expect(wrapper.find("button").attributes("type")).toBe("button");
  });

  it("sets disabled when disabled prop is true", () => {
    const wrapper = mountButton({ disabled: true });
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("sets disabled when loading prop is true", () => {
    const wrapper = mountButton({ loading: true });
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("sets aria-busy when loading", () => {
    const wrapper = mountButton({ loading: true });
    expect(wrapper.find("button").attributes("aria-busy")).toBe("true");
  });

  it("does not set aria-busy when not loading", () => {
    const wrapper = mountButton();
    expect(wrapper.find("button").attributes("aria-busy")).toBeUndefined();
  });

  it("forwards ariaLabel prop", () => {
    const wrapper = mountButton({ ariaLabel: "Submit form" });
    expect(wrapper.find("button").attributes("aria-label")).toBe("Submit form");
  });

  it("emits click on button click", async () => {
    const wrapper = mountButton({}, { default: "Go" });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mountButton({ disabled: true }, { default: "Go" });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("applies variant class", () => {
    const wrapper = mountButton({ variant: "danger" }, { default: "Delete" });
    expect(wrapper.find("button").classes()).toContain("vc-button-danger");
  });
});
