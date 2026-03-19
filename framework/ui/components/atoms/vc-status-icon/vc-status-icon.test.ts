import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcStatusIcon from "@ui/components/atoms/vc-status-icon/vc-status-icon.vue";

describe("VcStatusIcon", () => {
  const mountComponent = (props = {}) =>
    mount(VcStatusIcon as any, {
      props,
      global: { stubs: { VcIcon: true } },
    });

  it("renders with role='img'", () => {
    const wrapper = mountComponent();
    expect(wrapper.attributes("role")).toBe("img");
  });

  it("renders inactive icon when status is undefined/false", () => {
    const wrapper = mountComponent();
    expect(wrapper.attributes("aria-label")).toBe("Inactive");
    expect(wrapper.find(".vc-status-icon__icon--inactive").exists()).toBe(true);
    expect(wrapper.find(".vc-status-icon__icon--success").exists()).toBe(false);
  });

  it("renders success icon when status is true", () => {
    const wrapper = mountComponent({ status: true });
    expect(wrapper.attributes("aria-label")).toBe("Active");
    expect(wrapper.find(".vc-status-icon__icon--success").exists()).toBe(true);
    expect(wrapper.find(".vc-status-icon__icon--inactive").exists()).toBe(false);
  });

  it("renders inactive icon when status is false", () => {
    const wrapper = mountComponent({ status: false });
    expect(wrapper.attributes("aria-label")).toBe("Inactive");
    expect(wrapper.find(".vc-status-icon__icon--inactive").exists()).toBe(true);
  });

  it("has vc-status-icon class on root", () => {
    const wrapper = mountComponent();
    expect(wrapper.classes()).toContain("vc-status-icon");
  });

  it("icon has aria-hidden='true'", () => {
    const wrapper = mountComponent({ status: true });
    const icon = wrapper.find(".vc-status-icon__icon");
    expect(icon.attributes("aria-hidden")).toBe("true");
  });
});
