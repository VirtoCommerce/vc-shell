import { describe, it, expect } from "vitest";
import { createDashboardService } from "@core/services/dashboard-service";

describe("createDashboardService", () => {
  it("registers and retrieves a widget", () => {
    const svc = createDashboardService();
    svc.registerWidget({ id: "w1", name: "W1", component: {} as any, size: { width: 2, height: 1 } });
    expect(svc.getWidgets()).toHaveLength(1);
    expect(svc.getWidgets()[0].id).toBe("w1");
  });

  it("throws on duplicate widget id", () => {
    const svc = createDashboardService();
    const w = { id: "dup", name: "D", component: {} as any, size: { width: 1, height: 1 } };
    svc.registerWidget(w);
    expect(() => svc.registerWidget(w)).toThrow();
  });

  it("filters widgets by permissions", () => {
    const svc = createDashboardService({ hasAccess: (perms) => perms?.includes("admin") ?? true });
    svc.registerWidget({ id: "pub", name: "P", component: {} as any, size: { width: 1, height: 1 } });
    svc.registerWidget({
      id: "priv",
      name: "R",
      component: {} as any,
      size: { width: 1, height: 1 },
      permissions: ["admin"],
    });
    svc.registerWidget({
      id: "denied",
      name: "D",
      component: {} as any,
      size: { width: 1, height: 1 },
      permissions: ["superuser"],
    });
    expect(svc.getWidgets()).toHaveLength(2);
  });

  it("updates widget position", () => {
    const svc = createDashboardService();
    svc.registerWidget({ id: "w1", name: "W", component: {} as any, size: { width: 1, height: 1 } });
    svc.updateWidgetPosition("w1", { x: 5, y: 10 });
    const layout = svc.getLayout();
    expect(layout.get("w1")).toEqual({ x: 5, y: 10 });
  });

  it("throws updating non-existent widget", () => {
    const svc = createDashboardService();
    expect(() => svc.updateWidgetPosition("nope", { x: 0, y: 0 })).toThrow();
  });
});
