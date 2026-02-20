import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed } from "vue";
import { createBladeStack } from "@shared/components/blade-navigation/composables/useBladeStack";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import type { IBladeStack } from "@shared/components/blade-navigation/types";

// ── Mock registry ──────────────────────────────────────────────────────────────

function createMockRegistry(
  blades: Record<string, { route?: string }> = {},
): IBladeRegistry {
  const map = new Map(
    Object.entries(blades).map(([name, data]) => [
      name,
      { component: {} as any, route: data.route, isWorkspace: false },
    ]),
  );

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

// Default registry with test blades
function defaultRegistry() {
  return createMockRegistry({
    Orders: { route: "/orders" },
    OrderDetails: { route: "/order" },
    Products: { route: "/products" },
    ProductDetails: { route: "/product" },
    Settings: { route: "/settings" },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("createBladeStack", () => {
  let stack: IBladeStack;

  beforeEach(() => {
    stack = createBladeStack(defaultRegistry());
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("starts with empty blade stack", () => {
      expect(stack.blades.value).toEqual([]);
    });

    it("has no workspace", () => {
      expect(stack.workspace.value).toBeUndefined();
    });

    it("has no active blade", () => {
      expect(stack.activeBlade.value).toBeUndefined();
    });
  });

  // ── openWorkspace ──────────────────────────────────────────────────────────

  describe("openWorkspace", () => {
    it("opens a workspace blade", async () => {
      await stack.openWorkspace({ name: "Orders" });

      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Orders");
      expect(stack.workspace.value?.url).toBe("/orders");
      expect(stack.workspace.value?.visible).toBe(true);
    });

    it("does not set param on workspace", async () => {
      await stack.openWorkspace({ name: "Orders" });
      expect(stack.workspace.value?.param).toBeUndefined();
    });

    it("replaces existing workspace", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openWorkspace({ name: "Products" });

      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Products");
    });

    it("clears child blades when switching workspace", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "123" });

      expect(stack.blades.value).toHaveLength(2);

      await stack.openWorkspace({ name: "Products" });

      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Products");
    });

    it("is a no-op when opening the same workspace", async () => {
      await stack.openWorkspace({ name: "Orders" });
      const firstId = stack.workspace.value!.id;

      await stack.openWorkspace({ name: "Orders" });
      expect(stack.workspace.value!.id).toBe(firstId);
    });

    it("throws for unregistered blade", async () => {
      await expect(stack.openWorkspace({ name: "NonExistent" })).rejects.toThrow(
        "not found in registry",
      );
    });

    it("calls onOpen callback", async () => {
      const onOpen = vi.fn();
      await stack.openWorkspace({ name: "Orders", onOpen });
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("passes options to descriptor", async () => {
      await stack.openWorkspace({
        name: "Orders",
        options: { filter: "pending" },
      });
      expect(stack.workspace.value?.options).toEqual({ filter: "pending" });
    });
  });

  // ── openBlade ──────────────────────────────────────────────────────────────

  describe("openBlade", () => {
    beforeEach(async () => {
      await stack.openWorkspace({ name: "Orders" });
    });

    it("opens a child blade", async () => {
      await stack.openBlade({ name: "OrderDetails", param: "uuid-1" });

      expect(stack.blades.value).toHaveLength(2);
      expect(stack.blades.value[1].name).toBe("OrderDetails");
      expect(stack.blades.value[1].param).toBe("uuid-1");
      expect(stack.blades.value[1].parentId).toBe(stack.workspace.value?.id);
    });

    it("replaces existing child when opening new child", async () => {
      await stack.openBlade({ name: "OrderDetails", param: "id-1" });
      const firstChildId = stack.blades.value[1].id;

      await stack.openBlade({
        name: "OrderDetails",
        param: "id-2",
        parentId: stack.workspace.value?.id,
      });

      expect(stack.blades.value).toHaveLength(2);
      expect(stack.blades.value[1].param).toBe("id-2");
      expect(stack.blades.value[1].id).not.toBe(firstChildId);
    });

    it("throws when no parent exists", async () => {
      stack._restoreStack([]); // Clear stack

      await expect(
        stack.openBlade({ name: "OrderDetails", param: "1" }),
      ).rejects.toThrow("no parent blade found");
    });

    it("throws for unregistered blade", async () => {
      await expect(stack.openBlade({ name: "Unknown" })).rejects.toThrow(
        "not found in registry",
      );
    });

    it("calls onOpen callback", async () => {
      const onOpen = vi.fn();
      await stack.openBlade({ name: "OrderDetails", onOpen });
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("passes options to child descriptor", async () => {
      await stack.openBlade({
        name: "OrderDetails",
        options: { orderId: "abc" },
      });
      expect(stack.blades.value[1].options).toEqual({ orderId: "abc" });
    });

    it("checks guards before closing existing children", async () => {
      await stack.openBlade({ name: "OrderDetails", param: "1" });

      // Register a guard that prevents close
      stack.registerBeforeClose(
        stack.blades.value[1].id,
        async () => true, // true = prevent
      );

      // Try opening a new child — should be prevented
      await stack.openBlade({
        name: "OrderDetails",
        param: "2",
        parentId: stack.workspace.value?.id,
      });

      // Old child should still be there
      expect(stack.blades.value[1].param).toBe("1");
    });
  });

  // ── closeBlade ─────────────────────────────────────────────────────────────

  describe("closeBlade", () => {
    beforeEach(async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "uuid-1" });
    });

    it("closes a child blade", async () => {
      const childId = stack.blades.value[1].id;
      const prevented = await stack.closeBlade(childId);

      expect(prevented).toBe(false);
      expect(stack.blades.value).toHaveLength(1);
    });

    it("cannot close the workspace blade", async () => {
      const wsId = stack.workspace.value!.id;
      const prevented = await stack.closeBlade(wsId);

      expect(prevented).toBe(false);
      expect(stack.blades.value).toHaveLength(2);
    });

    it("returns false for non-existent blade", async () => {
      const prevented = await stack.closeBlade("non-existent-id");
      expect(prevented).toBe(false);
    });

    it("respects beforeClose guard", async () => {
      const childId = stack.blades.value[1].id;

      stack.registerBeforeClose(childId, async () => true); // prevent close

      const prevented = await stack.closeBlade(childId);
      expect(prevented).toBe(true);
      expect(stack.blades.value).toHaveLength(2);
    });

    it("allows close when guard returns false", async () => {
      const childId = stack.blades.value[1].id;

      stack.registerBeforeClose(childId, async () => false); // allow close

      const prevented = await stack.closeBlade(childId);
      expect(prevented).toBe(false);
      expect(stack.blades.value).toHaveLength(1);
    });

    it("calls onClose callback", async () => {
      const onClose = vi.fn();

      // Open blade with onClose
      await stack.openBlade({
        name: "ProductDetails",
        param: "p1",
        onClose,
        parentId: stack.blades.value[1].id,
      });

      const childId = stack.blades.value[2].id;
      await stack.closeBlade(childId);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("closes all descendants when closing a middle blade", async () => {
      // Open: Orders → OrderDetails → ProductDetails
      await stack.openBlade({
        name: "ProductDetails",
        param: "p1",
        parentId: stack.blades.value[1].id,
      });

      expect(stack.blades.value).toHaveLength(3);

      // Close OrderDetails → should also close ProductDetails
      const orderDetailsId = stack.blades.value[1].id;
      await stack.closeBlade(orderDetailsId);

      expect(stack.blades.value).toHaveLength(1);
    });
  });

  // ── replaceCurrentBlade ────────────────────────────────────────────────────

  describe("replaceCurrentBlade", () => {
    beforeEach(async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "old-id" });
    });

    it("replaces the active blade", async () => {
      await stack.replaceCurrentBlade({
        name: "ProductDetails",
        param: "new-id",
      });

      // Stack: workspace + hidden original + new replacement
      // The original blade is hidden (visible: false), not destroyed,
      // so callParent from the replacement reaches the hidden blade's methods.
      expect(stack.blades.value).toHaveLength(3);
      expect(stack.blades.value[1].name).toBe("OrderDetails");
      expect(stack.blades.value[1].visible).toBe(false);
      expect(stack.blades.value[2].name).toBe("ProductDetails");
      expect(stack.blades.value[2].param).toBe("new-id");
      expect(stack.blades.value[2].visible).toBe(true);
    });

    it("sets parentId to hidden blade (for callParent routing)", async () => {
      const hiddenBladeId = stack.blades.value[1].id;

      await stack.replaceCurrentBlade({
        name: "ProductDetails",
        param: "new-id",
      });

      // parentId is the hidden blade, not the workspace —
      // this ensures callParent reaches the hidden blade's exposed methods.
      expect(stack.blades.value[2].parentId).toBe(hiddenBladeId);
    });

    it("respects guard on current blade", async () => {
      const currentId = stack.blades.value[1].id;
      stack.registerBeforeClose(currentId, async () => true);

      await stack.replaceCurrentBlade({
        name: "ProductDetails",
        param: "new-id",
      });

      // Replace should be prevented
      expect(stack.blades.value[1].name).toBe("OrderDetails");
    });

    it("throws with no active blade", async () => {
      stack._restoreStack([]);

      await expect(
        stack.replaceCurrentBlade({ name: "OrderDetails" }),
      ).rejects.toThrow("No active blade to replace");
    });
  });

  // ── activeBlade ────────────────────────────────────────────────────────────

  describe("activeBlade", () => {
    it("returns last visible blade", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "1" });

      expect(stack.activeBlade.value?.name).toBe("OrderDetails");
    });

    it("returns workspace when no children", async () => {
      await stack.openWorkspace({ name: "Orders" });
      expect(stack.activeBlade.value?.name).toBe("Orders");
    });
  });

  // ── Error management ───────────────────────────────────────────────────────

  describe("error management", () => {
    beforeEach(async () => {
      await stack.openWorkspace({ name: "Orders" });
    });

    it("sets error on blade", () => {
      const wsId = stack.workspace.value!.id;
      stack.setBladeError(wsId, new Error("test error"));

      expect(stack.blades.value[0].error).toBeInstanceOf(Error);
    });

    it("clears error on blade", () => {
      const wsId = stack.workspace.value!.id;
      stack.setBladeError(wsId, new Error("test error"));
      stack.clearBladeError(wsId);

      expect(stack.blades.value[0].error).toBeUndefined();
    });

    it("ignores non-existent blade", () => {
      stack.setBladeError("fake-id", new Error("nope"));
      // No error thrown, just no-op
      expect(stack.blades.value[0].error).toBeUndefined();
    });
  });

  // ── _restoreStack ──────────────────────────────────────────────────────────

  describe("_restoreStack", () => {
    it("replaces entire stack", async () => {
      await stack.openWorkspace({ name: "Orders" });

      stack._restoreStack([
        { id: "r1", name: "Products", url: "/products", visible: true },
        { id: "r2", name: "ProductDetails", url: "/product", param: "p1", parentId: "r1", visible: true },
      ]);

      expect(stack.blades.value).toHaveLength(2);
      expect(stack.workspace.value?.name).toBe("Products");
      expect(stack.blades.value[1].param).toBe("p1");
    });
  });
});
