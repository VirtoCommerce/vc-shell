import { describe, it, expect, vi, beforeAll } from "vitest";
import { createToolbarService } from "@core/services/toolbar-service";
import { createWidgetService, cloneWidget } from "@core/services/widget-service";

describe("toolbar-service", () => {
  it("keeps registration flag true while the same id is still registered in another blade", () => {
    const service = createToolbarService();

    service.registerToolbarItem({ id: "duplicate" } as any, "blade-a");
    service.registerToolbarItem({ id: "duplicate" } as any, "blade-b");

    service.unregisterToolbarItem("duplicate", "blade-a");

    expect(service.getToolbarItems("blade-b")).toHaveLength(1);
    expect(service.isToolbarItemRegistered("duplicate")).toBe(true);
  });

  it("registers and retrieves toolbar items by blade", () => {
    const service = createToolbarService();

    service.registerToolbarItem({ id: "btn-1", title: "Save" } as any, "blade-1");
    service.registerToolbarItem({ id: "btn-2", title: "Delete" } as any, "blade-1");

    const items = service.getToolbarItems("blade-1");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toEqual(["btn-1", "btn-2"]);
  });

  it("merges global * items into blade-specific items", () => {
    const service = createToolbarService();

    service.registerToolbarItem({ id: "global-btn" } as any, "*");
    service.registerToolbarItem({ id: "blade-btn" } as any, "blade-1");

    const items = service.getToolbarItems("blade-1");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toContain("global-btn");
    expect(items.map((i) => i.id)).toContain("blade-btn");
  });

  it("does not duplicate global items when blade has same id", () => {
    const service = createToolbarService();

    service.registerToolbarItem({ id: "shared" } as any, "*");
    service.registerToolbarItem({ id: "shared" } as any, "blade-1");

    expect(service.getToolbarItems("blade-1")).toHaveLength(1);
  });

  it("clears all items for a blade", () => {
    const service = createToolbarService();

    service.registerToolbarItem({ id: "a" } as any, "blade-1");
    service.registerToolbarItem({ id: "b" } as any, "blade-1");
    service.registerToolbarItem({ id: "c" } as any, "blade-2");

    service.clearBladeToolbarItems("blade-1");

    expect(service.getToolbarItems("blade-1")).toHaveLength(0);
    expect(service.getToolbarItems("blade-2")).toHaveLength(1);
    expect(service.isToolbarItemRegistered("a")).toBe(false);
  });

  it("updates a toolbar item in-place", () => {
    const service = createToolbarService();

    service.registerToolbarItem({ id: "btn", title: "Old" } as any, "blade-1");
    service.updateToolbarItem({ id: "btn", bladeId: "blade-1", toolbarItem: { title: "New" } as any });

    const items = service.getToolbarItems("blade-1");
    expect(items[0].title).toBe("New");
  });
});

describe("toolbar-service preregistration", () => {
  let registerToolbarItem: typeof import("@core/services/toolbar-service").registerToolbarItem;
  let createService: typeof import("@core/services/toolbar-service").createToolbarService;
  let toolbarBus: typeof import("@core/services/toolbar-service").toolbarBus;

  beforeAll(async () => {
    vi.resetModules();
    const mod = await import("@core/services/toolbar-service");
    registerToolbarItem = mod.registerToolbarItem;
    createService = mod.createToolbarService;
    toolbarBus = mod.toolbarBus;
  });

  it("preregistration deduplicates by bladeId::itemId key", () => {
    registerToolbarItem({ id: "pre", title: "V1" } as any, "blade-1");
    registerToolbarItem({ id: "pre", title: "V2" } as any, "blade-1");

    const service = createService();
    const items = service.getToolbarItems("blade-1");
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("V2");
  });

  it("disposes service instance via bus", () => {
    const service = createService();

    expect(toolbarBus.instanceCount).toBeGreaterThanOrEqual(1);
    toolbarBus.dispose(service);
  });
});

describe("widget-service", () => {
  it("keeps widget in other blade after unregister from one blade", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "duplicate", component: {} as any }, "blade-a");
    service.registerWidget({ id: "duplicate", component: {} as any }, "blade-b");

    service.unregisterWidget("duplicate", "blade-a");

    expect(service.getWidgets("blade-a")).toHaveLength(0);
    expect(service.getWidgets("blade-b")).toHaveLength(1);
  });

  it("returns a copy from getWidgets to prevent external mutations", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "widget-1", component: {} as any }, "blade-a");

    const widgets = service.getWidgets("blade-a");
    widgets.push({ id: "fake", component: {} as any });

    expect(service.getWidgets("blade-a")).toHaveLength(1);
  });

  it("registers and retrieves widgets by blade", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any }, "blade-1");
    service.registerWidget({ id: "w2", component: {} as any }, "blade-1");

    expect(service.getWidgets("blade-1")).toHaveLength(2);
    expect(service.getWidgets("blade-2")).toHaveLength(0);
  });

  it("unregisters all widgets for a blade individually", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any }, "blade-1");
    service.registerWidget({ id: "w2", component: {} as any }, "blade-1");
    service.unregisterWidget("w1", "blade-1");
    service.unregisterWidget("w2", "blade-1");

    expect(service.getWidgets("blade-1")).toHaveLength(0);
  });

  it("updates a widget in-place", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any, title: "Old" }, "blade-1");
    service.updateWidget({ id: "w1", bladeId: "blade-1", widget: { title: "New" } });

    expect(service.getWidgets("blade-1")[0].title).toBe("New");
  });

  it("cloneWidget returns a deep copy of a widget", () => {
    const widget = {
      id: "w1",
      component: {} as any,
      config: {
        requiredData: ["userId"],
        optionalData: ["role"],
        fieldMapping: { userId: "currentUserId" },
      },
    };

    const cloned = cloneWidget(widget);
    expect(cloned).toEqual(widget);
    expect(cloned).not.toBe(widget);
    expect(cloned.config).not.toBe(widget.config);
  });
});

describe("widget-service preregistration", () => {
  let registerWidget: typeof import("@core/services/widget-service").registerWidget;
  let createService: typeof import("@core/services/widget-service").createWidgetService;
  let widgetBus: typeof import("@core/services/widget-service").widgetBus;

  beforeAll(async () => {
    vi.resetModules();
    const mod = await import("@core/services/widget-service");
    registerWidget = mod.registerWidget;
    createService = mod.createWidgetService;
    widgetBus = mod.widgetBus;
  });

  it("preregistration deduplicates by bladeId::widgetId key", () => {
    registerWidget({ id: "pre", component: {} as any, title: "V1" }, "blade-1");
    registerWidget({ id: "pre", component: {} as any, title: "V2" }, "blade-1");

    const service = createService();
    const widgets = service.getWidgets("blade-1");
    expect(widgets).toHaveLength(1);
    expect(widgets[0].title).toBe("V2");
  });

  it("disposes service instance via bus", () => {
    const service = createService();

    expect(widgetBus.instanceCount).toBeGreaterThanOrEqual(1);
    widgetBus.dispose(service);
  });
});
