import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

describe("VcDropdownItem", () => {
  it("renders title text", () => {
    const wrapper = mount(VcDropdownItem, {
      props: { title: "English" },
    });

    expect(wrapper.text()).toContain("English");
  });

  it("renders icon when provided", () => {
    const wrapper = mount(VcDropdownItem, {
      props: { title: "Settings", icon: "lucide-globe" },
    });

    expect(wrapper.find(".vc-dropdown-item__icon").exists()).toBe(true);
    expect(wrapper.find(".vc-dropdown-item__icon-placeholder").exists()).toBe(false);
  });

  it("renders check icon when active", () => {
    const wrapper = mount(VcDropdownItem, {
      props: { title: "English", active: true },
    });

    expect(wrapper.find(".vc-dropdown-item__icon").exists()).toBe(true);
    expect(wrapper.classes()).toContain("vc-dropdown-item--active");
  });

  it("renders placeholder when no icon and not active", () => {
    const wrapper = mount(VcDropdownItem, {
      props: { title: "English" },
    });

    expect(wrapper.find(".vc-dropdown-item__icon-placeholder").exists()).toBe(true);
    expect(wrapper.find(".vc-dropdown-item__icon").exists()).toBe(false);
  });

  it("applies disabled class", () => {
    const wrapper = mount(VcDropdownItem, {
      props: { title: "Disabled", disabled: true },
    });

    expect(wrapper.classes()).toContain("vc-dropdown-item--disabled");
  });

  it("active check takes priority over icon prop", () => {
    const wrapper = mount(VcDropdownItem, {
      props: { title: "Active", icon: "lucide-globe", active: true },
    });

    // Should show check, not the globe icon — only one VcIcon rendered
    const icons = wrapper.findAll(".vc-dropdown-item__icon");
    expect(icons.length).toBe(1);
    expect(wrapper.find(".vc-dropdown-item__icon-placeholder").exists()).toBe(false);
  });
});
