import { describe, it, expect, vi, beforeAll } from "vitest";
import { createMenuService } from "@core/services/menu-service";

describe("menu-service", () => {
  it("removes item from source state and does not re-add it after rebuild", () => {
    const service = createMenuService();

    service.addMenuItem({ title: "A", priority: 1, url: "/a" } as any);
    service.addMenuItem({ title: "B", priority: 2, url: "/b" } as any);

    const firstItem = service.menuItems.value[0];
    service.removeMenuItem(firstItem);
    service.addMenuItem({ title: "C", priority: 3, url: "/c" } as any);

    expect(service.menuItems.value.map((item) => item.title)).toEqual(["B", "C"]);
  });

  it("keeps runtime state isolated between service instances", () => {
    const firstService = createMenuService();
    const secondService = createMenuService();

    firstService.addMenuItem({ title: "OnlyFirst", priority: 1, url: "/first" } as any);

    expect(firstService.menuItems.value).toHaveLength(1);
    expect(secondService.menuItems.value).toHaveLength(0);
  });

  it("groups items by group property", () => {
    const service = createMenuService();

    service.addMenuItem({ title: "Item A", priority: 1, group: "Settings", groupIcon: "fas fa-cog" } as any);
    service.addMenuItem({ title: "Item B", priority: 2, group: "Settings", groupIcon: "fas fa-cog" } as any);

    expect(service.menuItems.value).toHaveLength(1);
    expect(service.menuItems.value[0].children).toHaveLength(2);
    expect(service.menuItems.value[0].title).toBe("Settings");
  });

  it("groups items by groupConfig", () => {
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

  it("sorts items by priority", () => {
    const service = createMenuService();

    service.addMenuItem({ title: "Z", priority: 3, url: "/z" } as any);
    service.addMenuItem({ title: "A", priority: 1, url: "/a" } as any);
    service.addMenuItem({ title: "M", priority: 2, url: "/m" } as any);

    expect(service.menuItems.value.map((i) => i.title)).toEqual(["A", "M", "Z"]);
  });

  describe("identity and deduplication", () => {
    it("removeMenuItem matches finalized item from menuItems.value against raw storage", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "A", priority: 1, url: "/a" } as any);
      service.addMenuItem({ title: "B", priority: 2, url: "/b" } as any);

      const firstItem = service.menuItems.value[0];
      service.removeMenuItem(firstItem);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("B");
    });

    it("removeMenuItem matches by id when both items have explicit id", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "A", priority: 1, id: 10, url: "/a" } as any);
      service.addMenuItem({ title: "B", priority: 2, id: 20, url: "/b" } as any);

      service.removeMenuItem({ id: 10 } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("B");
    });

    it("removeMenuItem matches by url when both items have url (no routeId)", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "Orders", priority: 1, url: "/orders" } as any);
      service.addMenuItem({ title: "Products", priority: 2, url: "/products" } as any);

      service.removeMenuItem({ url: "/orders" } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("Products");
    });

    it("removeMenuItem matches by routeId", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "Orders", priority: 1, url: "/orders", routeId: "Orders" } as any);
      service.addMenuItem({ title: "Products", priority: 2, url: "/products", routeId: "Products" } as any);

      service.removeMenuItem({ routeId: "Orders" } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("Products");
    });

    it("group children with identical routeId+url are deduplicated (last wins)", () => {
      const service = createMenuService();

      service.addMenuItem({
        title: "Users",
        priority: 1,
        url: "/users",
        routeId: "Users",
        groupConfig: { id: "admin", title: "Admin", icon: "fas fa-shield" },
      } as any);
      service.addMenuItem({
        title: "Users Updated",
        priority: 1,
        url: "/users",
        routeId: "Users",
        groupConfig: { id: "admin", title: "Admin" },
      } as any);

      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].children).toHaveLength(1);
      expect(service.menuItems.value[0].children![0].title).toBe("Users Updated");
    });

    it("identity is symmetric — determined by highest-priority field on each item independently", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "Page", priority: 1, url: "/page", routeId: "PageRoute" } as any);

      // Removing by url alone won't match — stored item's identity is route:PageRoute, not url:/page
      service.removeMenuItem({ url: "/page" } as any);
      expect(service.menuItems.value).toHaveLength(1); // still there

      // Removing by routeId matches
      service.removeMenuItem({ routeId: "PageRoute" } as any);
      expect(service.menuItems.value).toHaveLength(0);
    });

    it("finalized items without explicit id have id undefined", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "Orders", priority: 1, url: "/orders", routeId: "Orders" } as any);

      const item = service.menuItems.value[0];
      expect(item.id).toBeUndefined();
      expect(item.routeId).toBe("Orders");
      expect(item.url).toBe("/orders");
      expect(item.title).toBe("Orders");
    });

    it("groupConfig updates group properties on second registration", () => {
      const service = createMenuService();

      service.addMenuItem({
        title: "Item A",
        priority: 1,
        url: "/a",
        routeId: "A",
        groupConfig: { id: "grp", title: "Old Title", icon: "old-icon", priority: 10 },
      } as any);
      service.addMenuItem({
        title: "Item B",
        priority: 2,
        url: "/b",
        routeId: "B",
        groupConfig: { id: "grp", title: "New Title", icon: "new-icon", priority: 5 },
      } as any);

      const group = service.menuItems.value[0];
      expect(group.title).toBe("New Title");
      expect(group.groupIcon).toBe("new-icon");
      expect(group.priority).toBe(5);
      expect(group.children).toHaveLength(2);
    });

    it("standalone items with same routeId but different url are deduplicated (last wins)", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "V1", priority: 1, url: "/old-path", routeId: "Orders" } as any);
      service.addMenuItem({ title: "V2", priority: 2, url: "/new-path", routeId: "Orders" } as any);

      // routeId is highest-priority identity field on both items
      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].title).toBe("V2");
      expect(service.menuItems.value[0].url).toBe("/new-path");
    });

    it("standalone items with same url but different routeId coexist", () => {
      const service = createMenuService();

      service.addMenuItem({ title: "PageA", priority: 1, url: "/shared", routeId: "RouteA" } as any);
      service.addMenuItem({ title: "PageB", priority: 2, url: "/shared", routeId: "RouteB" } as any);

      // routeId is compared before url when both routeId are present
      expect(service.menuItems.value).toHaveLength(2);
    });
  });
});

describe("menu-service badges", () => {
  let setMenuBadge: typeof import("@core/services/menu-service").setMenuBadge;
  let getMenuBadge: typeof import("@core/services/menu-service").getMenuBadge;
  let removeMenuBadge: typeof import("@core/services/menu-service").removeMenuBadge;
  let getMenuBadges: typeof import("@core/services/menu-service").getMenuBadges;
  let createService: typeof import("@core/services/menu-service").createMenuService;

  beforeAll(async () => {
    vi.resetModules();
    const mod = await import("@core/services/menu-service");
    setMenuBadge = mod.setMenuBadge;
    getMenuBadge = mod.getMenuBadge;
    removeMenuBadge = mod.removeMenuBadge;
    getMenuBadges = mod.getMenuBadges;
    createService = mod.createMenuService;
  });

  it("badge system: set, get, remove", () => {
    const service = createService();

    setMenuBadge("route-1", 5);
    expect(getMenuBadge("route-1")).toBe(5);
    expect(service.menuBadges.value.get("route-1")).toBe(5);

    removeMenuBadge("route-1");
    expect(getMenuBadge("route-1")).toBeUndefined();

    const badges = getMenuBadges();
    expect(badges.value.size).toBe(0);
  });

  it("badge getMenuBadge falls back to preregistered badges when no service exists", () => {
    setMenuBadge("early-badge", 42);
    expect(getMenuBadge("early-badge")).toBe(42);
  });
});

describe("menu-service preregistration", () => {
  let addMenuItem: typeof import("@core/services/menu-service").addMenuItem;
  let createService: typeof import("@core/services/menu-service").createMenuService;

  beforeAll(async () => {
    vi.resetModules();
    const mod = await import("@core/services/menu-service");
    addMenuItem = mod.addMenuItem;
    createService = mod.createMenuService;
  });

  it("preregistration deduplicates items", () => {
    addMenuItem({ title: "Dup", priority: 1, url: "/dup" } as any);
    addMenuItem({ title: "Dup", priority: 1, url: "/dup" } as any);

    const service = createService();
    expect(service.menuItems.value).toHaveLength(1);
  });

  it("disposes service instance via bus", async () => {
    vi.resetModules();
    const mod = await import("@core/services/menu-service");
    const service = mod.createMenuService();

    expect(mod.menuServiceBus.instanceCount).toBe(1);
    mod.menuServiceBus.dispose(service);
    expect(mod.menuServiceBus.instanceCount).toBe(0);
  });

  describe("removeRegisteredMenuItem", () => {
    it("cleans bus store so replay does not resurrect item", async () => {
      vi.resetModules();
      const mod = await import("@core/services/menu-service");

      mod.addMenuItem({ title: "Temp", priority: 1, url: "/temp" } as any);
      mod.removeRegisteredMenuItem({ url: "/temp" } as any);

      const service = mod.createMenuService();
      expect(service.menuItems.value).toHaveLength(0);
    });

    it("propagates removal to live service instances", async () => {
      vi.resetModules();
      const mod = await import("@core/services/menu-service");

      mod.addMenuItem({ title: "Live", priority: 1, url: "/live", routeId: "Live" } as any);
      const service = mod.createMenuService();
      expect(service.menuItems.value).toHaveLength(1);

      mod.removeRegisteredMenuItem({ routeId: "Live" } as any);
      expect(service.menuItems.value).toHaveLength(0);
    });

    it("removes grouped item from bus store without affecting siblings", async () => {
      vi.resetModules();
      const mod = await import("@core/services/menu-service");

      mod.addMenuItem({
        title: "Users",
        priority: 1,
        url: "/users",
        routeId: "Users",
        groupConfig: { id: "admin", title: "Admin", icon: "fas fa-shield" },
      } as any);
      mod.addMenuItem({
        title: "Roles",
        priority: 2,
        url: "/roles",
        routeId: "Roles",
        groupConfig: { id: "admin", title: "Admin" },
      } as any);

      mod.removeRegisteredMenuItem({ routeId: "Users" } as any);

      const service = mod.createMenuService();
      expect(service.menuItems.value).toHaveLength(1);
      expect(service.menuItems.value[0].children).toHaveLength(1);
      expect(service.menuItems.value[0].children![0].title).toBe("Roles");
    });
  });
});
