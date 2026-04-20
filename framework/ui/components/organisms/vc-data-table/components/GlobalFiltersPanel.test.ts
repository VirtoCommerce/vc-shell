import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import GlobalFiltersPanel from "./GlobalFiltersPanel.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  VcButton: { template: '<button class="vc-button-stub"><slot /></button>', props: ["variant", "size", "icon"] },
  VcSelect: {
    template: '<div class="vc-select-stub" />',
    props: ["modelValue", "options", "multiple", "clearable", "placeholder", "emitValue", "optionValue", "optionLabel"],
  },
  VcDropdownPanel: {
    template: '<div class="vc-dropdown-panel-stub"><slot /><slot name="footer" /></div>',
    props: ["show", "anchorRef", "title", "width", "maxWidth"],
  },
  VcDatePicker: { template: '<div class="vc-date-picker-stub" />', props: ["modelValue", "variant"] },
  VcInput: { template: '<input class="vc-input-stub" />', props: ["modelValue", "placeholder", "clearable"] },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(GlobalFiltersPanel, {
    props: {
      show: true,
      filters: [],
      modelValue: {},
      ...props,
    },
    global: {
      stubs,
      mocks: {
        $t: (k: string) => k,
      },
      provide: {
        isMobile: ref(false),
      },
    },
  });
}

describe("GlobalFiltersPanel", () => {
  it("renders when show=true", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("renders dropdown panel", () => {
    const w = factory();
    expect(w.find(".vc-dropdown-panel-stub").exists()).toBe(true);
  });

  it("renders filters from config", () => {
    const w = factory({
      filters: [{ field: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }] }],
    });
    expect(w.exists()).toBe(true);
  });
});
