import { describe, it, expect, vi } from "vitest";
import { createWidgetService } from "@core/services/widget-service";

describe("widget-service: trigger contract", () => {
  it("accepts a widget with trigger and stores it", () => {
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

describe("widget-service: register and retrieve", () => {
  it("registers a widget and retrieves it by blade", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "my-widget", component: {} as any, title: "My Widget" }, "blade-1");

    const widgets = service.getWidgets("blade-1");
    expect(widgets).toHaveLength(1);
    expect(widgets[0].id).toBe("my-widget");
  });

  it("unregisters a widget from a blade", () => {
    const service = createWidgetService();

    service.registerWidget({ id: "w1", component: {} as any }, "blade-1");
    service.unregisterWidget("w1", "blade-1");

    expect(service.getWidgets("blade-1")).toHaveLength(0);
  });
});

describe("widget-service: updateWidget", () => {
  it("updates trigger.onRefresh on a registered widget", () => {
    const service = createWidgetService();

    const onRefresh = vi.fn();

    service.registerWidget(
      {
        id: "hybrid-widget",
        component: {} as any,
        updateFunctionName: "refresh",
        trigger: { onRefresh },
      },
      "blade-1",
    );

    const widgets = service.getWidgets("blade-1");
    expect(widgets[0].trigger?.onRefresh).toBe(onRefresh);

    widgets[0].trigger?.onRefresh?.();
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("updates widget properties via updateWidget", () => {
    const service = createWidgetService();

    service.registerWidget(
      {
        id: "legacy-widget",
        component: {} as any,
        title: "Old Title",
      },
      "blade-1",
    );

    service.updateWidget({ id: "legacy-widget", bladeId: "blade-1", widget: { title: "New Title" } });

    const widgets = service.getWidgets("blade-1");
    expect(widgets[0].title).toBe("New Title");
  });

  it("stores trigger with onRefresh on a widget", () => {
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

    const widgets = service.getWidgets("blade-1");
    expect(widgets).toHaveLength(1);
    expect(widgets[0].trigger?.onRefresh).toBe(onRefresh);
  });
});
