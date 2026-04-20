import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import GridstackDashboard from "./GridstackDashboard.vue";

// Mock gridstack CSS import
vi.mock("gridstack/dist/gridstack.min.css", () => ({}));

// Mock useDashboard
const mockWidgets = ref<any[]>([]);
vi.mock("@core/composables/useDashboard", () => ({
  useDashboard: () => ({
    getWidgets: () => mockWidgets.value,
    updateWidgetPosition: vi.fn(),
  }),
}));

// Mock useGridstack
const mockLayout = ref(new Map());
const mockInitGrid = vi.fn();
const mockSaveLayout = vi.fn();
const mockResetToDefaults = vi.fn();

vi.mock("@shell/dashboard/draggable-dashboard/composables/useGridstack", () => ({
  useGridstack: vi.fn(() => ({
    layout: mockLayout,
    isInitialized: ref(false),
    initGrid: mockInitGrid,
    saveLayout: mockSaveLayout,
    resetToDefaults: mockResetToDefaults,
  })),
}));

// Stub VcContainer
const VcContainerStub = {
  name: "VcContainer",
  template: '<div class="vc-container-stub"><slot /></div>',
  props: ["noPadding"],
};

const WidgetA = defineComponent({
  name: "WidgetA",
  render() {
    return h("div", { class: "widget-a" }, "Widget A content");
  },
});

function mountGridstack(props = {}, widgets: any[] = []) {
  mockWidgets.value = widgets;
  return mount(GridstackDashboard, {
    props,
    global: {
      stubs: {
        VcContainer: VcContainerStub,
      },
    },
  });
}

describe("GridstackDashboard", () => {
  beforeEach(() => {
    mockWidgets.value = [];
    mockLayout.value = new Map();
    mockInitGrid.mockClear();
    mockSaveLayout.mockClear();
    mockResetToDefaults.mockClear();
  });

  it("renders VcContainer", () => {
    const wrapper = mountGridstack();
    expect(wrapper.find(".vc-container-stub").exists()).toBe(true);
  });

  it("renders grid-stack container with role=list", () => {
    const wrapper = mountGridstack();
    const grid = wrapper.find(".grid-stack");
    expect(grid.exists()).toBe(true);
    expect(grid.attributes("role")).toBe("list");
  });

  it("renders default aria-label on the grid", () => {
    const wrapper = mountGridstack();
    const grid = wrapper.find(".grid-stack");
    expect(grid.attributes("aria-label")).toBe("Dashboard widgets. Drag widgets to rearrange.");
  });

  it("renders custom aria-label", () => {
    const wrapper = mountGridstack({ ariaLabel: "Custom Dashboard" });
    const grid = wrapper.find(".grid-stack");
    expect(grid.attributes("aria-label")).toBe("Custom Dashboard");
  });

  it("renders widget items from the dashboard service", () => {
    const wrapper = mountGridstack({}, [
      { id: "w1", name: "Widget 1", component: WidgetA, size: { width: 4, height: 2 } },
      { id: "w2", name: "Widget 2", component: WidgetA, size: { width: 6, height: 3 } },
    ]);
    const items = wrapper.findAll(".grid-stack-item");
    expect(items).toHaveLength(2);
  });

  it("sets gs-id, gs-w, gs-h attributes on grid items", () => {
    const wrapper = mountGridstack({}, [
      { id: "w1", name: "Widget 1", component: WidgetA, size: { width: 4, height: 2 } },
    ]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("gs-id")).toBe("w1");
    expect(item.attributes("gs-w")).toBe("4");
    expect(item.attributes("gs-h")).toBe("2");
  });

  it("sets role=listitem on grid items", () => {
    const wrapper = mountGridstack({}, [
      { id: "w1", name: "Widget 1", component: WidgetA, size: { width: 4, height: 2 } },
    ]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("role")).toBe("listitem");
  });

  it("generates aria-label for each widget", () => {
    const wrapper = mountGridstack({}, [
      { id: "w1", name: "Widget 1", component: WidgetA, size: { width: 4, height: 2 } },
    ]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("aria-label")).toBe("Widget 1, widget 1 of 1. Drag to reorder.");
  });

  it("does not show drag handles when showDragHandles is false", () => {
    const wrapper = mountGridstack({ showDragHandles: false }, [
      { id: "w1", component: WidgetA, size: { width: 4, height: 2 } },
    ]);
    expect(wrapper.find(".vc-gridstack-dashboard__drag-handle").exists()).toBe(false);
  });

  it("shows drag handles when showDragHandles is true", () => {
    const wrapper = mountGridstack({ showDragHandles: true }, [
      { id: "w1", component: WidgetA, size: { width: 4, height: 2 } },
    ]);
    expect(wrapper.find(".vc-gridstack-dashboard__drag-handle").exists()).toBe(true);
  });

  it("renders live region for screen reader announcements", () => {
    const wrapper = mountGridstack();
    const liveRegion = wrapper.find("[role='status']");
    expect(liveRegion.exists()).toBe(true);
    expect(liveRegion.attributes("aria-live")).toBe("polite");
  });

  it("uses widget position when provided", () => {
    const wrapper = mountGridstack({}, [
      { id: "w1", component: WidgetA, size: { width: 4, height: 2 }, position: { x: 3, y: 5 } },
    ]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("gs-x")).toBe("3");
    expect(item.attributes("gs-y")).toBe("5");
  });

  it("uses layout position over widget built-in position", () => {
    mockLayout.value = new Map([["w1", { x: 8, y: 1 }]]);
    const wrapper = mountGridstack({}, [
      { id: "w1", component: WidgetA, size: { width: 4, height: 2 }, position: { x: 0, y: 0 } },
    ]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("gs-x")).toBe("8");
    expect(item.attributes("gs-y")).toBe("1");
  });

  it("exposes rearrangeWidgets method that calls resetToDefaults", () => {
    const wrapper = mountGridstack();
    wrapper.vm.rearrangeWidgets();
    expect(mockResetToDefaults).toHaveBeenCalled();
  });

  it("exposes saveLayout method", () => {
    const wrapper = mountGridstack();
    expect(typeof wrapper.vm.saveLayout).toBe("function");
  });

  it("exposes useBuiltInPositions that returns true", () => {
    const wrapper = mountGridstack();
    const result = wrapper.vm.useBuiltInPositions();
    expect(result).toBe(true);
    expect(mockResetToDefaults).toHaveBeenCalled();
  });

  it("falls back to widget.id when name is not set for aria-label", () => {
    const wrapper = mountGridstack({}, [{ id: "my-widget", component: WidgetA, size: { width: 4, height: 2 } }]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("aria-label")).toContain("my-widget");
  });
});
