import { describe, it, expect, vi } from "vitest";

async function loadMenuServiceModule() {
  vi.resetModules();
  return import("@core/services/menu-service");
}

describe("menu-service", () => {
  it("removes item from source state and does not re-add it after rebuild", async () => {
    const { createMenuService } = await loadMenuServiceModule();
    const service = createMenuService();

    service.addMenuItem({ title: "A", priority: 1, url: "/a" } as any);
    service.addMenuItem({ title: "B", priority: 2, url: "/b" } as any);

    const firstItem = service.menuItems.value[0];
    service.removeMenuItem(firstItem);
    service.addMenuItem({ title: "C", priority: 3, url: "/c" } as any);

    expect(service.menuItems.value.map((item) => item.title)).toEqual(["B", "C"]);
  });

  it("keeps runtime state isolated between service instances", async () => {
    const { createMenuService } = await loadMenuServiceModule();
    const firstService = createMenuService();
    const secondService = createMenuService();

    firstService.addMenuItem({ title: "OnlyFirst", priority: 1, url: "/first" } as any);

    expect(firstService.menuItems.value).toHaveLength(1);
    expect(secondService.menuItems.value).toHaveLength(0);
  });

  it("groups items by group property", async () => {
    const { createMenuService } = await loadMenuServiceModule();
    const service = createMenuService();

    service.addMenuItem({ title: "Item A", priority: 1, group: "Settings", groupIcon: "fas fa-cog" } as any);
    service.addMenuItem({ title: "Item B", priority: 2, group: "Settings", groupIcon: "fas fa-cog" } as any);

    expect(service.menuItems.value).toHaveLength(1);
    expect(service.menuItems.value[0].children).toHaveLength(2);
    expect(service.menuItems.value[0].title).toBe("Settings");
  });

  it("groups items by groupConfig", async () => {
    const { createMenuService } = await loadMenuServiceModule();
    const service = createMenuService();

    service.addMenuItem({
      title: "Sub-Item 1",
      priority: 1,
      groupConfig: { id: "admin-group", title: "Admin", icon: "fas fa-shield", priority: 1 },
    } as any);
    service.addMenuItem({
      title: "Sub-Item 2",
      priority: 2,
      groupConfig: { id: "admin-group", title: "Admin" },
    } as any);

    expect(service.menuItems.value).toHaveLength(1);
    expect(service.menuItems.value[0].children).toHaveLength(2);
    expect(service.menuItems.value[0].groupId).toBe("admin-group");
  });

  it("sorts items by priority", async () => {
    const { createMenuService } = await loadMenuServiceModule();
    const service = createMenuService();

    service.addMenuItem({ title: "Z", priority: 3, url: "/z" } as any);
    service.addMenuItem({ title: "A", priority: 1, url: "/a" } as any);
    service.addMenuItem({ title: "M", priority: 2, url: "/m" } as any);

    expect(service.menuItems.value.map((i) => i.title)).toEqual(["A", "M", "Z"]);
  });

  it("badge system: set, get, remove", async () => {
    const { createMenuService, setMenuBadge, getMenuBadge, removeMenuBadge, getMenuBadges } =
      await loadMenuServiceModule();
    const service = createMenuService();

    setMenuBadge("route-1", 5);
    expect(getMenuBadge("route-1")).toBe(5);
    expect(service.menuBadges.value.get("route-1")).toBe(5);

    removeMenuBadge("route-1");
    expect(getMenuBadge("route-1")).toBeUndefined();

    const badges = getMenuBadges();
    expect(badges.value.size).toBe(0);
  });

  it("badge getMenuBadge falls back to preregistered badges when no service exists", async () => {
    const { setMenuBadge, getMenuBadge } = await loadMenuServiceModule();

    setMenuBadge("early-badge", 42);
    expect(getMenuBadge("early-badge")).toBe(42);
  });

  it("preregistration deduplicates items", async () => {
    const { addMenuItem, createMenuService } = await loadMenuServiceModule();

    addMenuItem({ title: "Dup", priority: 1, url: "/dup" } as any);
    addMenuItem({ title: "Dup", priority: 1, url: "/dup" } as any);

    const service = createMenuService();
    expect(service.menuItems.value).toHaveLength(1);
  });

  it("disposes service instance via bus", async () => {
    const { createMenuService, menuServiceBus } = await loadMenuServiceModule();
    const service = createMenuService();

    expect(menuServiceBus.instanceCount).toBe(1);
    menuServiceBus.dispose(service);
    expect(menuServiceBus.instanceCount).toBe(0);
  });

  describe("identity and deduplication", () => {
    it("removeMenuItem matches finalized item from menuItems.value against raw storage", async () => {
      // This is the critical scenario: user gets item from menuItems.value
      // (which has been through finalizeMenuItems) and passes it to removeMenuItem.
      // Must work even though finalized item may have extra fields.
      const { createMenuService } = await loadMenuServiceModule();
      const service = createMenuService();

      service.addMenuItem({ title: "A", priority: 1, url: "/a" } as any);
      service.addMenuItem({ title: "B", priority: 2, url: "/b" } as any);

      const firstItem = service.menuItems.value[0];
      service.removeMenuItem(firstItem);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("B");
    });

    it("removeMenuItem matches by id when both items have explicit id", async () => {
      const { createMenuService } = await loadMenuServiceModule();
      const service = createMenuService();

      service.addMenuItem({ title: "A", priority: 1, id: 10, url: "/a" } as any);
      service.addMenuItem({ title: "B", priority: 2, id: 20, url: "/b" } as any);

      service.removeMenuItem({ id: 10 } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("B");
    });

    it("removeMenuItem matches by url when both items have url (no routeId)", async () => {
      const { createMenuService } = await loadMenuServiceModule();
      const service = createMenuService();

      service.addMenuItem({ title: "Orders", priority: 1, url: "/orders" } as any);
      service.addMenuItem({ title: "Products", priority: 2, url: "/products" } as any);

      service.removeMenuItem({ url: "/orders" } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("Products");
    });

    it("removeMenuItem matches by routeId", async () => {
      const { createMenuService } = await loadMenuServiceModule();
      const service = createMenuService();

      service.addMenuItem({ title: "Orders", priority: 1, url: "/orders", routeId: "Orders" } as any);
      service.addMenuItem({ title: "Products", priority: 2, url: "/products", routeId: "Products" } as any);

      service.removeMenuItem({ routeId: "Orders" } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("Products");
    });

    it("group children with identical routeId+url are deduplicated (last wins)", async () => {
      const { createMenuService } = await loadMenuServiceModule();
      const service = createMenuService();

      service.addMenuItem({
        title: "Users", priority: 1, url: "/users", routeId: "Users",
        groupConfig: { id: "admin", title: "Admin", icon: "fas fa-shield" },
      } as any);
      service.addMenuItem({
        title: "Users Updated", priority: 1, url: "/users", routeId: "Users",
        groupConfig: { id: "admin", title: "Admin" },
      } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].children).toHaveLength(1);
      expect(service.menuItems.value[0].children![0].title).toBe("Users Updated");
    });

    it("groupConfig updates group properties on second registration", async () => {
      const { createMenuService } = await loadMenuServiceModule();
      const service = createMenuService();

      service.addMenuItem({
        title: "Item A", priority: 1, url: "/a", routeId: "A",
        groupConfig: { id: "grp", title: "Old Title", icon: "old-icon", priority: 10 },
      } as any);
      service.addMenuItem({
        title: "Item B", priority: 2, url: "/b", routeId: "B",
        groupConfig: { id: "grp", title: "New Title", icon: "new-icon", priority: 5 },
      } as any);

      const group = service.menuItems.value[0];
      expect(group.title).toBe("New Title");
      expect(group.groupIcon).toBe("new-icon");
      expect(group.priority).toBe(5);
      expect(group.children).toHaveLength(2);
    });
  });
});
