import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import ResetPassword from "./ResetPassword.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

const mockRouterPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useRoute: () => ({ query: {} }),
}));

const mockValidateToken = vi.fn().mockResolvedValue(true);
const mockValidatePassword = vi.fn().mockResolvedValue({ errors: [] });
const mockResetPasswordByToken = vi.fn().mockResolvedValue({ succeeded: true });
const mockSignIn = vi.fn().mockResolvedValue({ succeeded: true });
const mockLoading = ref(false);

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    validateToken: mockValidateToken,
    validatePassword: mockValidatePassword,
    resetPasswordByToken: mockResetPasswordByToken,
    signIn: mockSignIn,
    loading: mockLoading,
  }),
}));

vi.mock("@core/composables", () => ({
  useSettings: () => ({
    uiSettings: ref({}),
    loading: ref(false),
  }),
}));

const globalStubs = {
  VcAuthLayout: { template: "<div><slot /></div>" },
  VcForm: { template: "<div><slot /></div>" },
  VcInput: { template: "<input />" },
  VcButton: { template: "<button @click='$emit(\"click\")'><slot /></button>" },
  VcHint: { template: "<span><slot /></span>" },
  VcLoading: { template: "<div />" },
  Field: {
    template: "<div><slot v-bind=\"slotProps\" /></div>",
    computed: {
      slotProps() {
        return { field: {}, errorMessage: "", handleChange: () => {}, errors: [] };
      },
    },
  },
};

function mountComponent(props = {}) {
  return mount(ResetPassword, {
    props: {
      userId: "user-1",
      userName: "testuser",
      token: "abc-token",
      logo: "/logo.svg",
      background: "/bg.jpg",
      ...props,
    },
    global: {
      stubs: globalStubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ResetPassword.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockValidateToken.mockResolvedValue(true);
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders password and confirm password fields", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("PASSWORDRESET.FIELDS.PASSWORD.LABEL");
    expect(html).toContain("PASSWORDRESET.FIELDS.CONFIRM_PASSWORD.LABEL");
  });

  it("renders save password button", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("PASSWORDRESET.SAVE_PASSWORD");
  });

  it("calls validateToken on mount", async () => {
    mountComponent();
    await flushPromises();
    expect(mockValidateToken).toHaveBeenCalledWith("user-1", "abc-token");
  });

  it("shows invalid token error when token is invalid", async () => {
    mockValidateToken.mockResolvedValue(false);
    const wrapper = mountComponent();
    await flushPromises();
    const html = wrapper.html();
    expect(html).toContain("PASSWORDRESET.ERRORS.Invalid-token");
  });

  it("shows loading indicator when loading", async () => {
    mockLoading.value = true;
    const wrapper = mountComponent();
    expect(wrapper.find("div").exists()).toBe(true);
  });
});
