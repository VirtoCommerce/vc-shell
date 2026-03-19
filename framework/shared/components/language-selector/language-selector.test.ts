import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import LanguageSelector from "./language-selector.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (k: string) => k,
    locale: ref("en"),
    availableLocales: ["en", "de"],
    getLocaleMessage: (locale: string) => {
      const map: Record<string, { language_name: string }> = {
        en: { language_name: "English" },
        de: { language_name: "Deutsch" },
      };
      return map[locale] ?? {};
    },
  }),
}));

const mockSetLocale = vi.fn().mockResolvedValue(undefined);
vi.mock("@core/composables", () => ({
  useLanguages: () => ({
    setLocale: mockSetLocale,
    currentLocale: ref("en"),
  }),
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
  return mount(LanguageSelector, {
    global: {
      stubs: {
        SettingsMenuItem: SettingsMenuItemStub,
        VcDropdownItem: VcDropdownItemStub,
      },
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("LanguageSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings menu item", () => {
    const w = factory();
    expect(w.find('[data-stub="SettingsMenuItem"]').exists()).toBe(true);
  });

  it("renders language options in submenu slot", () => {
    const w = factory();
    const items = w.findAll('[data-stub="VcDropdownItem"]');
    expect(items.length).toBe(2);
    expect(items[0].text()).toContain("English");
    expect(items[1].text()).toContain("Deutsch");
  });

  it("calls setLocale on language select", async () => {
    const w = factory();
    const items = w.findAll('[data-stub="VcDropdownItem"]');
    await items[1].trigger("click");
    expect(mockSetLocale).toHaveBeenCalledWith("de");
  });

  it("renders correct number of language options", () => {
    const w = factory();
    const items = w.findAll('[data-stub="VcDropdownItem"]');
    expect(items).toHaveLength(2);
  });
});
