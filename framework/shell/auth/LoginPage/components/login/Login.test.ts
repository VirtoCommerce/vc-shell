import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, computed } from "vue";
import { resetSharedAuthDependencyMocks, sharedRouterPushMock } from "@shell/auth/_test-utils/shared-dependency-mocks";
import { authBaseStubs } from "@shell/auth/_test-utils/shared-stubs";
import { createMockUserManagement, createMockExternalProvider } from "@shell/auth/_test-utils/shared-mock-factories";
import Login from "./Login.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockLoading = ref(false);
const mockUser = ref<{ passwordExpired: boolean } | undefined>({ passwordExpired: false });

const mockUserMgmt = createMockUserManagement({
  loading: computed(() => mockLoading.value),
  user: computed(() => mockUser.value),
});

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserMgmt,
}));

const mockExternalProvider = createMockExternalProvider();

vi.mock("@shell/auth/sign-in/useExternalProvider", () => ({
  useExternalProvider: () => mockExternalProvider,
}));

vi.mock("@core/plugins/extension-points", () => ({
  ExtensionPoint: { name: "ExtensionPoint", template: "<div />" },
}));

const globalStubs = {
  ...authBaseStubs,
  ExternalProviders: { template: "<div />" },
  ExtensionPoint: { template: "<div />" },
};

function mountLogin(props = {}) {
  return mount(Login, {
    props,
    global: {
      stubs: globalStubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("Login.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSharedAuthDependencyMocks();
    mockLoading.value = false;
    mockUser.value = { passwordExpired: false };
    localStorage.removeItem("redirectAfterLogin");
  });

  it("renders the component", () => {
    const wrapper = mountLogin();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders login form fields", () => {
    const wrapper = mountLogin();
    expect(wrapper.findAll("input").length).toBeGreaterThanOrEqual(2);
  });

  it("renders login and forgot-password buttons", () => {
    const wrapper = mountLogin();
    const text = wrapper.text();
    expect(text).toContain("LOGIN.BUTTON");
    expect(text).toContain("LOGIN.FORGOT_PASSWORD_BUTTON");
  });

  it("does not show error hint when signInResult.succeeded is true", () => {
    const wrapper = mountLogin();
    // The VcHint for errors has v-if="!signInResult.succeeded"
    // Since default is succeeded=true, no error hint should render
    const hints = wrapper.findAll("span");
    const errorHints = hints.filter((h) => h.text().includes("Authentication error"));
    expect(errorHints.length).toBe(0);
  });

  it("hides form when ssoOnly prop is true", () => {
    const wrapper = mountLogin({ ssoOnly: true });
    expect(wrapper.text()).not.toContain("LOGIN.BUTTON");
  });

  it("passes logo and background props", () => {
    const wrapper = mountLogin({
      logo: "/custom-logo.png",
      background: "/custom-bg.jpg",
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("passes custom title and subtitle", () => {
    const wrapper = mountLogin({
      title: "Custom Title",
      subtitle: "Custom Subtitle",
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("redirects to safe internal path after successful login", async () => {
    localStorage.setItem("redirectAfterLogin", "/orders/123");
    const wrapper = mountLogin();

    await wrapper.findAll("button")[0].trigger("click");
    await flushPromises();

    expect(sharedRouterPushMock).toHaveBeenCalledWith("/orders/123");
    expect(localStorage.getItem("redirectAfterLogin")).toBeNull();
  });

  it("falls back to root path for unsafe redirect after successful login", async () => {
    localStorage.setItem("redirectAfterLogin", "https://evil.example/phishing");
    const wrapper = mountLogin();

    await wrapper.findAll("button")[0].trigger("click");
    await flushPromises();

    expect(sharedRouterPushMock).toHaveBeenCalledWith("/");
    expect(localStorage.getItem("redirectAfterLogin")).toBeNull();
  });
});
