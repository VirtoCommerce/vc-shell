import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import VcEnvironmentBanner from "./vc-environment-banner.vue";

describe("VcEnvironmentBanner", () => {
  it("renders the environment name", () => {
    const wrapper = mount(VcEnvironmentBanner, { props: { name: "Development" } });
    expect(wrapper.text()).toContain("Development");
  });

  it("applies the color modifier class", () => {
    const wrapper = mount(VcEnvironmentBanner, {
      props: { name: "QA", color: "info" },
    });
    expect(wrapper.classes()).toContain("vc-environment-banner--info");
  });

  it("falls back to neutral modifier when color is omitted", () => {
    const wrapper = mount(VcEnvironmentBanner, { props: { name: "Sandbox" } });
    expect(wrapper.classes()).toContain("vc-environment-banner--neutral");
  });

  it("exposes an accessible label", () => {
    const wrapper = mount(VcEnvironmentBanner, { props: { name: "Development" } });
    expect(wrapper.attributes("aria-label")).toBe("Environment indicator: Development");
  });
});
