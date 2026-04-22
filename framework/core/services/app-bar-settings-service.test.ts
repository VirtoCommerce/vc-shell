import { describe, it, expect, vi, beforeAll } from "vitest";
import { createAppBarWidgetService } from "@core/services/app-bar-menu-service";
import { createSettingsMenuService } from "@core/services/settings-menu-service";

describe("app-bar-menu-service", () => {
  it("keeps widget collections isolated across service instances", () => {
    const firstService = createAppBarWidgetService();
    const secondService = createAppBarWidgetService();

    firstService.register({ id: "widget-1", icon: "lucide-home" });

    expect(firstService.items.value).toHaveLength(1);
    expect(secondService.items.value).toHaveLength(0);
  });

  it("registers and unregisters widgets", () => {
    const service = createAppBarWidgetService();

    const id = service.register({ id: "w1", icon: "icon-1" });
    expect(service.items.value).toHaveLength(1);

    service.unregister(id);
    expect(service.items.value).toHaveLength(0);
  });

  it("sorts items by order", () => {
    const service = createAppBarWidgetService();

    service.register({ id: "b", order: 2, icon: "icon-b" });
    service.register({ id: "a", order: 1, icon: "icon-a" });
    service.register({ id: "c", order: 3, icon: "icon-c" });

    expect(service.items.value.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("auto-generates id if not provided", () => {
    const service = createAppBarWidgetService();

    const id = service.register({ icon: "icon-1" });
    expect(id).toBeTruthy();
    expect(service.items.value).toHaveLength(1);
  });

  it("stores widget title and search terms", () => {
    const service = createAppBarWidgetService();

    service.register({
      id: "notifications",
      icon: "lucide-bell",
      title: "Notifications",
      searchTerms: ["alerts", "inbox"],
    });

    expect(service.items.value[0].title).toBe("Notifications");
    expect(service.items.value[0].searchTerms).toEqual(["alerts", "inbox"]);
  });

  describe("preregistration deduplicates", () => {
    let addAppBarWidget: typeof import("@core/services/app-bar-menu-service").addAppBarWidget;
    let createService: typeof import("@core/services/app-bar-menu-service").createAppBarWidgetService;

    beforeAll(async () => {
      vi.resetModules();
      const mod = await import("@core/services/app-bar-menu-service");
      addAppBarWidget = mod.addAppBarWidget;
      createService = mod.createAppBarWidgetService;
    });

    it("preregistration deduplicates items with same id", () => {
      addAppBarWidget({ id: "pre-widget", icon: "v1" });
      addAppBarWidget({ id: "pre-widget", icon: "v2" });

      const service = createService();
      expect(service.items.value).toHaveLength(1);
      expect(service.items.value[0].icon).toBe("v2");
    });
  });

  describe("preregistration live-broadcasts", () => {
    let addAppBarWidget: typeof import("@core/services/app-bar-menu-service").addAppBarWidget;
    let createService: typeof import("@core/services/app-bar-menu-service").createAppBarWidgetService;

    beforeAll(async () => {
      vi.resetModules();
      const mod = await import("@core/services/app-bar-menu-service");
      addAppBarWidget = mod.addAppBarWidget;
      createService = mod.createAppBarWidgetService;
    });

    it("live-broadcasts to existing services when preregistering", () => {
      const service = createService();
      addAppBarWidget({ id: "late-widget", icon: "late-icon" });

      expect(service.items.value).toHaveLength(1);
    });
  });

  describe("preregistration dispose", () => {
    let appBarWidgetBus: typeof import("@core/services/app-bar-menu-service").appBarWidgetBus;
    let createService: typeof import("@core/services/app-bar-menu-service").createAppBarWidgetService;

    beforeAll(async () => {
      vi.resetModules();
      const mod = await import("@core/services/app-bar-menu-service");
      appBarWidgetBus = mod.appBarWidgetBus;
      createService = mod.createAppBarWidgetService;
    });

    it("disposes service instance via bus", () => {
      const service = createService();

      expect(appBarWidgetBus.instanceCount).toBe(1);
      appBarWidgetBus.dispose(service);
      expect(appBarWidgetBus.instanceCount).toBe(0);
    });
  });
});

describe("settings-menu-service", () => {
  it("keeps menu items isolated across service instances", () => {
    const firstService = createSettingsMenuService();
    const secondService = createSettingsMenuService();

    firstService.register({ id: "settings-1", component: {} as any });

    expect(firstService.items.value).toHaveLength(1);
    expect(secondService.items.value).toHaveLength(0);
  });

  it("registers and unregisters items", () => {
    const service = createSettingsMenuService();

    const id = service.register({ id: "s1", component: {} as any });
    expect(service.items.value).toHaveLength(1);

    service.unregister(id);
    expect(service.items.value).toHaveLength(0);
  });

  it("sorts items by order", () => {
    const service = createSettingsMenuService();

    service.register({ id: "b", order: 2, component: {} as any });
    service.register({ id: "a", order: 1, component: {} as any });

    expect(service.items.value.map((i) => i.id)).toEqual(["a", "b"]);
  });

  describe("preregistration deduplicates", () => {
    let addSettingsMenuItem: typeof import("@core/services/settings-menu-service").addSettingsMenuItem;
    let createService: typeof import("@core/services/settings-menu-service").createSettingsMenuService;

    beforeAll(async () => {
      vi.resetModules();
      const mod = await import("@core/services/settings-menu-service");
      addSettingsMenuItem = mod.addSettingsMenuItem;
      createService = mod.createSettingsMenuService;
    });

    it("preregistration deduplicates items with same id", () => {
      addSettingsMenuItem({ id: "pre-s", component: {} as any, order: 1 });
      addSettingsMenuItem({ id: "pre-s", component: {} as any, order: 2 });

      const service = createService();
      expect(service.items.value).toHaveLength(1);
      expect(service.items.value[0].order).toBe(2);
    });
  });

  describe("preregistration dispose", () => {
    let settingsMenuBus: typeof import("@core/services/settings-menu-service").settingsMenuBus;
    let createService: typeof import("@core/services/settings-menu-service").createSettingsMenuService;

    beforeAll(async () => {
      vi.resetModules();
      const mod = await import("@core/services/settings-menu-service");
      settingsMenuBus = mod.settingsMenuBus;
      createService = mod.createSettingsMenuService;
    });

    it("disposes service instance via bus", () => {
      const service = createService();

      expect(settingsMenuBus.instanceCount).toBe(1);
      settingsMenuBus.dispose(service);
      expect(settingsMenuBus.instanceCount).toBe(0);
    });
  });
});
