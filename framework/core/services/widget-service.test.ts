import { describe, it, expect, vi } from "vitest";

async function loadWidgetServiceModule() {
  vi.resetModules();
  return import("@core/services/widget-service");
}

describe("widget-service: trigger contract", () => {
  it("accepts a widget with trigger and stores it", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    const onRefresh = vi.fn();
    const onClick = vi.fn();

    service.registerWidget(
      {
        id: "trigger-widget",
        component: {} as any,
        title: "Test",
        trigger: {
          icon: "lucide-box",
          title: "Test Widget",
          onRefresh,
          onClick,
        },
      },
      "blade-1",
    );

    const widgets = service.getWidgets("blade-1");
    expect(widgets).toHaveLength(1);
    expect(widgets[0].trigger).toBeDefined();
    expect(widgets[0].trigger?.icon).toBe("lucide-box");
  });
});

describe("widget-service: setActiveWidget", () => {
  it("accepts trigger-only call (no exposed)", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    // Should not throw when called without exposed
    service.setActiveWidget({ widgetId: "my-widget" });
    expect(service.isActiveWidget("my-widget")).toBe(true);
  });

  it("accepts legacy call with exposed", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    const exposed = { updateActiveWidgetCount: vi.fn() };
    service.setActiveWidget({ widgetId: "legacy-widget", exposed });
    expect(service.isActiveWidget("legacy-widget")).toBe(true);
  });
});

describe("widget-service: updateActiveWidget", () => {
  it("calls trigger.onRefresh when available (priority over exposed)", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    const onRefresh = vi.fn();
    const exposedFn = vi.fn();

    service.registerWidget(
      {
        id: "hybrid-widget",
        component: {} as any,
        updateFunctionName: "refresh",
        trigger: { onRefresh },
      },
      "blade-1",
    );

    // Set active with exposed that also has the function
    service.setActiveWidget({
      widgetId: "hybrid-widget",
      exposed: { refresh: exposedFn },
    });

    service.updateActiveWidget();

    expect(onRefresh).toHaveBeenCalledOnce();
    expect(exposedFn).not.toHaveBeenCalled();
  });

  it("falls back to exposed when no trigger.onRefresh", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    const exposedFn = vi.fn();

    service.registerWidget(
      {
        id: "legacy-widget",
        component: {} as any,
        updateFunctionName: "updateCount",
      },
      "blade-1",
    );

    service.setActiveWidget({
      widgetId: "legacy-widget",
      exposed: { updateCount: exposedFn },
    });

    service.updateActiveWidget();

    expect(exposedFn).toHaveBeenCalledOnce();
  });

  it("works with trigger-only (no exposed at all)", async () => {
    const { createWidgetService } = await loadWidgetServiceModule();
    const service = createWidgetService();

    const onRefresh = vi.fn();

    service.registerWidget(
      {
        id: "trigger-only",
        component: {} as any,
        trigger: { onRefresh },
      },
      "blade-1",
    );

    service.setActiveWidget({ widgetId: "trigger-only" });
    service.updateActiveWidget();

    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
