import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { IBladeToolbar } from "@core/types";
import ToolbarMobile from "./ToolbarMobile.vue";

function createToolbarItem(overrides: Partial<IBladeToolbar> = {}): IBladeToolbar {
  return {
    id: "item-1",
    title: "Save",
    icon: "lucide-save",
    clickHandler: vi.fn(),
    ...overrides,
  };
}

function mountToolbar(items: IBladeToolbar[]) {
  return mount(ToolbarMobile, {
    props: { items },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "size"],
          template: '<i class="vc-icon-stub" :data-icon="icon" />',
        },
      },
    },
  });
}

describe("ToolbarMobile", () => {
  it("renders root element with toolbar role", () => {
    const wrapper = mountToolbar([createToolbarItem()]);
    expect(wrapper.find('[role="toolbar"]').exists()).toBe(true);
  });

  it("renders pill with primary action when collapsed", () => {
    const wrapper = mountToolbar([createToolbarItem({ title: "Save" })]);
    expect(wrapper.find(".vc-blade-toolbar-mobile__pill").exists()).toBe(true);
    expect(wrapper.find(".vc-blade-toolbar-mobile__pill-label").text()).toBe("Save");
  });

  it("does not show more button when only one item", () => {
    const wrapper = mountToolbar([createToolbarItem()]);
    expect(wrapper.find(".vc-blade-toolbar-mobile__pill-more").exists()).toBe(false);
  });

  it("shows more button when multiple items", () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2", title: "Delete" }),
    ]);
    expect(wrapper.find(".vc-blade-toolbar-mobile__pill-more").exists()).toBe(true);
  });

  it("calls clickHandler on primary pill action click", async () => {
    const handler = vi.fn();
    const wrapper = mountToolbar([createToolbarItem({ clickHandler: handler })]);
    await wrapper.find(".vc-blade-toolbar-mobile__pill-action").trigger("click");
    expect(handler).toHaveBeenCalled();
  });

  it("expands menu on more button click", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2", title: "Delete" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");

    expect(wrapper.find(".vc-blade-toolbar-mobile__menu--open").exists()).toBe(true);
  });

  it("renders action buttons in expanded menu", async () => {
    const items = [
      createToolbarItem({ id: "1", title: "Save" }),
      createToolbarItem({ id: "2", title: "Delete" }),
    ];

    const wrapper = mountToolbar(items);
    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");

    const actions = wrapper.findAll(".vc-blade-toolbar-mobile__action");
    expect(actions).toHaveLength(2);
  });

  it("shows close FAB when expanded", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");

    expect(wrapper.find(".vc-blade-toolbar-mobile__close-fab").exists()).toBe(true);
    expect(wrapper.find(".vc-blade-toolbar-mobile__pill").exists()).toBe(false);
  });

  it("closes menu on close FAB click", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");
    expect(wrapper.find(".vc-blade-toolbar-mobile__menu--open").exists()).toBe(true);

    await wrapper.find(".vc-blade-toolbar-mobile__close-fab").trigger("click");
    expect(wrapper.find(".vc-blade-toolbar-mobile__menu--open").exists()).toBe(false);
  });

  it("calls clickHandler and closes menu on action click", async () => {
    const handler = vi.fn();
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1", clickHandler: handler }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");
    await wrapper.findAll(".vc-blade-toolbar-mobile__action")[0].trigger("click");

    expect(handler).toHaveBeenCalled();
    expect(wrapper.find(".vc-blade-toolbar-mobile__menu--open").exists()).toBe(false);
  });

  it("shows backdrop when expanded", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");
    expect(wrapper.find(".vc-blade-toolbar-mobile__backdrop").exists()).toBe(true);
  });

  it("closes menu on backdrop click", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");
    await wrapper.find(".vc-blade-toolbar-mobile__backdrop").trigger("click");
    expect(wrapper.find(".vc-blade-toolbar-mobile__menu--open").exists()).toBe(false);
  });

  it("disables action button when item is disabled", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1", disabled: true }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");
    const firstAction = wrapper.findAll(".vc-blade-toolbar-mobile__action")[0];
    expect(firstAction.attributes("disabled")).toBeDefined();
  });

  it("applies primary icon class to first action item", async () => {
    const wrapper = mountToolbar([
      createToolbarItem({ id: "1" }),
      createToolbarItem({ id: "2" }),
    ]);

    await wrapper.find(".vc-blade-toolbar-mobile__pill-more").trigger("click");
    const firstIcon = wrapper.findAll(".vc-blade-toolbar-mobile__action-icon")[0];
    expect(firstIcon.classes()).toContain("vc-blade-toolbar-mobile__action-icon--primary");
  });

  it("resolves function-based icon", () => {
    const wrapper = mountToolbar([
      createToolbarItem({ icon: () => "lucide-dynamic" }),
    ]);

    const icon = wrapper.find(".vc-icon-stub");
    expect(icon.attributes("data-icon")).toBe("lucide-dynamic");
  });
});
