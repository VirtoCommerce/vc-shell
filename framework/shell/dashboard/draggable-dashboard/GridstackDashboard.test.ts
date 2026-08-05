import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h, markRaw, ref } from "vue";
import GridstackDashboard from "./GridstackDashboard.vue";
import { ModulesReadyKey } from "@framework/injection-keys";
import { LAYOUT_STORAGE_KEY } from "@shell/dashboard/draggable-dashboard/composables/useGridstackAdapter";

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

// These write back into mockLayout, the way the real useGridstack does. A mock
// that only recorded the call is why VCST-5600 shipped: the resize handler read a
// baseline that never moved, and asserting the call could not see that.
const mockUpdateWidgetPosition = vi.fn((id: string, position: { x: number; y: number }) => {
  const previous = mockLayout.value.get(id) ?? {};
  mockLayout.value = new Map(mockLayout.value).set(id, { ...previous, ...position });
});
const mockUpdateWidgetSize = vi.fn((id: string, size: { width: number; height: number }) => {
  const previous = mockLayout.value.get(id) ?? { x: 0, y: 0 };
  mockLayout.value = new Map(mockLayout.value).set(id, { ...previous, ...size });
});

vi.mock("@shell/dashboard/draggable-dashboard/composables/useGridstack", () => ({
  useGridstack: vi.fn(() => ({
    layout: mockLayout,
    isInitialized: ref(false),
    initGrid: mockInitGrid,
    saveLayout: mockSaveLayout,
    resetToDefaults: mockResetToDefaults,
    updateWidgetPosition: mockUpdateWidgetPosition,
    updateWidgetSize: mockUpdateWidgetSize,
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

function createWidget(overrides: Record<string, unknown> = {}) {
  return {
    id: "w1",
    name: "Widget 1",
    component: markRaw(WidgetA),
    size: { width: 4, height: 2 },
    ...overrides,
  };
}

function mountGridstack(props = {}, widgets: any[] = [], modulesReady?: ReturnType<typeof ref<boolean>>) {
  mockWidgets.value = widgets;
  return mount(GridstackDashboard, {
    props,
    global: {
      stubs: {
        VcContainer: VcContainerStub,
      },
      provide: modulesReady ? { [ModulesReadyKey as symbol]: modulesReady } : {},
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
    expect(grid.attributes("aria-label")).toBe(
      "Dashboard widgets. Drag a widget, or focus one and press Enter to rearrange with the arrow keys.",
    );
  });

  it("renders custom aria-label", () => {
    const wrapper = mountGridstack({ ariaLabel: "Custom Dashboard" });
    const grid = wrapper.find(".grid-stack");
    expect(grid.attributes("aria-label")).toBe("Custom Dashboard");
  });

  it("renders widget items from the dashboard service", () => {
    const wrapper = mountGridstack({}, [
      createWidget(),
      createWidget({ id: "w2", name: "Widget 2", size: { width: 6, height: 3 } }),
    ]);
    const items = wrapper.findAll(".grid-stack-item");
    expect(items).toHaveLength(2);
  });

  it("sets gs-id, gs-w, gs-h attributes on grid items", () => {
    const wrapper = mountGridstack({}, [createWidget()]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("gs-id")).toBe("w1");
    expect(item.attributes("gs-w")).toBe("4");
    expect(item.attributes("gs-h")).toBe("2");
  });

  it("sets role=listitem on grid items", () => {
    const wrapper = mountGridstack({}, [createWidget()]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("role")).toBe("listitem");
  });

  it("generates aria-label for each widget", () => {
    const wrapper = mountGridstack({}, [createWidget()]);
    const item = wrapper.find(".grid-stack-item");
    // The label advertises the keyboard route, not dragging — a screen-reader user
    // cannot drag, so "Drag to reorder" told them to do the one thing they cannot.
    expect(item.attributes("aria-label")).toBe(
      "Widget 1, widget 1 of 1. Press Enter to pick up and rearrange with the arrow keys.",
    );
  });

  it("does not show drag handles when showDragHandles is false", () => {
    const wrapper = mountGridstack({ showDragHandles: false }, [createWidget()]);
    expect(wrapper.find(".vc-gridstack-dashboard__drag-handle").exists()).toBe(false);
  });

  it("shows drag handles when showDragHandles is true", () => {
    const wrapper = mountGridstack({ showDragHandles: true }, [createWidget()]);
    expect(wrapper.find(".vc-gridstack-dashboard__drag-handle").exists()).toBe(true);
  });

  it("renders live region for screen reader announcements", () => {
    const wrapper = mountGridstack();
    const liveRegion = wrapper.find("[role='status']");
    expect(liveRegion.exists()).toBe(true);
    expect(liveRegion.attributes("aria-live")).toBe("polite");
  });

  it("uses widget position when provided", () => {
    const wrapper = mountGridstack({}, [createWidget({ position: { x: 3, y: 5 } })]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("gs-x")).toBe("3");
    expect(item.attributes("gs-y")).toBe("5");
  });

  it("uses layout position over widget built-in position", () => {
    mockLayout.value = new Map([["w1", { x: 8, y: 1 }]]);
    const wrapper = mountGridstack({}, [createWidget({ position: { x: 0, y: 0 } })]);
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
    const wrapper = mountGridstack({}, [createWidget({ id: "my-widget", name: undefined })]);
    const item = wrapper.find(".grid-stack-item");
    expect(item.attributes("aria-label")).toContain("my-widget");
  });

  describe("modules-ready gate", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("hides the grid and shows skeletons while modulesReady=false", () => {
      const wrapper = mountGridstack({}, [], ref(false));
      expect(wrapper.find(".grid-stack").exists()).toBe(false);
      expect(wrapper.find(".vc-gridstack-dashboard__skeleton-grid").exists()).toBe(true);
      expect(wrapper.findAll(".dashboard-widget-skeleton").length).toBeGreaterThan(0);
    });

    it("does not call initGrid until modulesReady becomes true", async () => {
      const ready = ref(false);
      mountGridstack({}, [createWidget()], ready);
      await flushPromises();
      expect(mockInitGrid).not.toHaveBeenCalled();

      ready.value = true;
      await flushPromises();
      expect(mockInitGrid).toHaveBeenCalledTimes(1);
    });

    it("treats missing ModulesReadyKey as ready (default behaviour)", async () => {
      mountGridstack({}, [createWidget()]);
      await flushPromises();
      expect(mockInitGrid).toHaveBeenCalledTimes(1);
    });

    it("renders default 4 skeletons when no persisted layout exists", () => {
      const wrapper = mountGridstack({}, [], ref(false));
      expect(wrapper.findAll(".dashboard-widget-skeleton")).toHaveLength(4);
    });

    it("renders skeletons matching persisted layout size when localStorage has saved positions", () => {
      localStorage.setItem(
        LAYOUT_STORAGE_KEY,
        JSON.stringify([
          { id: "a", x: 0, y: 0, w: 4, h: 3 },
          { id: "b", x: 4, y: 0, w: 8, h: 5 },
        ]),
      );
      const wrapper = mountGridstack({}, [], ref(false));
      expect(wrapper.findAll(".dashboard-widget-skeleton")).toHaveLength(2);
    });

    it("falls back to default skeletons when localStorage payload is malformed", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, "{not-json");
      const wrapper = mountGridstack({}, [], ref(false));
      expect(wrapper.findAll(".dashboard-widget-skeleton")).toHaveLength(4);
    });

    it("marks the skeleton region as aria-busy for assistive tech", () => {
      const wrapper = mountGridstack({}, [], ref(false));
      const region = wrapper.find(".vc-gridstack-dashboard__skeleton-grid");
      expect(region.attributes("aria-busy")).toBe("true");
      expect(region.attributes("role")).toBe("status");
    });
  });

  // WCAG 2.5.7: reordering and resizing must not require a drag.
  describe("keyboard reordering", () => {
    beforeEach(() => {
      // mockClear, not mockReset — the implementations above are the point.
      mockUpdateWidgetPosition.mockClear();
      mockUpdateWidgetSize.mockClear();
      mockLayout.value = new Map([["a", { x: 2, y: 3 }]]);
    });

    const mountWithWidget = () =>
      mountGridstack({ resizable: true }, [
        { id: "a", name: "Widget A", component: markRaw(WidgetA), size: { width: 6, height: 6 } },
      ]);

    const item = (wrapper: ReturnType<typeof mountGridstack>) => wrapper.find(".grid-stack-item");

    it("puts every widget in the tab order", () => {
      expect(item(mountWithWidget()).attributes("tabindex")).toBe("0");
    });

    it("ignores arrow keys until the widget is picked up", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "ArrowRight" });
      expect(mockUpdateWidgetPosition).not.toHaveBeenCalled();
    });

    it("moves the widget one cell per arrow press once picked up", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      await item(wrapper).trigger("keydown", { key: "ArrowRight" });

      expect(mockUpdateWidgetPosition).toHaveBeenCalledWith("a", { x: 3, y: 3 });
    });

    it("never moves a widget to a negative coordinate", async () => {
      mockLayout.value = new Map([["a", { x: 0, y: 0 }]]);
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      await item(wrapper).trigger("keydown", { key: "ArrowLeft" });

      expect(mockUpdateWidgetPosition).not.toHaveBeenCalled();
    });

    it("resizes with Shift held", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      await item(wrapper).trigger("keydown", { key: "ArrowRight", shiftKey: true });

      expect(mockUpdateWidgetSize).toHaveBeenCalledWith("a", { width: 7, height: 6 });
    });

    // Each of the next four covers one symptom QA reported on the live dashboard
    // (VCST-5600): resize stuck at baseline ±1, the other axis snapping back, a
    // resize announced when nothing changed, and Escape leaving the size behind.
    it("accumulates resize across presses instead of recomputing from the baseline", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });

      await item(wrapper).trigger("keydown", { key: "ArrowRight", shiftKey: true });
      expect(mockUpdateWidgetSize).toHaveBeenLastCalledWith("a", { width: 7, height: 6 });

      await item(wrapper).trigger("keydown", { key: "ArrowRight", shiftKey: true });
      expect(mockUpdateWidgetSize).toHaveBeenLastCalledWith("a", { width: 8, height: 6 });
    });

    it("resizes only the axis being changed", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });

      await item(wrapper).trigger("keydown", { key: "ArrowRight", shiftKey: true });
      await item(wrapper).trigger("keydown", { key: "ArrowDown", shiftKey: true });

      // Width stays at the 7 it just reached rather than reverting to 6.
      expect(mockUpdateWidgetSize).toHaveBeenLastCalledWith("a", { width: 7, height: 7 });
    });

    it("does not announce a resize that the minimum span refused", async () => {
      mockLayout.value = new Map([["a", { x: 2, y: 3, width: 2, height: 2 }]]);
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });

      await item(wrapper).trigger("keydown", { key: "ArrowLeft", shiftKey: true });

      expect(mockUpdateWidgetSize).not.toHaveBeenCalled();
      expect(wrapper.find('[role="status"]').text()).not.toContain("resized");
    });

    it("restores the original size when the move is cancelled with Escape", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      await item(wrapper).trigger("keydown", { key: "ArrowRight", shiftKey: true });
      mockUpdateWidgetSize.mockClear();

      await item(wrapper).trigger("keydown", { key: "Escape" });

      expect(mockUpdateWidgetSize).toHaveBeenLastCalledWith("a", { width: 6, height: 6 });
    });

    it("announces the row the widget actually landed in, not the one requested", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });

      // Gridstack compacts rows, so a requested y can differ from the result.
      mockUpdateWidgetPosition.mockImplementationOnce((id: string) => {
        const previous = mockLayout.value.get(id) ?? {};
        mockLayout.value = new Map(mockLayout.value).set(id, { ...previous, x: 2, y: 0 });
      });
      await item(wrapper).trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.find('[role="status"]').text()).toContain("row 1");
    });

    it("restores the original position when the move is cancelled with Escape", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      await item(wrapper).trigger("keydown", { key: "ArrowRight" });
      await item(wrapper).trigger("keydown", { key: "ArrowDown" });
      mockUpdateWidgetPosition.mockClear();

      await item(wrapper).trigger("keydown", { key: "Escape" });

      expect(mockUpdateWidgetPosition).toHaveBeenLastCalledWith("a", { x: 2, y: 3 });
    });

    it("marks the picked-up widget so the state is visible, and clears it on drop", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      expect(item(wrapper).classes()).toContain("vc-gridstack-dashboard__item--grabbed");

      await item(wrapper).trigger("keydown", { key: "Enter" });
      expect(item(wrapper).classes()).not.toContain("vc-gridstack-dashboard__item--grabbed");
    });

    it("persists the layout when the move is committed", async () => {
      const wrapper = mountWithWidget();
      await item(wrapper).trigger("keydown", { key: "Enter" });
      await item(wrapper).trigger("keydown", { key: "ArrowRight" });
      mockSaveLayout.mockClear();

      await item(wrapper).trigger("keydown", { key: "Enter" });

      expect(mockSaveLayout).toHaveBeenCalled();
    });
  });
});
