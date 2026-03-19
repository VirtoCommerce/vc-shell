import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ThemeSelector from "./theme-selector.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: ref("en") }),
}));

const mockSetTheme = vi.fn();
vi.mock("@core/composables/useTheme", () => ({
  useTheme: () => ({
    currentThemeKey: ref("light"),
    currentLocalizedName: ref("Light"),
    themes: ref([
      { key: "light", name: "Light" },
      { key: "dark", name: "Dark" },
    ]),
    setTheme: mockSetTheme,
  }),
}));

vi.mock("@shared/components/notifications", () => ({
  notification: vi.fn(),
}));

// SettingsMenuItem stub that renders the submenu slot
const SettingsMenuItemStub = {
  template: `<div data-stub="SettingsMenuItem">
    <slot name="submenu" />
  </div>`,
  props: ["icon", "title", "value"],
};

const VcDropdownItemStub = {
  template: '<div data-stub="VcDropdownItem" @click="$emit(\'click\')">{{ title }}</div>',
  props: ["title", "active"],
  emits: ["click"],
};

function factory() {
  return mount(ThemeSelector, {
    global: {
      stubs: {
        SettingsMenuItem: SettingsMenuItemStub,
        VcDropdownItem: VcDropdownItemStub,
      },
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("ThemeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings menu item with correct props", () => {
    const w = factory();
    const item = w.find('[data-stub="SettingsMenuItem"]');
    expect(item.exists()).toBe(true);
  });

  it("renders theme options in submenu slot", () => {
    const w = factory();
    const items = w.findAll('[data-stub="VcDropdownItem"]');
    expect(items.length).toBe(2);
    expect(items[0].text()).toContain("Light");
    expect(items[1].text()).toContain("Dark");
  });

  it("calls setTheme on theme select", async () => {
    const w = factory();
    const items = w.findAll('[data-stub="VcDropdownItem"]');
    await items[1].trigger("click");
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("renders correct number of theme options", () => {
    const w = factory();
    const items = w.findAll('[data-stub="VcDropdownItem"]');
    expect(items).toHaveLength(2);
  });
});
