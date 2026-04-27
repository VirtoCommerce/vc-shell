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
    expect(grid.attributes("aria-label")).toBe("Dashboard widgets. Drag widgets to rearrange.");
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
    expect(item.attributes("aria-label")).toBe("Widget 1, widget 1 of 1. Drag to reorder.");
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
});
