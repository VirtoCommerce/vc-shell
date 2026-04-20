import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed } from "vue";
import TableRowActions from "./TableRowActions.vue";
import { TableContextKey } from "@ui/components/organisms/vc-data-table/keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "size", "icon", "iconSize"],
  },
  VcTooltip: {
    template: '<div class="vc-tooltip-stub"><slot /><slot name="tooltip" /></div>',
    props: ["placement", "maxWidth", "variant"],
  },
  Teleport: { template: "<div><slot /></div>" },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableRowActions, {
    props: {
      actions: [
        { name: "edit", icon: "lucide-pencil", title: "Edit" },
        { name: "delete", icon: "lucide-trash", title: "Delete" },
      ],
      ...props,
    },
    global: {
      stubs,
      provide: {
        [TableContextKey as symbol]: {
          selectedRowIndex: computed(() => undefined),
          setSelectedRowIndex: vi.fn(),
          variant: computed(() => undefined),
        },
      },
    },
  });
}

describe("TableRowActions", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("renders the component root", () => {
    const w = factory();
    expect(w.find(".vc-table-row-actions").exists()).toBe(true);
  });
});
