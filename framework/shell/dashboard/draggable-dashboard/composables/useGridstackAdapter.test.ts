import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { markRaw } from "vue";
import type { GridStackNode } from "gridstack";
import {
  LAYOUT_STORAGE_KEY,
  toGridstackWidget,
  fromGridstackNode,
  gridstackNodesToLayoutMap,
  loadLayoutFromStorage,
  saveLayoutToStorage,
  clearLayoutStorage,
  mergeLayoutWithWidgets,
} from "./useGridstackAdapter";
import type { IDashboardWidget, DashboardWidgetPosition } from "@shell/dashboard/draggable-dashboard/types";

const StubComponent = markRaw({ template: "<div />" });

function makeWidget(id: string, overrides: Partial<IDashboardWidget> = {}): IDashboardWidget {
  return {
    id,
    component: StubComponent,
    size: { width: 3, height: 2 },
    ...overrides,
  };
}

describe("toGridstackWidget", () => {
  it("uses the explicit position argument when provided", () => {
    const widget = makeWidget("a", { position: { x: 1, y: 1 } });
    expect(toGridstackWidget(widget, { x: 5, y: 6 })).toEqual({
      id: "a",
      x: 5,
      y: 6,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    });
  });

  it("falls back to the widget's own position", () => {
    const widget = makeWidget("a", { position: { x: 2, y: 3 } });
    expect(toGridstackWidget(widget)).toMatchObject({ x: 2, y: 3 });
  });

  it("defaults to origin when no position is available", () => {
    expect(toGridstackWidget(makeWidget("a"))).toMatchObject({ x: 0, y: 0 });
  });
});

describe("fromGridstackNode", () => {
  it("maps node fields into id/position/size", () => {
    const node: GridStackNode = { id: "a", x: 4, y: 5, w: 6, h: 7 };
    expect(fromGridstackNode(node)).toEqual({
      id: "a",
      position: { x: 4, y: 5 },
      size: { width: 6, height: 7 },
    });
  });

  it("applies defaults for missing fields", () => {
    expect(fromGridstackNode({} as GridStackNode)).toEqual({
      id: "",
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
    });
  });
});

describe("gridstackNodesToLayoutMap", () => {
  it("builds a map keyed by node id", () => {
    const map = gridstackNodesToLayoutMap([
      { id: "a", x: 1, y: 2 },
      { id: "b", x: 3, y: 4 },
    ] as GridStackNode[]);

    expect(map.get("a")).toEqual({ x: 1, y: 2 });
    expect(map.get("b")).toEqual({ x: 3, y: 4 });
  });

  it("skips nodes without an id", () => {
    const map = gridstackNodesToLayoutMap([{ x: 1, y: 2 }] as GridStackNode[]);
    expect(map.size).toBe(0);
  });

  it("defaults missing coordinates to 0", () => {
    const map = gridstackNodesToLayoutMap([{ id: "a" }] as GridStackNode[]);
    expect(map.get("a")).toEqual({ x: 0, y: 0 });
  });
});

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadLayoutFromStorage", () => {
    it("returns null when nothing is stored", () => {
      expect(loadLayoutFromStorage()).toBeNull();
    });

    it("parses the new array format", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify([{ id: "a", x: 1, y: 2 }]));
      const layout = loadLayoutFromStorage();
      expect(layout?.get("a")).toEqual({ x: 1, y: 2 });
    });

    it("parses the legacy object format", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ a: { x: 1, y: 2 } }));
      const layout = loadLayoutFromStorage();
      expect(layout?.get("a")).toEqual({ x: 1, y: 2 });
    });

    it("skips legacy entries with non-numeric coordinates", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ a: { x: "nope", y: 2 }, b: { x: 3, y: 4 } }));
      const layout = loadLayoutFromStorage();
      expect(layout?.has("a")).toBe(false);
      expect(layout?.get("b")).toEqual({ x: 3, y: 4 });
    });

    it("returns null for a non-object primitive payload", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(42));
      expect(loadLayoutFromStorage()).toBeNull();
    });

    it("returns null and warns on malformed JSON", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      localStorage.setItem(LAYOUT_STORAGE_KEY, "{not json");
      expect(loadLayoutFromStorage()).toBeNull();
      expect(warn).toHaveBeenCalled();
    });
  });

  describe("saveLayoutToStorage", () => {
    it("serializes widgets using the layout position", () => {
      const widgets = [makeWidget("a")];
      const layout = new Map<string, DashboardWidgetPosition>([["a", { x: 7, y: 8 }]]);

      saveLayoutToStorage(widgets, layout);

      const stored = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY)!);
      expect(stored).toEqual([{ id: "a", x: 7, y: 8, w: 3, h: 2 }]);
    });

    it("falls back to the widget's built-in position then origin", () => {
      const widgets = [makeWidget("a", { position: { x: 1, y: 1 } }), makeWidget("b")];

      saveLayoutToStorage(widgets, new Map());

      const stored = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY)!);
      expect(stored).toEqual([
        { id: "a", x: 1, y: 1, w: 3, h: 2 },
        { id: "b", x: 0, y: 0, w: 3, h: 2 },
      ]);
    });

    it("warns instead of throwing when storage fails", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });

      expect(() => saveLayoutToStorage([makeWidget("a")], new Map())).not.toThrow();
      expect(warn).toHaveBeenCalled();
    });
  });

  describe("clearLayoutStorage", () => {
    it("removes the stored layout", () => {
      localStorage.setItem(LAYOUT_STORAGE_KEY, "[]");
      clearLayoutStorage();
      expect(localStorage.getItem(LAYOUT_STORAGE_KEY)).toBeNull();
    });

    it("warns instead of throwing when removal fails", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("fail");
      });

      expect(() => clearLayoutStorage()).not.toThrow();
      expect(warn).toHaveBeenCalled();
    });
  });
});

describe("mergeLayoutWithWidgets", () => {
  it("uses saved positions when a non-empty saved layout is provided", () => {
    const widgets = [makeWidget("a"), makeWidget("b", { position: { x: 9, y: 9 } })];
    const saved = new Map<string, DashboardWidgetPosition>([["a", { x: 1, y: 2 }]]);

    const result = mergeLayoutWithWidgets(widgets, saved);

    expect(result.get("a")).toEqual({ x: 1, y: 2 });
    // b has no saved entry -> falls back to built-in position
    expect(result.get("b")).toEqual({ x: 9, y: 9 });
  });

  it("falls back to origin for widgets without any position", () => {
    const result = mergeLayoutWithWidgets([makeWidget("a")], new Map([["z", { x: 1, y: 1 }]]));
    expect(result.get("a")).toEqual({ x: 0, y: 0 });
  });

  it("uses built-in positions when all widgets have them and no saved layout exists", () => {
    const widgets = [makeWidget("a", { position: { x: 1, y: 1 } }), makeWidget("b", { position: { x: 2, y: 2 } })];

    const result = mergeLayoutWithWidgets(widgets, null);

    expect(result.get("a")).toEqual({ x: 1, y: 1 });
    expect(result.get("b")).toEqual({ x: 2, y: 2 });
  });

  it("auto-arranges widgets that lack positions", () => {
    const widgets = [
      makeWidget("a", { size: { width: 6, height: 2 } }),
      makeWidget("b", { size: { width: 6, height: 2 } }),
      makeWidget("c", { size: { width: 6, height: 2 } }),
    ];

    const result = mergeLayoutWithWidgets(widgets, null);

    // First two fit on row 0 side by side, third wraps to the next row.
    expect(result.get("a")).toEqual({ x: 0, y: 0 });
    expect(result.get("b")).toEqual({ x: 6, y: 0 });
    expect(result.get("c")).toEqual({ x: 0, y: 2 });
  });

  it("auto-arranges a widget spanning the full width onto its own row", () => {
    const widgets = [
      makeWidget("a", { size: { width: 12, height: 2 } }),
      makeWidget("b", { size: { width: 12, height: 2 } }),
    ];

    const result = mergeLayoutWithWidgets(widgets, null);

    expect(result.get("a")).toEqual({ x: 0, y: 0 });
    expect(result.get("b")).toEqual({ x: 0, y: 2 });
  });
});
