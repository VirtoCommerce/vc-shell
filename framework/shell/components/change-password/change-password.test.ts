import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import ChangePassword from "./change-password.vue";
import { createMockUserManagement } from "@framework/test-mock-factories";

const mockUserManagement = createMockUserManagement({
  changeUserPassword: vi.fn().mockResolvedValue({ succeeded: true }),
  loading: computed(() => false),
  validatePassword: vi.fn().mockResolvedValue({ errors: [] }),
  signOut: vi.fn().mockResolvedValue(undefined),
});

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserManagement,
}));

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("vee-validate", () => ({
  useForm: vi.fn(),
  useIsFormValid: () => ref(true),
  useIsFormDirty: () => ref(true),
  Field: {
    template: '<div><slot :field="{}" :errorMessage="undefined" :errors="[]" /></div>',
    props: ["label", "name", "rules", "modelValue"],
  },
}));

const stubs = {
  VcPopup: {
    template: '<div data-stub="VcPopup"><slot name="content" /><slot name="footer" /></div>',
    props: ["title", "isMobileFullscreen"],
    emits: ["close"],
  },
  VcForm: { template: '<div data-stub="VcForm"><slot /></div>' },
  VcInput: {
    template: '<input data-stub="VcInput" />',
    props: ["modelValue", "label", "placeholder", "type", "required", "error", "errorMessage"],
  },
  VcButton: { template: '<button data-stub="VcButton"><slot /></button>', props: ["disabled", "variant"] },
  VcHint: { template: '<span data-stub="VcHint"><slot /></span>' },
  VcIcon: { template: '<i data-stub="VcIcon" />', props: ["icon", "size"] },
  "vc-status": { template: '<div data-stub="vc-status"><slot /></div>', props: ["extend", "outline", "variant"] },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(ChangePassword, {
    props,
    global: { stubs },
  });
}

describe("ChangePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the popup", () => {
    const w = factory();
    expect(w.find('[data-stub="VcPopup"]').exists()).toBe(true);
  });

  it("renders three input fields", () => {
    const w = factory();
    const inputs = w.findAll('[data-stub="VcInput"]');
    expect(inputs.length).toBe(3);
  });

  it("renders cancel and save buttons", () => {
    const w = factory();
    const buttons = w.findAll('[data-stub="VcButton"]');
    expect(buttons.length).toBe(2);
  });

  it("shows forced info banner when forced prop is true", () => {
    const w = factory({ forced: true });
    expect(w.find('[data-stub="vc-status"]').exists()).toBe(true);
  });

  it("does not show forced banner by default", () => {
    const w = factory();
    expect(w.find('[data-stub="vc-status"]').exists()).toBe(false);
  });

  it("emits close on cancel when not forced", async () => {
    const w = factory();
    const cancelBtn = w.findAll('[data-stub="VcButton"]')[0];
    await cancelBtn.trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
  });

  it("navigates to login on cancel when forced", async () => {
    const w = factory({ forced: true });
    const cancelBtn = w.findAll('[data-stub="VcButton"]')[0];
    await cancelBtn.trigger("click");
    expect(mockUserManagement.signOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
