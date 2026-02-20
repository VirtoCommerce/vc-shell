import { describe, it, expect, vi } from "vitest";

async function loadToolbarServiceModule() {
  vi.resetModules();
  return import("@core/services/toolbar-service");
}

async function loadWidgetServiceModule() {
  vi.resetModules();
  return import("@core/services/widget-service");
}

describe("toolbar-service", () => {
  it("keeps registration flag true while the same id is still registered in another blade", async () => {
    const { createToolbarService } = await loadToolbarServiceModule();
    const service = createToolbarService();

    service.registerToolbarItem({ id: "duplicate" } as any, "blade-a");
    service.registerToolbarItem({ id: "duplicate" } as any, "blade-b");

    service.unregisterToolbarItem("duplicate", "blade-a");

    expect(service.getToolbarItems("blade-b")).toHaveLength(1);
    expect(service.isToolbarItemRegistered("duplicate")).toBe(true);
  });

  it("registers and retrieves toolbar items by blade", async () => {
    const { createToolbarService } = await loadToolbarServiceModule();
    const service = createToolbarService();

    service.registerToolbarItem({ id: "btn-1", title: "Save" } as any, "blade-1");
    service.registerToolbarItem({ id: "btn-2", title: "Delete" } as any, "blade-1");

    const items = service.getToolbarItems("blade-1");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toEqual(["btn-1", "btn-2"]);
  });

  it("merges global * items into blade-specific items", async () => {
    const { createToolbarService } = await loadToolbarServiceModule();
    const service = createToolbarService();

    service.registerToolbarItem({ id: "global-btn" } as any, "*");
    service.registerToolbarItem({ id: "blade-btn" } as any, "blade-1");

    const items = service.getToolbarItems("blade-1");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toContain("global-btn");
    expect(items.map((i) => i.id)).toContain("blade-btn");
  });

  it("does not duplicate global items when blade has same id", async () => {
    const { createToolbarService } = await loadToolbarServiceModule();
    const service = createToolbarService();

    service.registerToolbarItem({ id: "shared" } as any, "*");
    service.registerToolbarItem({ id: "shared" } as any, "blade-1");

    expect(service.getToolbarItems("blade-1")).toHaveLength(1);
  });

  it("clears all items for a blade", async () => {
    const { createToolbarService } = await loadToolbarServiceModule();
    const service = createToolbarService();

    service.registerToolbarItem({ id: "a" } as any, "blade-1");
    service.registerToolbarItem({ id: "b" } as any, "blade-1");
    service.registerToolbarItem({ id: "c" } as any, "blade-2");

    service.clearBladeToolbarItems("blade-1");

    expect(service.getToolbarItems("blade-1")).toHaveLength(0);
    expect(service.getToolbarItems("blade-2")).toHaveLength(1);
    expect(service.isToolbarItemRegistered("a")).toBe(false);
  });

  it("updates a toolbar item in-place", async () => {
    const { createToolbarService } = await loadToolbarServiceModule();
    const service = createToolbarService();

    service.registerToolbarItem({ id: "btn", title: "Old" } as any, "blade-1");
    service.updateToolbarItem({ id: "btn", bladeId: "blade-1", toolbarItem: { title: "New" } as any });

    const items = service.getToolbarItems("blade-1");
    expect(items[0].title).toBe("New");
  });

  it("preregistration deduplicates by bladeId::itemId key", async () => {
    const { registerToolbarItem, createToolbarService } = await loadToolbarServiceModule();

    registerToolbarItem({ id: "pre", title: "V1" } as any, "blade-1");
    registerToolbarItem({ id: "pre", title: "V2" } as any, "blade-1");

    const service = createToolbarService();
    const items = service.getToolbarItems("blade-1");
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("V2");
  });

  it("disposes service instance via bus", async () => {
    const { createToolbarService, toolbarBus } = await loadToolbarServiceModule();
    const service = createToolbarService();

    expect(toolbarBus.instanceCount).toBe(1);
    toolbarBus.dispose(service);
    expect(toolbarBus.instanceCount).toBe(0);
  });
});

describe("widget-service", () => {
  it("keeps registration flag true while the same id is still registered in another blade", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    service.registerWidget({ id: "duplicate", component: {} as any }, "blade-a");
    service.registerWidget({ id: "duplicate", component: {} as any }, "blade-b");

    service.unregisterWidget("duplicate", "blade-a");

    expect(service.getWidgets("blade-b")).toHaveLength(1);
    expect(service.isWidgetRegistered("duplicate")).toBe(true);
  });

  it("returns a copy from getWidgets to prevent external mutations", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    service.registerWidget({ id: "widget-1", component: {} as any }, "blade-a");

    const widgets = service.getWidgets("blade-a");
    widgets.push({ id: "fake", component: {} as any });

    expect(service.getWidgets("blade-a")).toHaveLength(1);
  });

  it("registers and retrieves widgets by blade", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any }, "blade-1");
    service.registerWidget({ id: "w2", component: {} as any }, "blade-1");

    expect(service.getWidgets("blade-1")).toHaveLength(2);
    expect(service.getWidgets("blade-2")).toHaveLength(0);
  });

  it("clears all widgets for a blade", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any }, "blade-1");
    service.registerWidget({ id: "w2", component: {} as any }, "blade-1");
    service.clearBladeWidgets("blade-1");

    expect(service.getWidgets("blade-1")).toHaveLength(0);
    expect(service.isWidgetRegistered("w1")).toBe(false);
  });

  it("updates a widget in-place", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any, title: "Old" }, "blade-1");
    service.updateWidget({ id: "w1", bladeId: "blade-1", widget: { title: "New" } });

    expect(service.getWidgets("blade-1")[0].title).toBe("New");
  });

  it("resolves widget props from blade data", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    const widget = {
      id: "w1",
      component: {} as any,
      config: {
        requiredData: ["userId"],
        optionalData: ["role"],
        fieldMapping: { userId: "currentUserId" },
      },
    };

    const props = service.resolveWidgetProps(widget, { currentUserId: "42", role: "admin" });
    expect(props).toEqual({ userId: "42", role: "admin" });
  });

  it("preregistration deduplicates by bladeId::widgetId key", async () => {
    const { registerWidget, createWidgetService } = await loadWidgetServiceModule();

    registerWidget({ id: "pre", component: {} as any, title: "V1" }, "blade-1");
    registerWidget({ id: "pre", component: {} as any, title: "V2" }, "blade-1");

    const service = createWidgetService();
    const widgets = service.getWidgets("blade-1");
    expect(widgets).toHaveLength(1);
    expect(widgets[0].title).toBe("V2");
  });

  it("disposes service instance via bus", async () => {
    const { createWidgetService, widgetBus } = await loadWidgetServiceModule();
    const service = createWidgetService();

    expect(widgetBus.instanceCount).toBe(1);
    widgetBus.dispose(service);
    expect(widgetBus.instanceCount).toBe(0);
  });
});
