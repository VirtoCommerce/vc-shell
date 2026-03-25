import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import TableActions from "./TableActions.vue";
import { TableContextKey } from "@ui/components/organisms/vc-data-table/keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const stubs = {
  VcIcon: { template: '<i class="vc-icon-stub" />', props: ["icon", "size"] },
  VcTooltip: {
    template: '<div class="vc-tooltip-stub"><slot /><slot name="tooltip" /></div>',
    props: ["placement", "maxWidth", "variant"],
  },
};

function factory(props: Record<string, unknown> = {}, provideContext = true) {
  return mount(TableActions, {
    props: {
      actions: [
        { name: "edit", icon: "lucide-pencil", title: "Edit" },
        { name: "delete", icon: "lucide-trash", title: "Delete", variant: "danger" },
      ],
      visible: true,
      ...props,
    },
    global: {
      stubs,
      provide: provideContext
        ? {
            [TableContextKey as symbol]: {
              selectedRowIndex: computed(() => 0),
              setSelectedRowIndex: vi.fn(),
              variant: computed(() => undefined),
            },
          }
        : {},
    },
  });
}

describe("TableActions", () => {
  it("renders action icons when visible", () => {
    const w = factory();
    expect(w.findAll(".vc-table-composition__action-icon").length).toBe(2);
  });

  it("applies danger class to danger variant actions", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__action-icon--danger").exists()).toBe(true);
  });

  it("emits action event on click", async () => {
    const w = factory();
    await w.findAll(".vc-table-composition__action-icon")[0].trigger("click");
    expect(w.emitted("action")).toBeTruthy();
    expect((w.emitted("action")![0] as any)[0].name).toBe("edit");
  });

  it("does not emit action for disabled actions", async () => {
    const w = factory({
      actions: [{ name: "edit", icon: "lucide-pencil", disabled: true }],
    });
    await w.find(".vc-table-composition__action-icon").trigger("click");
    expect(w.emitted("action")).toBeFalsy();
  });

  it("applies disabled class", () => {
    const w = factory({
      actions: [{ name: "edit", icon: "lucide-pencil", disabled: true }],
    });
    expect(w.find(".vc-table-composition__action-icon--disabled").exists()).toBe(true);
  });

  it("hides hidden actions", () => {
    const w = factory({
      actions: [
        { name: "edit", icon: "lucide-pencil" },
        { name: "hidden", icon: "lucide-eye-off", hidden: true },
      ],
    });
    expect(w.findAll(".vc-table-composition__action-icon").length).toBe(1);
  });
});
