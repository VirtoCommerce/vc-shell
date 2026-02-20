import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WidgetDropdownItem from "./WidgetDropdownItem.vue";

describe("WidgetDropdownItem", () => {
  it("renders title", () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Orders" },
    });
    expect(wrapper.text()).toContain("Orders");
  });

  it("renders badge with truncation", () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Orders", badge: 150 },
    });
    expect(wrapper.find(".vc-widget-dropdown-item__badge").text()).toBe("99+");
  });

  it("renders badge for small numbers", () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Orders", badge: 5 },
    });
    expect(wrapper.find(".vc-widget-dropdown-item__badge").text()).toBe("5");
  });

  it("hides badge when undefined", () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Orders" },
    });
    expect(wrapper.find(".vc-widget-dropdown-item__badge").exists()).toBe(false);
  });

  it("applies disabled class", () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Disabled", disabled: true },
    });
    expect(wrapper.classes()).toContain("vc-widget-dropdown-item--disabled");
  });

  it("emits click on Enter key", async () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Orders" },
    });
    await wrapper.trigger("keydown.enter");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mount(WidgetDropdownItem, {
      props: { title: "Disabled", disabled: true },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });
});
