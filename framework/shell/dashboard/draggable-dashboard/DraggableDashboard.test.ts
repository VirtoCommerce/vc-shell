import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import DraggableDashboard from "./DraggableDashboard.vue";

// Stub GridstackDashboard
const GridstackDashboardStub = defineComponent({
  name: "GridstackDashboard",
  props: ["showDragHandles", "resizable", "ariaLabel"],
  setup(props, { expose }) {
    const rearrangeWidgets = vi.fn();
    const recalculateLayout = vi.fn();
    const saveLayout = vi.fn();
    const useBuiltInPositions = vi.fn(() => true);
    expose({ rearrangeWidgets, recalculateLayout, saveLayout, useBuiltInPositions });
    return { rearrangeWidgets, recalculateLayout, saveLayout, useBuiltInPositions };
  },
  render() {
    return h("div", { class: "gridstack-stub" });
  },
});

function mountDashboard(props = {}) {
  return mount(DraggableDashboard, {
    props,
    global: {
      stubs: {
        GridstackDashboard: GridstackDashboardStub,
      },
    },
  });
}

describe("DraggableDashboard", () => {
  it("renders GridstackDashboard", () => {
    const wrapper = mountDashboard();
    expect(wrapper.find(".gridstack-stub").exists()).toBe(true);
  });

  it("passes showDragHandles prop (default false)", () => {
    const wrapper = mountDashboard();
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.props("showDragHandles")).toBe(false);
  });

  it("passes showDragHandles=true", () => {
    const wrapper = mountDashboard({ showDragHandles: true });
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.props("showDragHandles")).toBe(true);
  });

  it("passes resizable prop (default false)", () => {
    const wrapper = mountDashboard();
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.props("resizable")).toBe(false);
  });

  it("passes resizable=true", () => {
    const wrapper = mountDashboard({ resizable: true });
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.props("resizable")).toBe(true);
  });

  it("passes default ariaLabel", () => {
    const wrapper = mountDashboard();
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.props("ariaLabel")).toBe("Dashboard widgets. Drag widgets to rearrange.");
  });

  it("passes custom ariaLabel", () => {
    const wrapper = mountDashboard({ ariaLabel: "My Dashboard" });
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.props("ariaLabel")).toBe("My Dashboard");
  });

  it("exposes rearrangeWidgets method", () => {
    const wrapper = mountDashboard();
    expect(typeof wrapper.vm.rearrangeWidgets).toBe("function");
  });

  it("exposes recalculateLayout method", () => {
    const wrapper = mountDashboard();
    expect(typeof wrapper.vm.recalculateLayout).toBe("function");
  });

  it("exposes saveLayout method", () => {
    const wrapper = mountDashboard();
    expect(typeof wrapper.vm.saveLayout).toBe("function");
  });

  it("exposes useBuiltInPositions method", () => {
    const wrapper = mountDashboard();
    expect(typeof wrapper.vm.useBuiltInPositions).toBe("function");
  });

  it("delegates rearrangeWidgets to GridstackDashboard", () => {
    const wrapper = mountDashboard();
    wrapper.vm.rearrangeWidgets();
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.vm.rearrangeWidgets).toHaveBeenCalled();
  });

  it("delegates saveLayout to GridstackDashboard", () => {
    const wrapper = mountDashboard();
    wrapper.vm.saveLayout();
    const gs = wrapper.findComponent(GridstackDashboardStub);
    expect(gs.vm.saveLayout).toHaveBeenCalled();
  });
});
