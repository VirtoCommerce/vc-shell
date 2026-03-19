import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SidebarCollapseButton from "./SidebarCollapseButton.vue";

function mountButton(props: Record<string, unknown> = {}) {
  return mount(SidebarCollapseButton, {
    props,
    global: {
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon"],
          template: '<i class="vc-icon-stub" :data-icon="icon" />',
        },
      },
    },
  });
}

describe("SidebarCollapseButton", () => {
  it("renders root element with correct class", () => {
    const wrapper = mountButton();
    expect(wrapper.find(".sidebar-collapse-button").exists()).toBe(true);
  });

  it("renders wrap container", () => {
    const wrapper = mountButton();
    expect(wrapper.find(".sidebar-collapse-button__wrap").exists()).toBe(true);
  });

  it("renders icon element", () => {
    const wrapper = mountButton();
    expect(wrapper.find(".sidebar-collapse-button__icon").exists()).toBe(true);
  });

  it("shows chevron-right icon when collapsed", () => {
    const wrapper = mountButton({ collapsed: true });
    const icon = wrapper.find(".vc-icon-stub");
    expect(icon.attributes("data-icon")).toBe("lucide-chevron-right");
  });

  it("shows chevron-left icon when not collapsed", () => {
    const wrapper = mountButton({ collapsed: false });
    const icon = wrapper.find(".vc-icon-stub");
    expect(icon.attributes("data-icon")).toBe("lucide-chevron-left");
  });

  it("shows chevron-left icon by default (collapsed is undefined)", () => {
    const wrapper = mountButton();
    const icon = wrapper.find(".vc-icon-stub");
    expect(icon.attributes("data-icon")).toBe("lucide-chevron-left");
  });

  it("emits click event when clicked", async () => {
    const wrapper = mountButton();
    await wrapper.find(".sidebar-collapse-button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});
