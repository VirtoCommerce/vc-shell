import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { IBladeToolbar } from "@core/types";

vi.mock("@ui/composables/useAdaptiveItems", () => ({
  useAdaptiveItems: (opts: Record<string, unknown>) => {
    const items = opts.items as { value: IBladeToolbar[] };
    return {
      visibleItems: items,
      hiddenItems: { value: [] },
      showMoreButton: { value: false },
      recalculate: vi.fn(),
      updateObserver: vi.fn(),
    };
  },
}));

import ToolbarDesktop from "./ToolbarDesktop.vue";

function createToolbarItem(overrides: Partial<IBladeToolbar> = {}): IBladeToolbar {
  return {
    id: "item-1",
    title: "Save",
    icon: "lucide-save",
    clickHandler: vi.fn(),
    ...overrides,
  };
}

function mountToolbar(props: Record<string, unknown> = {}) {
  return mount(ToolbarDesktop, {
    props: {
      items: [createToolbarItem()],
      isExpanded: false,
      ...props,
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        ToolbarBaseButton: {
          name: "ToolbarBaseButton",
          props: ["id", "icon", "title", "showTitle", "onClick", "disabled", "dataItemKey"],
          template: '<button class="toolbar-base-button-stub" :data-item-key="dataItemKey"><slot /></button>',
        },
        VcDropdown: {
          name: "VcDropdown",
          props: ["modelValue", "items", "floating", "placement", "variant"],
          template: '<div class="vc-dropdown-stub"><slot name="trigger" :isActive="false" /></div>',
        },
        VcIcon: {
          name: "VcIcon",
          props: ["icon"],
          template: '<i class="vc-icon-stub" />',
        },
        VcDropdownItem: {
          name: "VcDropdownItem",
          props: ["title", "icon"],
          template: '<div class="vc-dropdown-item-stub" />',
        },
      },
    },
  });
}

describe("ToolbarDesktop", () => {
  it("renders root element with correct class", () => {
    const wrapper = mountToolbar();
    expect(wrapper.find(".vc-blade-toolbar-desktop").exists()).toBe(true);
  });

  it("renders content container", () => {
    const wrapper = mountToolbar();
    expect(wrapper.find(".vc-blade-toolbar-desktop__content").exists()).toBe(true);
  });

  it("renders toolbar buttons for visible items", () => {
    const wrapper = mountToolbar({
      items: [
        createToolbarItem({ id: "1", title: "Save" }),
        createToolbarItem({ id: "2", title: "Delete" }),
      ],
    });
    expect(wrapper.findAll(".toolbar-base-button-stub")).toHaveLength(2);
  });

  it("renders single item", () => {
    const wrapper = mountToolbar({
      items: [createToolbarItem({ id: "1" })],
    });
    expect(wrapper.findAll(".toolbar-base-button-stub")).toHaveLength(1);
  });

  it("renders no buttons when items is empty", () => {
    const wrapper = mountToolbar({ items: [] });
    expect(wrapper.findAll(".toolbar-base-button-stub")).toHaveLength(0);
  });
});
