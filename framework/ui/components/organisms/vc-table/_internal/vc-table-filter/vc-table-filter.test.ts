import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import VcTableFilter from "./vc-table-filter.vue";
import { IsMobileKey } from "@framework/injection-keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  VcButton: {
    template: '<button class="vc-button-stub" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size", "icon", "disabled"],
  },
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
  VcBadge: { template: '<span class="vc-badge-stub"><slot /></span>', props: ["variant"] },
  VcTooltip: { template: '<div class="vc-tooltip-stub"><slot /><slot name="tooltip" /></div>' },
  VcSidebar: { template: '<div class="vc-sidebar-stub"><slot /></div>' },
  Teleport: { template: '<div><slot /></div>' },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(VcTableFilter, {
    props: {
      ...props,
    },
    global: {
      stubs,
      mocks: {
        $t: (k: string) => k,
        $isMobile: ref(false),
        $isDesktop: ref(true),
      },
      provide: {
        [IsMobileKey as symbol]: ref(false),
      },
    },
  });
}

describe("VcTableFilter", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("renders the filter container", () => {
    const w = factory();
    expect(w.find(".vc-table-filter").exists()).toBe(true);
  });

  it("renders when disabled=false", () => {
    const w = factory({ disabled: false });
    expect(w.exists()).toBe(true);
  });

  it("shows counter badge when counter > 0", () => {
    const w = factory({ counter: 3 });
    expect(w.find(".vc-badge-stub").exists()).toBe(true);
  });
});
