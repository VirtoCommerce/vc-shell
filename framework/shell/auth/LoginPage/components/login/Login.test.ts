import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import Login from "./Login.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
  };
});

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ query: {} }),
}));

vi.mock("vee-validate", () => ({
  defineRule: vi.fn(),
  useIsFormValid: () => ref(true),
  useForm: () => ({ validateField: vi.fn() }),
  Field: {
    template: "<div><slot v-bind=\"{ errorMessage: '', handleChange: () => {}, errors: [] }\" /></div>",
  },
}));

const mockSignIn = vi.fn().mockResolvedValue({ succeeded: true });
const mockLoading = ref(false);
const mockUser = ref({ passwordExpired: false });

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    signIn: mockSignIn,
    loading: mockLoading,
    user: mockUser,
  }),
}));

vi.mock("@core/composables", () => ({
  useSettings: () => ({
    uiSettings: ref({}),
    loading: ref(false),
  }),
}));

vi.mock("@shell/auth/sign-in/useExternalProvider", () => ({
  useExternalProvider: () => ({
    getProviders: vi.fn().mockResolvedValue([]),
    signIn: vi.fn(),
  }),
}));

vi.mock("@core/plugins/extension-points", () => ({
  ExtensionPoint: { name: "ExtensionPoint", template: "<div />" },
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({ debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() }),
}));

const globalStubs = {
  VcAuthLayout: { template: "<div><slot /></div>" },
  VcForm: { template: "<div><slot /></div>" },
  VcInput: { template: "<input />" },
  VcButton: { template: "<button><slot /></button>" },
  VcHint: { template: "<span><slot /></span>" },
  ExternalProviders: { template: "<div />" },
  ExtensionPoint: { template: "<div />" },
  Field: {
    template: '<div><slot v-bind="slotProps" /></div>',
    computed: {
      slotProps() {
        return { errorMessage: "", handleChange: () => {}, errors: [] };
      },
    },
  },
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
    const html = wrapper.html();
    expect(html).toContain("LOGIN.FIELDS.LOGIN.LABEL");
    expect(html).toContain("LOGIN.FIELDS.PASSWORD.LABEL");
  });

  it("renders login and forgot-password buttons", () => {
    const wrapper = mountLogin();
    const html = wrapper.html();
    expect(html).toContain("LOGIN.BUTTON");
    expect(html).toContain("LOGIN.FORGOT_PASSWORD_BUTTON");
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
    const html = wrapper.html();
    // Form elements should not appear
    expect(html).not.toContain("LOGIN.BUTTON");
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

    expect(mockPush).toHaveBeenCalledWith("/orders/123");
    expect(localStorage.getItem("redirectAfterLogin")).toBeNull();
  });

  it("falls back to root path for unsafe redirect after successful login", async () => {
    localStorage.setItem("redirectAfterLogin", "https://evil.example/phishing");
    const wrapper = mountLogin();

    await wrapper.findAll("button")[0].trigger("click");
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(localStorage.getItem("redirectAfterLogin")).toBeNull();
  });
});
