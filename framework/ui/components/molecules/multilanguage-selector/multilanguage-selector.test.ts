import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import MultilanguageSelector from "./multilanguage-selector.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string, fallback?: string) => fallback ?? k, locale: ref("en") }),
}));

const VcDropdownStub = {
  template: `<div data-stub="VcDropdown">
    <slot name="trigger" />
    <slot name="item" v-for="item in items" :item="item" />
    <slot name="empty" />
  </div>`,
  props: ["modelValue", "items", "floating", "placement", "offset", "emptyText", "isItemActive", "role", "padded"],
  emits: ["item-click", "update:modelValue"],
};

const VcIconStub = {
  template: '<i data-stub="VcIcon" />',
  props: ["icon", "size"],
};

const options = [
  { value: "en", label: "English", flag: "/en.png" },
  { value: "de", label: "Deutsch", flag: "/de.png" },
];

function factory(props: Record<string, unknown> = {}) {
  return mount(MultilanguageSelector, {
    props: { options, modelValue: "en", ...props },
    global: {
      stubs: {
        VcDropdown: VcDropdownStub,
        VcIcon: VcIconStub,
      },
    },
  });
}

describe("MultilanguageSelector", () => {
  it("renders trigger button", () => {
    const w = factory();
    expect(w.find(".vc-language-selector__trigger").exists()).toBe(true);
  });

  it("shows flag image for current language", () => {
    const w = factory({ modelValue: "en" });
    const img = w.find(".vc-language-selector__flag");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("/en.png");
  });

  it("shows globe icon when no flag for current language", () => {
    const w = factory({ options: [{ value: "en", label: "English" }], modelValue: "en" });
    expect(w.find('[data-stub="VcIcon"]').exists()).toBe(true);
  });

  it("trigger is not disabled by default", () => {
    const w = factory();
    const btn = w.find(".vc-language-selector__trigger");
    expect(btn.attributes("disabled")).toBeUndefined();
  });

  it("disables trigger when disabled prop is true", () => {
    const w = factory({ disabled: true });
    const btn = w.find(".vc-language-selector__trigger");
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.classes()).toContain("vc-language-selector__trigger--disabled");
  });

  it("toggles dropdown on click", async () => {
    const w = factory();
    const btn = w.find(".vc-language-selector__trigger");
    await btn.trigger("click");
    expect(btn.classes()).toContain("vc-language-selector__trigger--active");
    await btn.trigger("click");
    expect(btn.classes()).not.toContain("vc-language-selector__trigger--active");
  });

  it("does not toggle when disabled", async () => {
    const w = factory({ disabled: true });
    const btn = w.find(".vc-language-selector__trigger");
    await btn.trigger("click");
    expect(btn.classes()).not.toContain("vc-language-selector__trigger--active");
  });

  it("emits update:modelValue on item click", async () => {
    const w = factory();
    const dropdown = w.findComponent(VcDropdownStub);
    await dropdown.vm.$emit("item-click", { value: "de", label: "Deutsch" });
    expect(w.emitted("update:modelValue")).toBeTruthy();
    expect(w.emitted("update:modelValue")![0]).toEqual(["de"]);
  });

  it("renders item labels", () => {
    const w = factory();
    const labels = w.findAll(".vc-language-selector__item-label");
    expect(labels.length).toBe(2);
    expect(labels[0].text()).toBe("English");
    expect(labels[1].text()).toBe("Deutsch");
  });

  it("shows check icon for active item", () => {
    const w = factory({ modelValue: "en" });
    // The first item should have the active class
    const items = w.findAll(".vc-language-selector__item");
    expect(items[0].classes()).toContain("vc-language-selector__item--active");
  });
});
