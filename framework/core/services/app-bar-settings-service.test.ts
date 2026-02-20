import { describe, it, expect, vi } from "vitest";

async function loadAppBarMenuServiceModule() {
  vi.resetModules();
  return import("@core/services/app-bar-menu-service");
}

async function loadSettingsMenuServiceModule() {
  vi.resetModules();
  return import("@core/services/settings-menu-service");
}

describe("app-bar-menu-service", () => {
  it("keeps widget collections isolated across service instances", async () => {
    const { createAppBarWidgetService } = await loadAppBarMenuServiceModule();
    const firstService = createAppBarWidgetService();
    const secondService = createAppBarWidgetService();

    firstService.register({ id: "widget-1", icon: "material-home" });

    expect(firstService.items.value).toHaveLength(1);
    expect(secondService.items.value).toHaveLength(0);
  });

  it("registers and unregisters widgets", async () => {
    const { createAppBarWidgetService } = await loadAppBarMenuServiceModule();
    const service = createAppBarWidgetService();

    const id = service.register({ id: "w1", icon: "icon-1" });
    expect(service.items.value).toHaveLength(1);

    service.unregister(id);
    expect(service.items.value).toHaveLength(0);
  });

  it("sorts items by order", async () => {
    const { createAppBarWidgetService } = await loadAppBarMenuServiceModule();
    const service = createAppBarWidgetService();

    service.register({ id: "b", order: 2, icon: "icon-b" });
    service.register({ id: "a", order: 1, icon: "icon-a" });
    service.register({ id: "c", order: 3, icon: "icon-c" });

    expect(service.items.value.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("auto-generates id if not provided", async () => {
    const { createAppBarWidgetService } = await loadAppBarMenuServiceModule();
    const service = createAppBarWidgetService();

    const id = service.register({ icon: "icon-1" });
    expect(id).toBeTruthy();
    expect(service.items.value).toHaveLength(1);
  });

  it("stores widget title and search terms", async () => {
    const { createAppBarWidgetService } = await loadAppBarMenuServiceModule();
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

  it("preregistration deduplicates items with same id", async () => {
    const { addAppBarWidget, createAppBarWidgetService } = await loadAppBarMenuServiceModule();

    addAppBarWidget({ id: "pre-widget", icon: "v1" });
    addAppBarWidget({ id: "pre-widget", icon: "v2" });

    const service = createAppBarWidgetService();
    expect(service.items.value).toHaveLength(1);
    expect(service.items.value[0].icon).toBe("v2");
  });

  it("live-broadcasts to existing services when preregistering", async () => {
    const { addAppBarWidget, createAppBarWidgetService } = await loadAppBarMenuServiceModule();

    const service = createAppBarWidgetService();
    addAppBarWidget({ id: "late-widget", icon: "late-icon" });

    expect(service.items.value).toHaveLength(1);
  });

  it("disposes service instance via bus", async () => {
    const { createAppBarWidgetService, appBarWidgetBus } = await loadAppBarMenuServiceModule();
    const service = createAppBarWidgetService();

    expect(appBarWidgetBus.instanceCount).toBe(1);
    appBarWidgetBus.dispose(service);
    expect(appBarWidgetBus.instanceCount).toBe(0);
  });
});

describe("settings-menu-service", () => {
  it("keeps menu items isolated across service instances", async () => {
    const { createSettingsMenuService } = await loadSettingsMenuServiceModule();
    const firstService = createSettingsMenuService();
    const secondService = createSettingsMenuService();

    firstService.register({ id: "settings-1", component: {} as any });

    expect(firstService.items.value).toHaveLength(1);
    expect(secondService.items.value).toHaveLength(0);
  });

  it("registers and unregisters items", async () => {
    const { createSettingsMenuService } = await loadSettingsMenuServiceModule();
    const service = createSettingsMenuService();

    const id = service.register({ id: "s1", component: {} as any });
    expect(service.items.value).toHaveLength(1);

    service.unregister(id);
    expect(service.items.value).toHaveLength(0);
  });

  it("sorts items by order", async () => {
    const { createSettingsMenuService } = await loadSettingsMenuServiceModule();
    const service = createSettingsMenuService();

    service.register({ id: "b", order: 2, component: {} as any });
    service.register({ id: "a", order: 1, component: {} as any });

    expect(service.items.value.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("preregistration deduplicates items with same id", async () => {
    const { addSettingsMenuItem, createSettingsMenuService } = await loadSettingsMenuServiceModule();

    addSettingsMenuItem({ id: "pre-s", component: {} as any, order: 1 });
    addSettingsMenuItem({ id: "pre-s", component: {} as any, order: 2 });

    const service = createSettingsMenuService();
    expect(service.items.value).toHaveLength(1);
    expect(service.items.value[0].order).toBe(2);
  });

  it("disposes service instance via bus", async () => {
    const { createSettingsMenuService, settingsMenuBus } = await loadSettingsMenuServiceModule();
    const service = createSettingsMenuService();

    expect(settingsMenuBus.instanceCount).toBe(1);
    settingsMenuBus.dispose(service);
    expect(settingsMenuBus.instanceCount).toBe(0);
  });
});
