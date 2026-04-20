import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ForgotPassword from "./ForgotPassword.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string, _params?: Record<string, string>) => k, locale: { value: "en" } }),
}));

const mockRouterPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useRoute: () => ({ query: {} }),
}));

const mockRequestPasswordReset = vi.fn().mockResolvedValue(undefined);

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    requestPasswordReset: mockRequestPasswordReset,
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
  Field: {
    template: '<div><slot v-bind="slotProps" /></div>',
    computed: {
      slotProps() {
        return { errorMessage: "", handleChange: () => {}, errors: [] };
      },
    },
  },
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
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders email input field", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("FORGOT_PASSWORD.FIELDS.EMAIL.LABEL");
  });

  it("renders send button", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("FORGOT_PASSWORD.SEND_BUTTON");
  });

  it("renders back to login button", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("FORGOT_PASSWORD.BACK_TO_LOGIN");
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
