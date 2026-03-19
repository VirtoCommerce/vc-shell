import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ChangePasswordButton from "./change-password-button.vue";
import { CloseSettingsMenuKey } from "@framework/injection-keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: ref("en") }),
}));

const mockOpen = vi.fn();
vi.mock("@shared/components/popup-handler/composables/usePopup", () => ({
  usePopup: () => ({ open: mockOpen }),
}));

vi.mock("@shell/components/change-password", () => ({
  ChangePassword: { template: "<div />" },
}));

const SettingsMenuItemStub = {
  template: '<div data-stub="SettingsMenuItem" @click="$emit(\'trigger:click\')"><slot /></div>',
  props: ["icon", "title"],
  emits: ["trigger:click"],
};

function factory(closeSettingsMenu?: () => void) {
  return mount(ChangePasswordButton, {
    global: {
      stubs: { SettingsMenuItem: SettingsMenuItemStub },
      provide: closeSettingsMenu ? { [CloseSettingsMenuKey as symbol]: closeSettingsMenu } : {},
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("ChangePasswordButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SettingsMenuItem", () => {
    const w = factory();
    expect(w.find('[data-stub="SettingsMenuItem"]').exists()).toBe(true);
  });

  it("calls open popup on click", async () => {
    const w = factory();
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    expect(mockOpen).toHaveBeenCalled();
  });

  it("calls closeSettingsMenu before opening popup", async () => {
    const closeFn = vi.fn();
    const w = factory(closeFn);
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    expect(closeFn).toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalled();
  });

  it("works without closeSettingsMenu provided", async () => {
    const w = factory();
    await w.find('[data-stub="SettingsMenuItem"]').trigger("click");
    expect(mockOpen).toHaveBeenCalled();
  });
});
