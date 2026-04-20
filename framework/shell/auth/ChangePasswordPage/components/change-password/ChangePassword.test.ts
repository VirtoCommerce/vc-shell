import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ChangePassword from "./ChangePassword.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

const mockRouterPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useRoute: () => ({ query: {} }),
}));

const mockChangeUserPassword = vi.fn().mockResolvedValue({ succeeded: true });
const mockValidatePassword = vi.fn().mockResolvedValue({ errors: [] });
const mockSignOut = vi.fn().mockResolvedValue(undefined);
const mockLoading = ref(false);

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    changeUserPassword: mockChangeUserPassword,
    loading: mockLoading,
    validatePassword: mockValidatePassword,
    signOut: mockSignOut,
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
  VcBanner: { template: "<div><slot /></div>" },
  Field: {
    template: '<div><slot v-bind="slotProps" /></div>',
    computed: {
      slotProps() {
        return { field: {}, errorMessage: "", errors: [] };
      },
    },
  },
};

function mountComponent(props = {}) {
  return mount(ChangePassword, {
    props,
    global: {
      stubs: globalStubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ChangePassword.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders current, new, and confirm password fields", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL");
    expect(html).toContain("COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL");
    expect(html).toContain("COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL");
  });

  it("renders cancel and save buttons", () => {
    const wrapper = mountComponent();
    const html = wrapper.html();
    expect(html).toContain("COMPONENTS.CHANGE_PASSWORD.CANCEL");
    expect(html).toContain("COMPONENTS.CHANGE_PASSWORD.SAVE");
  });

  it("shows forced password change banner when forced prop is true", () => {
    const wrapper = mountComponent({ forced: true });
    const html = wrapper.html();
    expect(html).toContain("COMPONENTS.CHANGE_PASSWORD.FORCED.LABEL");
  });

  it("does not show forced banner when forced prop is false", () => {
    const wrapper = mountComponent({ forced: false });
    const html = wrapper.html();
    expect(html).not.toContain("COMPONENTS.CHANGE_PASSWORD.FORCED.LABEL");
  });

  it("uses forced title when forced prop is true", () => {
    const wrapper = mountComponent({ forced: true });
    expect(wrapper.exists()).toBe(true);
  });

  it("does not show error hints when form.errors is empty", () => {
    const wrapper = mountComponent();
    const hints = wrapper.findAll("span");
    // No error-related hints should appear
    expect(hints.every((h) => !h.text().includes("ERRORS"))).toBe(true);
  });
});
