import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

// Mock vue-router
vi.mock("vue-router", () => ({
  useRouter: () => ({
    currentRoute: ref({
      meta: { appVersion: "1.2.3" },
    }),
  }),
}));

import VcAuthLayout from "./vc-auth-layout.vue";

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(VcAuthLayout, {
    props,
    slots,
    global: {
      mocks: {
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
    },
  });
}

describe("VcAuthLayout", () => {
  it("renders the main element with vc-auth-layout class", () => {
    const wrapper = factory();
    expect(wrapper.find("main.vc-auth-layout").exists()).toBe(true);
  });

  it("renders title when provided", () => {
    const wrapper = factory({ title: "Sign In" });
    expect(wrapper.find(".vc-auth-layout__title").text()).toBe("Sign In");
  });

  it("renders subtitle when provided", () => {
    const wrapper = factory({ subtitle: "Welcome back" });
    expect(wrapper.find(".vc-auth-layout__subtitle").text()).toBe("Welcome back");
  });

  it("hides header section when neither title nor subtitle are provided", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-auth-layout__header").exists()).toBe(false);
  });

  it("shows header when only title is provided", () => {
    const wrapper = factory({ title: "Login" });
    expect(wrapper.find(".vc-auth-layout__header").exists()).toBe(true);
    expect(wrapper.find(".vc-auth-layout__subtitle").exists()).toBe(false);
  });

  it("renders logo image when logo prop is provided", () => {
    const wrapper = factory({ logo: "/logo.png" });
    const img = wrapper.find(".vc-auth-layout__logo");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("/logo.png");
  });

  it("does not render logo image when logo prop is absent", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-auth-layout__logo").exists()).toBe(false);
  });

  it("applies logoAlt as alt attribute, defaulting to 'Logo'", () => {
    const wrapper = factory({ logo: "/logo.png" });
    expect(wrapper.find(".vc-auth-layout__logo").attributes("alt")).toBe("Logo");
  });

  it("applies custom logoAlt", () => {
    const wrapper = factory({ logo: "/logo.png", logoAlt: "Company Logo" });
    expect(wrapper.find(".vc-auth-layout__logo").attributes("alt")).toBe("Company Logo");
  });

  it("renders default slot content", () => {
    const wrapper = factory({}, { default: '<form class="test-form">content</form>' });
    expect(wrapper.find(".vc-auth-layout__content .test-form").exists()).toBe(true);
  });

  it("renders footer slot when provided", () => {
    const wrapper = factory({}, { footer: "<span>Terms of Service</span>" });
    expect(wrapper.find(".vc-auth-layout__footer").exists()).toBe(true);
    expect(wrapper.find(".vc-auth-layout__footer").text()).toContain("Terms of Service");
  });

  it("hides footer section when no footer slot is provided", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-auth-layout__footer").exists()).toBe(false);
  });

  it("renders version from router meta", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-auth-layout__version").text()).toBe("1.2.3");
  });

  it("applies bgColor as inline backgroundColor", () => {
    const wrapper = factory({ bgColor: "#ff0000" });
    const style = wrapper.find("main").attributes("style");
    expect(style).toContain("background-color");
  });

  it("adds logo--loaded class after image load event", async () => {
    const wrapper = factory({ logo: "/logo.png" });
    const img = wrapper.find(".vc-auth-layout__logo");
    expect(img.classes()).not.toContain("vc-auth-layout__logo--loaded");
    await img.trigger("load");
    expect(img.classes()).toContain("vc-auth-layout__logo--loaded");
  });
});
