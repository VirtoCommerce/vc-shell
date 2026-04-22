import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { resetSharedAuthDependencyMocks } from "@shell/auth/_test-utils/shared-dependency-mocks";
import { authBaseStubs } from "@shell/auth/_test-utils/shared-stubs";
import { createMockUserManagement } from "@shell/auth/_test-utils/shared-mock-factories";
import ForgotPassword from "./ForgotPassword.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockUserMgmt = createMockUserManagement();

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserMgmt,
}));

const globalStubs = {
  ...authBaseStubs,
};

function mountComponent(props = {}) {
  return mount(ForgotPassword, {
    props,
    global: {
      stubs: globalStubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ForgotPassword.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSharedAuthDependencyMocks();
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders email input field", () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll("input").length).toBeGreaterThanOrEqual(1);
  });

  it("renders send button", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("FORGOT_PASSWORD.SEND_BUTTON");
  });

  it("renders back to login button", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("FORGOT_PASSWORD.BACK_TO_LOGIN");
  });

  it("does not show error hint by default", () => {
    const wrapper = mountComponent();
    // error ref starts as empty string, so v-if="error" is falsy
    const hints = wrapper.findAll("span");
    // No VcHint with error content should be visible
    expect(hints.every((h) => !h.text().includes("error"))).toBe(true);
  });

  it("accepts logo and background props", () => {
    const wrapper = mountComponent({
      logo: "/my-logo.png",
      background: "/my-bg.jpg",
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("accepts custom composable prop", () => {
    const customForgotPassword = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountComponent({
      composable: () => ({ forgotPassword: customForgotPassword }),
    });
    expect(wrapper.exists()).toBe(true);
  });
});
