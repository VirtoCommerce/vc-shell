import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ref, markRaw, defineComponent, nextTick, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { GridStack, type GridStackNode } from "gridstack";
import type { IDashboardWidget } from "@shell/dashboard/draggable-dashboard/types";
import { useGridstack, type UseGridstackOptions, type UseGridstackReturn } from "./useGridstack";
import { LAYOUT_STORAGE_KEY } from "./useGridstackAdapter";

// The gridstack runtime touches the real DOM/layout engine; we only need to verify
// that the composable orchestrates it correctly, so the class is fully mocked.
vi.mock("gridstack", () => ({
  GridStack: { init: vi.fn() },
}));

interface MockGrid {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  load: ReturnType<typeof vi.fn>;
  makeWidget: ReturnType<typeof vi.fn>;
  removeWidget: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  batchUpdate: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

function createMockGrid(): MockGrid {
  return {
    on: vi.fn(),
    off: vi.fn(),
    load: vi.fn(),
    makeWidget: vi.fn(),
    removeWidget: vi.fn(),
    update: vi.fn(),
    batchUpdate: vi.fn(),
    destroy: vi.fn(),
  };
}

const StubComponent = markRaw({ template: "<div />" });

function makeWidget(id: string, overrides: Partial<IDashboardWidget> = {}): IDashboardWidget {
  return {
    id,
    component: StubComponent,
    size: { width: 3, height: 2 },
    ...overrides,
  };
}

/** Mount the composable inside a real component so lifecycle hooks bind. */
function withGridstack(widgets: Ref<IDashboardWidget[]>, options?: UseGridstackOptions) {
  let api!: UseGridstackReturn;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useGridstack(widgets, options);
        return () => null;
      },
    }),
  );
  return { api: () => api, wrapper };
}

/** Retrieve a handler bound via grid.on(eventName, handler). */
function getHandler(grid: MockGrid, event: string): (e: Event, nodes: GridStackNode[]) => void {
  const call = grid.on.mock.calls.find((c) => c[0] === event);
  return call![1];
}

let mockGrid: MockGrid;

beforeEach(() => {
  localStorage.clear();
  mockGrid = createMockGrid();
  (GridStack.init as ReturnType<typeof vi.fn>).mockReturnValue(mockGrid);
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useGridstack — initGrid", () => {
  it("initializes the grid, binds handlers and loads widgets", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);

    api().initGrid(document.createElement("div"));

    expect(GridStack.init).toHaveBeenCalledOnce();
    expect(mockGrid.on).toHaveBeenCalledWith("change", expect.any(Function));
    expect(mockGrid.on).toHaveBeenCalledWith("added", expect.any(Function));
    expect(mockGrid.on).toHaveBeenCalledWith("removed", expect.any(Function));
    expect(mockGrid.load).toHaveBeenCalledOnce();
    expect(api().isInitialized.value).toBe(true);
  });

  it("warns and no-ops when initialized twice", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);

    api().initGrid(document.createElement("div"));
    api().initGrid(document.createElement("div"));

    expect(GridStack.init).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalled();
  });
});

describe("useGridstack — event handlers", () => {
  it("updates layout, notifies and auto-saves on change", () => {
    const onLayoutChange = vi.fn();
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets, { onLayoutChange, autoSave: true });

    api().initGrid(document.createElement("div"));
    getHandler(mockGrid, "change")(new Event("change"), [{ id: "a", x: 4, y: 5 } as GridStackNode]);

    expect(api().layout.value.get("a")).toEqual({ x: 4, y: 5 });
    expect(onLayoutChange).toHaveBeenCalled();
    expect(localStorage.getItem(LAYOUT_STORAGE_KEY)).not.toBeNull();
  });

  it("does not auto-save when autoSave is disabled", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets, { autoSave: false });

    api().initGrid(document.createElement("div"));
    getHandler(mockGrid, "change")(new Event("change"), [{ id: "a", x: 1, y: 1 } as GridStackNode]);

    expect(localStorage.getItem(LAYOUT_STORAGE_KEY)).toBeNull();
  });

  it("adds only unknown widgets on the added event", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);

    api().initGrid(document.createElement("div"));
    getHandler(mockGrid, "added")(new Event("added"), [{ id: "new", x: 2, y: 3 } as GridStackNode]);

    expect(api().layout.value.get("new")).toEqual({ x: 2, y: 3 });
  });

  it("deletes layout entries on the removed event", () => {
    const widgets = ref([makeWidget("a", { position: { x: 1, y: 1 } })]);
    const { api } = withGridstack(widgets);

    api().initGrid(document.createElement("div"));
    expect(api().layout.value.has("a")).toBe(true);

    getHandler(mockGrid, "removed")(new Event("removed"), [{ id: "a" } as GridStackNode]);
    expect(api().layout.value.has("a")).toBe(false);
  });
});

describe("useGridstack — widget operations", () => {
  it("makeWidget is called when the DOM element exists", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    const el = document.createElement("div");
    el.setAttribute("gs-id", "a");
    document.body.appendChild(el);

    api().addWidget(makeWidget("a"));
    expect(mockGrid.makeWidget).toHaveBeenCalledOnce();
  });

  it("removeWidget removes the element and layout entry", () => {
    const widgets = ref([makeWidget("a", { position: { x: 0, y: 0 } })]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    const el = document.createElement("div");
    el.setAttribute("gs-id", "a");
    document.body.appendChild(el);

    api().removeWidget("a");
    expect(mockGrid.removeWidget).toHaveBeenCalledOnce();
    expect(api().layout.value.has("a")).toBe(false);
  });

  it("updateWidgetPosition updates the grid and layout", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    const el = document.createElement("div");
    el.setAttribute("gs-id", "a");
    document.body.appendChild(el);

    api().updateWidgetPosition("a", { x: 7, y: 8 });
    expect(mockGrid.update).toHaveBeenCalledWith(el, { x: 7, y: 8 });
    expect(api().layout.value.get("a")).toEqual({ x: 7, y: 8 });
  });

  it("widget operations are no-ops without an initialized grid", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);

    expect(() => {
      api().addWidget(makeWidget("a"));
      api().removeWidget("a");
      api().updateWidgetPosition("a", { x: 1, y: 1 });
    }).not.toThrow();
    expect(mockGrid.makeWidget).not.toHaveBeenCalled();
  });
});

describe("useGridstack — layout management", () => {
  it("saveLayout writes the current layout to storage", () => {
    const widgets = ref([makeWidget("a", { position: { x: 1, y: 2 } })]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    api().saveLayout();
    expect(loadStored()).toContainEqual({ id: "a", x: 1, y: 2, w: 3, h: 2 });
  });

  it("loadLayout applies a stored layout to the grid", () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify([{ id: "a", x: 9, y: 9 }]));
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    const el = document.createElement("div");
    el.setAttribute("gs-id", "a");
    document.body.appendChild(el);

    api().loadLayout();
    expect(api().layout.value.get("a")).toEqual({ x: 9, y: 9 });
    expect(mockGrid.batchUpdate).toHaveBeenCalled();
  });

  it("resetToDefaults restores built-in positions and saves", () => {
    const widgets = ref([makeWidget("a", { position: { x: 5, y: 6 } })]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    api().layout.value.set("a", { x: 0, y: 0 });
    api().resetToDefaults();

    expect(api().layout.value.get("a")).toEqual({ x: 5, y: 6 });
    expect(loadStored()).toContainEqual({ id: "a", x: 5, y: 6, w: 3, h: 2 });
  });

  it("batchUpdate wraps the callback in grid batching", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    const fn = vi.fn();
    api().batchUpdate(fn);

    expect(fn).toHaveBeenCalledOnce();
    expect(mockGrid.batchUpdate).toHaveBeenCalledWith();
    expect(mockGrid.batchUpdate).toHaveBeenCalledWith(false);
  });

  it("batchUpdate still runs the callback without a grid", () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);

    const fn = vi.fn();
    api().batchUpdate(fn);
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe("useGridstack — lifecycle & reactivity", () => {
  it("destroys the grid on unmount", () => {
    const widgets = ref([makeWidget("a")]);
    const { api, wrapper } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    wrapper.unmount();

    expect(mockGrid.off).toHaveBeenCalledWith("change");
    expect(mockGrid.destroy).toHaveBeenCalledWith(false);
    expect(api().grid.value).toBeNull();
  });

  it("ignores widget changes before the grid is initialized", async () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);

    widgets.value = [makeWidget("b")];
    await nextTick();
    await nextTick();

    expect(mockGrid.makeWidget).not.toHaveBeenCalled();
    expect(mockGrid.removeWidget).not.toHaveBeenCalled();
    expect(api().isInitialized.value).toBe(false);
  });

  it("reacts to added and removed widgets", async () => {
    const widgets = ref([makeWidget("a")]);
    const { api } = withGridstack(widgets);
    api().initGrid(document.createElement("div"));

    const elA = document.createElement("div");
    elA.setAttribute("gs-id", "a");
    document.body.appendChild(elA);
    const elB = document.createElement("div");
    elB.setAttribute("gs-id", "b");
    document.body.appendChild(elB);

    widgets.value = [makeWidget("b")];
    await nextTick();
    await nextTick();

    expect(mockGrid.makeWidget).toHaveBeenCalled();
    expect(mockGrid.removeWidget).toHaveBeenCalled();
  });
});

function loadStored(): Array<Record<string, unknown>> {
  return JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY)!);
}
