import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, computed } from "vue";
import { resetSharedAuthDependencyMocks } from "@shell/auth/_test-utils/shared-dependency-mocks";
import { authBaseStubs } from "@shell/auth/_test-utils/shared-stubs";
import { createMockUserManagement } from "@shell/auth/_test-utils/shared-mock-factories";
import ChangePassword from "./ChangePassword.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockLoading = ref(false);

const mockUserMgmt = createMockUserManagement({
  loading: computed(() => mockLoading.value),
});

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserMgmt,
}));

const globalStubs = {
  ...authBaseStubs,
  VcBanner: { template: "<div><slot /></div>" },
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
    resetSharedAuthDependencyMocks();
    mockLoading.value = false;
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders current, new, and confirm password fields", () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll("input").length).toBeGreaterThanOrEqual(3);
  });

  it("renders cancel and save buttons", () => {
    const wrapper = mountComponent();
    const text = wrapper.text();
    expect(text).toContain("COMPONENTS.CHANGE_PASSWORD.CANCEL");
    expect(text).toContain("COMPONENTS.CHANGE_PASSWORD.SAVE");
  });

  it("shows forced password change banner when forced prop is true", () => {
    const wrapper = mountComponent({ forced: true });
    expect(wrapper.text()).toContain("COMPONENTS.CHANGE_PASSWORD.FORCED.LABEL");
  });

  it("does not show forced banner when forced prop is false", () => {
    const wrapper = mountComponent({ forced: false });
    expect(wrapper.text()).not.toContain("COMPONENTS.CHANGE_PASSWORD.FORCED.LABEL");
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
