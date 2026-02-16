import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed } from "vue";
import { restoreFromUrl } from "./restoreFromUrl";
import { createBladeStack } from "../composables/useBladeStack";
import type { IBladeRegistry, IBladeRegistrationData } from "../../../../core/composables/useBladeRegistry";
import type { IBladeStack, ParsedBladeUrl } from "../types";

// ── Mock registry ──────────────────────────────────────────────────────────────

function createMockRegistry(
  blades: Record<string, { route?: string; isWorkspace?: boolean; routable?: boolean }> = {},
): IBladeRegistry {
  const map = new Map<string, IBladeRegistrationData>(
    Object.entries(blades).map(([name, data]) => [
      name,
      {
        component: {} as any,
        route: data.route,
        isWorkspace: data.isWorkspace ?? false,
        routable: data.routable,
      },
    ]),
  );

  // Build reverse route index (mirrors createBladeRegistry._routeIndex)
  const routeIndex = new Map<string, { name: string; data: IBladeRegistrationData }>();
  for (const [name, data] of map.entries()) {
    if (data.route) {
      const normalized = data.route.replace(/^\/+|\/+$/g, "").toLowerCase();
      if (normalized) {
        routeIndex.set(normalized, { name, data });
      }
    }
  }

  return {
    registeredBladesMap: computed(() => map),
    getBlade: (name: string) => map.get(name),
    getBladeComponent: (name: string) => map.get(name)?.component,
    getBladeByRoute: (route: string) => {
      const normalized = route.replace(/^\/+|\/+$/g, "").toLowerCase();
      return routeIndex.get(normalized);
    },
  };
}

function defaultRegistry(): IBladeRegistry {
  return createMockRegistry({
    Orders: { route: "/orders", isWorkspace: true },
    OrderDetails: { route: "/order", routable: true },
    Products: { route: "/products", isWorkspace: true },
    NonRoutableBlade: { route: "/non-routable", routable: false },
    NotAWorkspace: { route: "/not-workspace", isWorkspace: false },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("restoreFromUrl", () => {
  let stack: IBladeStack;
  let registry: IBladeRegistry;

  beforeEach(() => {
    registry = defaultRegistry();
    stack = createBladeStack(registry);
  });

  // ── Empty / no-op cases ───────────────────────────────────────────────────

  describe("no-op cases", () => {
    it("returns false for empty parsed URL", async () => {
      const result = await restoreFromUrl(stack, registry, {});
      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(0);
    });

    it("returns false when workspaceUrl is undefined", async () => {
      const result = await restoreFromUrl(stack, registry, {
        bladeUrl: "order",
        param: "123",
      });
      expect(result).toBe(false);
    });
  });

  // ── Workspace restoration ─────────────────────────────────────────────────

  describe("workspace restoration", () => {
    it("opens workspace from URL", async () => {
      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
      });

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Orders");
    });

    it("skips workspace open if already current", async () => {
      // Pre-open workspace
      await stack.openWorkspace({ name: "Orders" });
      const openSpy = vi.spyOn(stack, "openWorkspace");

      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
      });

      expect(result).toBe(false);
      expect(openSpy).not.toHaveBeenCalled();
    });

    it("returns false when workspace URL not found in registry", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "unknown",
      });

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("No workspace blade found"),
      );

      warnSpy.mockRestore();
    });

    it("returns false when matched blade is not a workspace", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "not-workspace",
      });

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("not a workspace"),
      );

      warnSpy.mockRestore();
    });
  });

  // ── Workspace + child blade restoration ───────────────────────────────────

  describe("workspace + child blade", () => {
    it("opens workspace and child blade with param", async () => {
      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
        bladeUrl: "order",
        param: "uuid-123",
      });

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(2);
      expect(stack.workspace.value?.name).toBe("Orders");
      expect(stack.blades.value[1].name).toBe("OrderDetails");
      expect(stack.blades.value[1].param).toBe("uuid-123");
    });

    it("opens workspace and child blade without param", async () => {
      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
        bladeUrl: "order",
      });

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(2);
      expect(stack.blades.value[1].name).toBe("OrderDetails");
      expect(stack.blades.value[1].param).toBeUndefined();
    });

    it("warns when child blade URL not found in registry", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
        bladeUrl: "unknown-blade",
      });

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(1); // Only workspace
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("No blade found for URL segment"),
      );

      warnSpy.mockRestore();
    });
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  describe("idempotency", () => {
    it("skips child blade if already open with same name and param", async () => {
      // Pre-populate: workspace + child already open
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "uuid-123" });

      expect(stack.blades.value).toHaveLength(2);

      // Attempt restore with same params
      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
        bladeUrl: "order",
        param: "uuid-123",
      });

      expect(result).toBe(false);
      // Still only 2 blades — no duplicate opened
      expect(stack.blades.value).toHaveLength(2);
    });

    it("opens new child if param differs from existing", async () => {
      // Pre-populate with different param
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "uuid-old" });

      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
        bladeUrl: "order",
        param: "uuid-new",
      });

      expect(result).toBe(false);
      // New blade was opened (exact count depends on BladeStack.openBlade behavior)
      const orderBlades = stack.blades.value.filter((b) => b.name === "OrderDetails");
      expect(orderBlades.some((b) => b.param === "uuid-new")).toBe(true);
    });
  });

  // ── Non-routable blade handling ───────────────────────────────────────────

  describe("non-routable blade handling", () => {
    it("returns true (needs cleanup) for non-routable blade", async () => {
      const result = await restoreFromUrl(stack, registry, {
        workspaceUrl: "orders",
        bladeUrl: "non-routable",
      });

      expect(result).toBe(true);
      // Workspace should be opened, but non-routable child should NOT be
      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Orders");
    });
  });
});
