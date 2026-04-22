import { describe, it, expect } from "vitest";
import { createToolbarService } from "@core/services/toolbar-service";

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

  it("checks isToolbarItemRegistered", () => {
    const svc = createToolbarService();
    svc.registerToolbarItem({ id: "check" } as any, "b1");
    expect(svc.isToolbarItemRegistered("check")).toBe(true);
    expect(svc.isToolbarItemRegistered("nope")).toBe(false);
  });
});
