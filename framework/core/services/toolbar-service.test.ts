import { describe, it, expect } from "vitest";
import { createToolbarService, registerExternalToolbarItem, registerToolbarItem } from "@core/services/toolbar-service";

describe("createToolbarService", () => {
  it("registers and retrieves toolbar items for a blade", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "save", title: "Save" } as any, "blade-1");
    expect(svc.getToolbarItems("blade-1")).toHaveLength(1);
  });

  it("unregisters toolbar items", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "del", title: "Delete" } as any, "blade-1");
    svc.unregisterToolbarItem("del", "blade-1");
    expect(svc.getToolbarItems("blade-1")).toHaveLength(0);
  });

  it("clears all blade items", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "a" } as any, "blade-1");
    svc.registerToolbarItem({ id: "b" } as any, "blade-1");
    svc.clearBladeToolbarItems("blade-1");
    expect(svc.getToolbarItems("blade-1")).toHaveLength(0);
  });

  it("includes global (*) items", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "global" } as any, "*");
    svc.registerToolbarItem({ id: "local" } as any, "blade-1");
    const items = svc.getToolbarItems("blade-1");
    expect(items).toHaveLength(2);
  });

  it("includes items registered by blade name", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "by-name" } as any, "Products");
    svc.registerToolbarItem({ id: "local" } as any, "blade_1_abc");
    const ids = svc.getToolbarItems("blade_1_abc", "Products").map((i) => i.id);
    expect(ids).toEqual(["local", "by-name"]);
  });

  it("ignores blade-name items when no name is passed", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "by-name" } as any, "Products");
    expect(svc.getToolbarItems("blade_1_abc")).toHaveLength(0);
  });

  it("prefers the instance item over a same-id name item", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "save", title: "Name" } as any, "Products");
    svc.registerToolbarItem({ id: "save", title: "Instance" } as any, "blade_1_abc");
    const items = svc.getToolbarItems("blade_1_abc", "Products");
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Instance");
  });

  it("keeps blade-name items when the instance is cleared", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "by-name" } as any, "Products");
    svc.clearBladeToolbarItems("blade_1_abc");
    expect(svc.getToolbarItems("blade_2_def", "Products")).toHaveLength(1);
  });

  it("applies preregistered blade-name items", () => {
    registerToolbarItem({ id: "prereg-by-name" } as any, "Orders");
    const svc = createToolbarService();
    expect(svc.getToolbarItems("blade_1_abc", "Orders").map((i) => i.id)).toContain("prereg-by-name");
  });

  it("registerExternalToolbarItem adds the item to every target blade", () => {
    registerExternalToolbarItem({ id: "ext", title: "Ext", targetBlades: ["Products", "Offers"] });
    const svc = createToolbarService();
    expect(svc.getToolbarItems("blade_1_abc", "Products").map((i) => i.id)).toContain("ext");
    expect(svc.getToolbarItems("blade_2_def", "offers").map((i) => i.id)).toContain("ext");
    expect(svc.getToolbarItems("blade_3_ghi", "Orders").map((i) => i.id)).not.toContain("ext");
  });

  it("registerExternalToolbarItem does not leak targetBlades into the item", () => {
    const svc = createToolbarService();
    registerExternalToolbarItem({ id: "ext-live", targetBlades: ["Products"] });
    const item = svc.getToolbarItems("blade_1_abc", "Products").find((i) => i.id === "ext-live");
    expect(item).toBeDefined();
    expect(item).not.toHaveProperty("targetBlades");
  });

  it("checks isToolbarItemRegistered", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "check" } as any, "b1");
    expect(svc.isToolbarItemRegistered("check")).toBe(true);
    expect(svc.isToolbarItemRegistered("nope")).toBe(false);
  });
});
