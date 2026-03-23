import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcBreadcrumbsItem from "./vc-breadcrumbs-item.vue";

const baseProps = {
  id: "item-1",
  title: "Home",
  current: false,
};

describe("VcBreadcrumbsItem", () => {
  it("renders as a button when not current", () => {
    const wrapper = mount(VcBreadcrumbsItem, { props: baseProps });
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.find("span.vc-breadcrumbs-item--current").exists()).toBe(false);
  });

  it("renders as a span when current", () => {
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, current: true },
    });
    expect(wrapper.find("span.vc-breadcrumbs-item--current").exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("displays the title text", () => {
    const wrapper = mount(VcBreadcrumbsItem, { props: baseProps });
    expect(wrapper.find(".vc-breadcrumbs-item__title").text()).toBe("Home");
  });

  it("sets aria-current='page' on current item", () => {
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, current: true },
    });
    expect(wrapper.find("[aria-current='page']").exists()).toBe(true);
  });

  it("does not set aria-current on non-current item", () => {
    const wrapper = mount(VcBreadcrumbsItem, { props: baseProps });
    expect(wrapper.find("[aria-current]").exists()).toBe(false);
  });

  it("emits click when button is clicked and no clickHandler", async () => {
    const wrapper = mount(VcBreadcrumbsItem, { props: baseProps });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("calls clickHandler with id when provided", async () => {
    const handler = vi.fn();
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, clickHandler: handler },
    });
    await wrapper.find("button").trigger("click");
    expect(handler).toHaveBeenCalledWith("item-1");
    // Should NOT emit click when clickHandler is provided
    expect(wrapper.emitted("click")).toBeFalsy();
  });

  it("applies light variant class", () => {
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, variant: "light" },
    });
    expect(wrapper.find(".vc-breadcrumbs-item--light").exists()).toBe(true);
  });

  it("does not apply light class for default variant", () => {
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, variant: "default" },
    });
    expect(wrapper.find(".vc-breadcrumbs-item--light").exists()).toBe(false);
  });

  it("renders icon when icon prop is provided", () => {
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, icon: "lucide-home" },
    });
    expect(wrapper.find(".vc-breadcrumbs-item__icon").exists()).toBe(true);
  });

  it("does not render icon when no icon prop", () => {
    const wrapper = mount(VcBreadcrumbsItem, { props: baseProps });
    expect(wrapper.find(".vc-breadcrumbs-item__icon").exists()).toBe(false);
  });

  it("handles ref title (MaybeRef<string>)", () => {
    // Pass a plain string (simplest MaybeRef case)
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, title: "Dashboard" },
    });
    expect(wrapper.find(".vc-breadcrumbs-item__title").text()).toBe("Dashboard");
  });

  it("sets title attribute on title span for tooltip", () => {
    const wrapper = mount(VcBreadcrumbsItem, {
      props: { ...baseProps, title: "A Long Breadcrumb Title" },
    });
    expect(wrapper.find(".vc-breadcrumbs-item__title").attributes("title")).toBe("A Long Breadcrumb Title");
  });
});
