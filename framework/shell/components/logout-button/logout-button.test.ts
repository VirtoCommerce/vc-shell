import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import LogoutButton from "./logout-button.vue";
import { CloseSettingsMenuKey } from "@framework/injection-keys";
import { createMockUserManagement } from "@framework/test-mock-factories";

const mockUserManagement = createMockUserManagement();
vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserManagement,
}));

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const blades = ref([
  { id: "workspace", name: "Workspace", visible: true },
  { id: "child-1", name: "Details", visible: true, parentId: "workspace" },
] as Array<{ id: string; name: string; visible: boolean; parentId?: string }>);

const mockCloseBlade = vi.fn(async (bladeId: string) => {
  if (blades.value.length <= 1) return false;
  if (blades.value[blades.value.length - 1]?.id !== bladeId) return false;
  blades.value = blades.value.slice(0, -1);
  return false;
});
vi.mock("@core/blade-navigation", () => ({
  useBladeStack: () => ({
    blades,
    activeBlade: computed(() => blades.value[blades.value.length - 1]),
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
    blades.value = [
      { id: "workspace", name: "Workspace", visible: true },
      { id: "child-1", name: "Details", visible: true, parentId: "workspace" },
    ];
  });

  it("renders SettingsMenuItem", () => {
    const w = factory();
    expect(w.find('[data-stub="SettingsMenuItem"]').exists()).toBe(true);
  });

  it("calls closeSettingsMenu, closes child blades, signs out, and navigates on click", async () => {
    const closeFn = vi.fn();
    const w = factory(closeFn);
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    await vi.waitFor(() => {
      expect(closeFn).toHaveBeenCalled();
      expect(mockCloseBlade).toHaveBeenCalledWith("child-1");
      expect(mockUserManagement.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith({ name: "Login" });
    });
  });

  it("does not sign out if blade close is prevented", async () => {
    mockCloseBlade.mockResolvedValueOnce(true);
    const w = factory();
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    await vi.waitFor(() => {
      expect(mockCloseBlade).toHaveBeenCalledWith("child-1");
    });
    expect(mockUserManagement.signOut).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
