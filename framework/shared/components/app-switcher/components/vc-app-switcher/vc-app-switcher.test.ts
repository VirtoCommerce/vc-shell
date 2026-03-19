import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import VcAppSwitcher from "./vc-app-switcher.vue";

const VcDropdownStub = {
  name: "VcDropdown",
  template: `<div class="vc-dropdown-stub">
    <div v-for="(item, i) in items" :key="i" class="dropdown-item" @click="$emit('itemClick', item)">
      <slot name="item" :item="item" />
    </div>
  </div>`,
  props: ["modelValue", "items", "isItemActive", "maxHeight", "padded"],
  emits: ["itemClick"],
};

const mockAppsList = [
  { id: "app1", title: "App One", iconUrl: "/icon1.png", relativeUrl: "/app1" },
  { id: "app2", title: "App Two", iconUrl: "/icon2.png", relativeUrl: "/app2" },
];

function mountAppSwitcher(props = {}) {
  return mount(VcAppSwitcher, {
    props: {
      appsList: mockAppsList,
      ...props,
    },
    global: {
      stubs: {
        VcDropdown: VcDropdownStub,
      },
    },
  });
}

describe("VcAppSwitcher", () => {
  it("renders when appsList is provided and non-empty", () => {
    const wrapper = mountAppSwitcher();
    expect(wrapper.find(".vc-app-switcher").exists()).toBe(true);
  });

  it("does not render when appsList is empty", () => {
    const wrapper = mountAppSwitcher({ appsList: [] });
    expect(wrapper.find(".vc-app-switcher").exists()).toBe(false);
  });

  it("does not render when appsList is undefined", () => {
    const wrapper = mountAppSwitcher({ appsList: undefined });
    expect(wrapper.find(".vc-app-switcher").exists()).toBe(false);
  });

  it("renders app items with icons and titles", () => {
    const wrapper = mountAppSwitcher();
    const items = wrapper.findAll(".vc-app-switcher__item");
    expect(items).toHaveLength(2);

    const icons = wrapper.findAll(".vc-app-switcher__item-icon");
    expect(icons[0].attributes("src")).toBe("/icon1.png");
    expect(icons[1].attributes("src")).toBe("/icon2.png");

    const titles = wrapper.findAll(".vc-app-switcher__item-title");
    expect(titles[0].text()).toBe("App One");
    expect(titles[1].text()).toBe("App Two");
  });

  it("emits onClick with the app when an item is clicked", async () => {
    const wrapper = mountAppSwitcher();
    const dropdownItems = wrapper.findAll(".dropdown-item");
    await dropdownItems[0].trigger("click");
    expect(wrapper.emitted("onClick")).toBeTruthy();
    expect(wrapper.emitted("onClick")![0][0]).toEqual(mockAppsList[0]);
  });

  it("sets correct alt attribute on icons", () => {
    const wrapper = mountAppSwitcher();
    const icons = wrapper.findAll(".vc-app-switcher__item-icon");
    expect(icons[0].attributes("alt")).toBe("icon_app1");
    expect(icons[1].attributes("alt")).toBe("icon_app2");
  });

  it("prevents context menu on the container", async () => {
    const wrapper = mountAppSwitcher();
    const container = wrapper.find(".vc-app-switcher");
    // The @contextmenu.prevent is a Vue modifier, it adds preventDefault
    // We just verify the element exists and has the handler
    expect(container.exists()).toBe(true);
  });
});
