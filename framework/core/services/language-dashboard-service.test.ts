import { describe, it, expect, vi } from "vitest";

async function loadLanguageServiceModule() {
  vi.resetModules();
  return import("./language-service");
}

async function loadDashboardServiceModule() {
  vi.resetModules();
  return import("./dashboard-service");
}

describe("language-service", () => {
  it("resolves unknown locales to 'en'", async () => {
    const { createLanguageService } = await loadLanguageServiceModule();
    localStorage.removeItem("VC_LANGUAGE_SETTINGS");
    const service = createLanguageService();

    expect(service.resolveCamelCaseLocale("zzZZ")).toBe("en");
  });

  it("falls back to a supported locale in setLocale", async () => {
    const { createLanguageService } = await loadLanguageServiceModule();
    localStorage.removeItem("VC_LANGUAGE_SETTINGS");
    const service = createLanguageService();

    service.setLocale("zzZZ");

    expect(service.currentLocale.value).toBe("en");
  });
});

describe("dashboard-service", () => {
  it("works without implicit composable dependencies and supports injected access checks", async () => {
    const { createDashboardService } = await loadDashboardServiceModule();

    const permissiveService = createDashboardService();
    permissiveService.registerWidget({
      id: "widget-1",
      name: "Widget 1",
      component: {} as any,
      size: { width: 1, height: 1 },
      permissions: ["can-read"],
    });

    expect(permissiveService.getWidgets()).toHaveLength(1);

    const restrictiveService = createDashboardService({ hasAccess: () => false });
    restrictiveService.registerWidget({
      id: "widget-2",
      name: "Widget 2",
      component: {} as any,
      size: { width: 1, height: 1 },
      permissions: ["can-read"],
    });

    expect(restrictiveService.getWidgets()).toHaveLength(0);
  });

  it("returns a copy of layout map from getLayout", async () => {
    const { createDashboardService } = await loadDashboardServiceModule();
    const service = createDashboardService();

    service.registerWidget({
      id: "widget-1",
      name: "Widget 1",
      component: {} as any,
      size: { width: 1, height: 1 },
      position: { x: 0, y: 0 },
    });

    const layout = service.getLayout() as Map<string, { x: number; y: number }>;
    layout.set("external-mutation", { x: 100, y: 100 });

    expect(service.getLayout().has("external-mutation")).toBe(false);
  });

  it("throws on duplicate widget ID", async () => {
    const { createDashboardService } = await loadDashboardServiceModule();
    const service = createDashboardService();

    service.registerWidget({
      id: "dup",
      name: "First",
      component: {} as any,
      size: { width: 1, height: 1 },
    });

    expect(() =>
      service.registerWidget({
        id: "dup",
        name: "Second",
        component: {} as any,
        size: { width: 1, height: 1 },
      }),
    ).toThrow("Widget with id dup already registered");
  });

  it("updates widget position", async () => {
    const { createDashboardService } = await loadDashboardServiceModule();
    const service = createDashboardService();

    service.registerWidget({
      id: "w1",
      name: "Widget",
      component: {} as any,
      size: { width: 1, height: 1 },
      position: { x: 0, y: 0 },
    });

    service.updateWidgetPosition("w1", { x: 5, y: 10 });
    const layout = service.getLayout();
    expect(layout.get("w1")).toEqual({ x: 5, y: 10 });
  });

  it("throws on updating position for non-existent widget", async () => {
    const { createDashboardService } = await loadDashboardServiceModule();
    const service = createDashboardService();

    expect(() => service.updateWidgetPosition("nonexistent", { x: 0, y: 0 })).toThrow(
      "Widget with id nonexistent not found",
    );
  });

  it("preregistration deduplicates by widget id", async () => {
    const { registerDashboardWidget, createDashboardService } = await loadDashboardServiceModule();

    registerDashboardWidget({
      id: "pre-w",
      name: "V1",
      component: {} as any,
      size: { width: 1, height: 1 },
    });
    registerDashboardWidget({
      id: "pre-w",
      name: "V2",
      component: {} as any,
      size: { width: 1, height: 1 },
    });

    const service = createDashboardService();
    // Bus deduplicates preregistered items, so only V2 is replayed
    expect(service.getWidgets()).toHaveLength(1);
    expect(service.getWidgets()[0].name).toBe("V2");
  });

  it("disposes service instance via bus", async () => {
    const { createDashboardService, dashboardBus } = await loadDashboardServiceModule();
    const service = createDashboardService();

    expect(dashboardBus.instanceCount).toBe(1);
    dashboardBus.dispose(service);
    expect(dashboardBus.instanceCount).toBe(0);
  });

  it("filters widgets by permissions", async () => {
    const { createDashboardService } = await loadDashboardServiceModule();

    const service = createDashboardService({
      hasAccess: (perms) => perms?.includes("admin") ?? false,
    });

    service.registerWidget({
      id: "admin-widget",
      name: "Admin Only",
      component: {} as any,
      size: { width: 1, height: 1 },
      permissions: ["admin"],
    });

    service.registerWidget({
      id: "public-widget",
      name: "Public",
      component: {} as any,
      size: { width: 1, height: 1 },
    });

    const widgets = service.getWidgets();
    expect(widgets).toHaveLength(2);
    expect(widgets.map((w) => w.id)).toContain("admin-widget");
    expect(widgets.map((w) => w.id)).toContain("public-widget");
  });
});
