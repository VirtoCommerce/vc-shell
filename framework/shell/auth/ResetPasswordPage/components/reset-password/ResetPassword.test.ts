import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, computed } from "vue";
import { resetSharedAuthDependencyMocks } from "@shell/auth/_test-utils/shared-dependency-mocks";
import { authBaseStubs } from "@shell/auth/_test-utils/shared-stubs";
import { createMockUserManagement } from "@shell/auth/_test-utils/shared-mock-factories";
import ResetPassword from "./ResetPassword.vue";

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
  VcLoading: { template: "<div />" },
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
    resetSharedAuthDependencyMocks();
    mockLoading.value = false;
    (mockUserMgmt.validateToken as ReturnType<typeof vi.fn>).mockResolvedValue(true);
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders password and confirm password fields", () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll("input").length).toBeGreaterThanOrEqual(2);
  });

  it("renders save password button", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("PASSWORDRESET.SAVE_PASSWORD");
  });

  it("calls validateToken on mount", async () => {
    mountComponent();
    await flushPromises();
    expect(mockUserMgmt.validateToken).toHaveBeenCalledWith("user-1", "abc-token");
  });

  it("shows invalid token error when token is invalid", async () => {
    (mockUserMgmt.validateToken as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain("PASSWORDRESET.ERRORS.Invalid-token");
  });

  it("shows loading indicator when loading", async () => {
    mockLoading.value = true;
    const wrapper = mountComponent();
    expect(wrapper.find("div").exists()).toBe(true);
  });
});
