import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { createBladeMessaging } from "@shared/components/blade-navigation/composables/useBladeMessaging";
import { createBladeStack } from "@shared/components/blade-navigation/composables/useBladeStack";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack, IBladeMessaging } from "@shared/components/blade-navigation/types";

// ── Mock registry ──────────────────────────────────────────────────────────────

function createMockRegistry(): IBladeRegistry {
  const map = new Map<string, any>([
    ["Workspace", { component: {} as any, route: "/workspace" }],
    ["Child", { component: {} as any, route: "/child" }],
    ["GrandChild", { component: {} as any, route: "/grandchild" }],
  ]);

  return {
    registeredBladesMap: computed(() => map),
    getBlade: (name: string) => map.get(name),
    getBladeComponent: (name: string) => map.get(name)?.component,
    getBladeByRoute: (route: string) => {
      const normalized = route.replace(/^\/+/, "");
      for (const [name, data] of map.entries()) {
        if (data.route?.replace(/^\/+/, "") === normalized) return { name, data };
      }
      return undefined;
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("createBladeMessaging", () => {
  let stack: IBladeStack;
  let messaging: IBladeMessaging;

  beforeEach(async () => {
    stack = createBladeStack(createMockRegistry());
    messaging = createBladeMessaging(stack);

    // Set up: Workspace → Child
    await stack.openWorkspace({ name: "Workspace" });
    await stack.openBlade({ name: "Child", param: "c1" });
  });

  // ── exposeToChildren + callParent ──────────────────────────────────────────

  describe("exposeToChildren + callParent", () => {
    it("child can call parent's exposed method", async () => {
      const reloadFn = vi.fn().mockResolvedValue("reloaded");

      // Workspace exposes "reload" to its children
      const wsId = stack.workspace.value!.id;
      messaging.exposeToChildren(wsId, { reload: reloadFn });

      // Child calls parent's "reload"
      const childId = stack.blades.value[1].id;
      const result = await messaging.callParent(childId, "reload");

      expect(reloadFn).toHaveBeenCalledOnce();
      expect(result).toBe("reloaded");
    });

    it("passes args to parent method", async () => {
      const updateFn = vi.fn().mockResolvedValue(true);

      const wsId = stack.workspace.value!.id;
      messaging.exposeToChildren(wsId, { update: updateFn });

      const childId = stack.blades.value[1].id;
      await messaging.callParent(childId, "update", { id: 42 });

      expect(updateFn).toHaveBeenCalledWith({ id: 42 });
    });

    it("supports multiple methods", async () => {
      const reloadFn = vi.fn().mockResolvedValue("ok");
      const deleteFn = vi.fn().mockResolvedValue("deleted");

      const wsId = stack.workspace.value!.id;
      messaging.exposeToChildren(wsId, {
        reload: reloadFn,
        delete: deleteFn,
      });

      const childId = stack.blades.value[1].id;
      await messaging.callParent(childId, "reload");
      await messaging.callParent(childId, "delete");

      expect(reloadFn).toHaveBeenCalledOnce();
      expect(deleteFn).toHaveBeenCalledOnce();
    });

    it("works across multiple levels", async () => {
      // Add grandchild: Workspace → Child → GrandChild
      const childId = stack.blades.value[1].id;
      await stack.openBlade({ name: "GrandChild", param: "g1", parentId: childId });

      const saveItemFn = vi.fn().mockResolvedValue("saved");

      // Child exposes "saveItem" to its children
      messaging.exposeToChildren(childId, { saveItem: saveItemFn });

      // GrandChild calls parent's "saveItem"
      const grandChildId = stack.blades.value[2].id;
      const result = await messaging.callParent(grandChildId, "saveItem", { data: "test" });

      expect(saveItemFn).toHaveBeenCalledWith({ data: "test" });
      expect(result).toBe("saved");
    });
  });

  // ── Error cases ────────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("throws when caller blade not found", async () => {
      await expect(
        messaging.callParent("non-existent-id", "reload"),
      ).rejects.toThrow("not found in stack");
    });

    it("throws when caller has no parent", async () => {
      // Workspace has no parent
      const wsId = stack.workspace.value!.id;
      await expect(
        messaging.callParent(wsId, "reload"),
      ).rejects.toThrow("has no parent");
    });

    it("throws when parent has no exposed methods", async () => {
      // Child tries to call parent but parent hasn't exposed anything
      const childId = stack.blades.value[1].id;
      await expect(
        messaging.callParent(childId, "reload"),
      ).rejects.toThrow("no exposed methods");
    });

    it("throws when method not found on parent", async () => {
      const wsId = stack.workspace.value!.id;
      messaging.exposeToChildren(wsId, { reload: vi.fn() });

      const childId = stack.blades.value[1].id;
      await expect(
        messaging.callParent(childId, "nonExistentMethod"),
      ).rejects.toThrow("not found on parent");
    });
  });

  // ── cleanup ────────────────────────────────────────────────────────────────

  describe("cleanup", () => {
    it("removes exposed methods after cleanup", async () => {
      const wsId = stack.workspace.value!.id;
      messaging.exposeToChildren(wsId, { reload: vi.fn() });

      messaging.cleanup(wsId);

      const childId = stack.blades.value[1].id;
      await expect(
        messaging.callParent(childId, "reload"),
      ).rejects.toThrow("no exposed methods");
    });

    it("cleanup for non-existent blade is a no-op", () => {
      // Should not throw
      messaging.cleanup("non-existent-id");
    });
  });

  // ── overwriting exposed methods ────────────────────────────────────────────

  describe("overwriting exposed methods", () => {
    it("last exposeToChildren wins", async () => {
      const firstReload = vi.fn().mockResolvedValue("first");
      const secondReload = vi.fn().mockResolvedValue("second");

      const wsId = stack.workspace.value!.id;
      messaging.exposeToChildren(wsId, { reload: firstReload });
      messaging.exposeToChildren(wsId, { reload: secondReload });

      const childId = stack.blades.value[1].id;
      const result = await messaging.callParent(childId, "reload");

      expect(firstReload).not.toHaveBeenCalled();
      expect(secondReload).toHaveBeenCalledOnce();
      expect(result).toBe("second");
    });
  });
});
