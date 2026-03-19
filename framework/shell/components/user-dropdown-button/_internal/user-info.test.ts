import { describe, it, expect, vi, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import UserInfo from "./user-info.vue";

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: vi.fn(() => ({
    user: ref({
      userName: "jdoe",
      fullName: "John Doe",
      isAdministrator: true,
    }),
  })),
}));

vi.mock("@ui/components/atoms/vc-icon", () => ({
  VcIcon: defineComponent({
    name: "VcIcon",
    props: ["icon", "size"],
    setup() {
      return () => h("i", { class: "mock-vc-icon" });
    },
  }),
}));

// Polyfill CSS.escape for jsdom
beforeAll(() => {
  if (typeof globalThis.CSS === "undefined") {
    (globalThis as any).CSS = {};
  }
  if (typeof globalThis.CSS.escape !== "function") {
    globalThis.CSS.escape = (str: string) => str.replace(/['"\\]/g, "\\$&");
  }
});

function mountUserInfo(props = {}) {
  return mount(UserInfo, {
    props,
    global: {
      mocks: {
        $t: (key: string) => key,
        $te: (key: string) => false,
      },
    },
  });
}

describe("user-info.vue", () => {
  it("renders container element", () => {
    const wrapper = mountUserInfo();
    expect(wrapper.find(".vc-user-info").exists()).toBe(true);
  });

  it("shows fallback icon when no avatarUrl", () => {
    const wrapper = mountUserInfo();
    expect(wrapper.find(".vc-user-info__avatar-fallback").exists()).toBe(true);
    expect(wrapper.find(".vc-user-info__avatar").exists()).toBe(false);
  });

  it("shows avatar with background-image when avatarUrl provided", () => {
    const wrapper = mountUserInfo({ avatarUrl: "https://example.com/avatar.png" });
    const avatar = wrapper.find(".vc-user-info__avatar");
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes("style")).toContain("background-image");
    expect(wrapper.find(".vc-user-info__avatar-fallback").exists()).toBe(false);
  });

  it("displays provided name prop over user.fullName", () => {
    const wrapper = mountUserInfo({ name: "Custom Name" });
    expect(wrapper.find(".vc-user-info__name").text()).toBe("Custom Name");
  });

  it("displays user.fullName when no name prop", () => {
    const wrapper = mountUserInfo();
    expect(wrapper.find(".vc-user-info__name").text()).toBe("John Doe");
  });

  it("displays role prop when provided", () => {
    const wrapper = mountUserInfo({ role: "Manager" });
    // $te returns false, so raw role is shown
    expect(wrapper.find(".vc-user-info__role").text()).toBe("Manager");
  });

  it("displays ADMINISTRATOR role for admin user when no role prop", () => {
    const wrapper = mountUserInfo();
    expect(wrapper.find(".vc-user-info__role").text()).toBe("SHELL.USER.ROLE.ADMINISTRATOR");
  });
});
