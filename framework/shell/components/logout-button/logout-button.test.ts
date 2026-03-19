import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import LogoutButton from "./logout-button.vue";
import { CloseSettingsMenuKey } from "@framework/injection-keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: ref("en") }),
}));

const mockSignOut = vi.fn().mockResolvedValue(undefined);
vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    signOut: mockSignOut,
  }),
}));

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCloseBlade = vi.fn().mockResolvedValue(false);
vi.mock("@core/composables/useBladeNavigationAdapter", () => ({
  useBladeNavigation: () => ({
    closeBlade: mockCloseBlade,
  }),
}));

const SettingsMenuItemStub = {
  template: '<div data-stub="SettingsMenuItem" @click="$emit(\'trigger:click\')"><slot /></div>',
  props: ["icon", "title"],
  emits: ["trigger:click"],
};

function factory(closeSettingsMenu?: () => void) {
  return mount(LogoutButton, {
    global: {
      stubs: { SettingsMenuItem: SettingsMenuItemStub },
      provide: closeSettingsMenu ? { [CloseSettingsMenuKey as symbol]: closeSettingsMenu } : {},
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SettingsMenuItem", () => {
    const w = factory();
    expect(w.find('[data-stub="SettingsMenuItem"]').exists()).toBe(true);
  });

  it("calls closeSettingsMenu, closeBlade, signOut, and navigates on click", async () => {
    const closeFn = vi.fn();
    mockCloseBlade.mockResolvedValue(false);
    const w = factory(closeFn);
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    await vi.waitFor(() => {
      expect(closeFn).toHaveBeenCalled();
      expect(mockCloseBlade).toHaveBeenCalledWith(0);
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith({ name: "Login" });
    });
  });

  it("does not sign out if closeBlade is prevented", async () => {
    mockCloseBlade.mockResolvedValue(true);
    const w = factory();
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    await vi.waitFor(() => {
      expect(mockCloseBlade).toHaveBeenCalledWith(0);
    });
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
