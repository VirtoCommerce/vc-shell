import { describe, it, expect, vi } from "vitest";

async function loadModule() {
  vi.resetModules();
  return import("@core/services/settings-menu-service");
}

describe("createSettingsMenuService", () => {
  it("registers and lists items", async () => {
    const { createSettingsMenuService } = await loadModule();
    const svc = createSettingsMenuService();
    svc.register({ id: "theme", component: {} as any });
    expect(svc.items.value).toHaveLength(1);
    expect(svc.items.value[0].id).toBe("theme");
  });

  it("unregisters items", async () => {
    const { createSettingsMenuService } = await loadModule();
    const svc = createSettingsMenuService();
    svc.register({ id: "lang", component: {} as any });
    svc.unregister("lang");
    expect(svc.items.value).toHaveLength(0);
  });

  it("sorts by order", async () => {
    const { createSettingsMenuService } = await loadModule();
    const svc = createSettingsMenuService();
    svc.register({ id: "b", order: 2, component: {} as any });
    svc.register({ id: "a", order: 1, component: {} as any });
    expect(svc.items.value[0].id).toBe("a");
    expect(svc.items.value[1].id).toBe("b");
  });
});
