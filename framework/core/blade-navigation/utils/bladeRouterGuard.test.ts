import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed } from "vue";
import { bladeRouterGuard } from "@core/blade-navigation/utils/bladeRouterGuard";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import type { IBladeRegistry, IBladeRegistrationData } from "@core/composables/useBladeRegistry";
import type { IBladeStack } from "@core/blade-navigation/types";
import type { RouteLocationNormalized } from "vue-router";

// Mock notification to avoid ResizeObserver errors in jsdom
vi.mock("@core/notifications", () => ({
  notification: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

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

  const routeIndex = new Map<string, { name: string; data: IBladeRegistrationData }>();
  for (const [name, data] of map.entries()) {
    if (data.route) {
      const normalized = data.route.replace(/^\/+|\/+$/g, "").toLowerCase();
      if (normalized) routeIndex.set(normalized, { name, data });
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

/**
 * Build a minimal RouteLocationNormalized-like object for testing.
 */
function mockRoute(overrides: {
  path: string;
  matched?: Array<{ meta?: Record<string, unknown>; name?: string; path?: string }>;
  params?: Record<string, string>;
}): RouteLocationNormalized {
  return {
    path: overrides.path,
    matched: overrides.matched ?? [],
    params: overrides.params ?? {},
    // Fields not used by the guard but required by the type
    name: undefined,
    fullPath: overrides.path,
    query: {},
    hash: "",
    redirectedFrom: undefined,
    meta: {},
  } as unknown as RouteLocationNormalized;
}

// ── Route record factories ────────────────────────────────────────────────────

/** Root app route (e.g. "App" with meta.root) */
const rootRecord = { name: "App", path: "/", meta: { root: true } };

/** Real named child route (e.g. "Platform") — NOT a blade catch-all */
const platformRecord = { name: "Platform", path: "/platform", meta: {} };

/** Dashboard child route — default page */
const dashboardRecord = { name: "Dashboard", path: "/", meta: {} };

/** Blade catch-all route — registered by BladeNavigationPlugin */
const catchAllRecord = { path: "/:pathMatch(.*)*", meta: { bladeCatchAll: true } };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("bladeRouterGuard", () => {
  let stack: IBladeStack;
  let registry: IBladeRegistry;

  beforeEach(() => {
    registry = createMockRegistry({
      Orders: { route: "/orders", isWorkspace: true },
      OrderDetails: { route: "/order", routable: true },
    });
    stack = createBladeStack(registry);
  });

  // ── Routes outside root ─────────────────────────────────────────────────

  describe("routes outside root", () => {
    it("does nothing for routes without meta.root", async () => {
      // Pre-populate blades to verify they're NOT cleared
      await stack.openWorkspace({ name: "Orders" });
      expect(stack.blades.value).toHaveLength(1);

      const to = mockRoute({
        path: "/login",
        matched: [{ name: "Login", path: "/login", meta: {} }],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      // Blades should NOT be cleared — guard skipped entirely
      expect(stack.blades.value).toHaveLength(1);
    });
  });

  // ── Real child routes (non-blade) ───────────────────────────────────────

  describe("real child routes skip blade restoration", () => {
    it("skips blade restoration for named child route (Platform)", async () => {
      const to = mockRoute({
        path: "/platform",
        matched: [rootRecord, platformRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      // No blades should be opened — "platform" is not a blade URL
      expect(stack.blades.value).toHaveLength(0);
    });

    it("clears existing blades when navigating to a real child route", async () => {
      // Pre-populate blades
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "123" });
      expect(stack.blades.value).toHaveLength(2);

      const to = mockRoute({
        path: "/platform",
        matched: [rootRecord, platformRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(0);
    });

    it("cancels navigation when beforeClose guard prevents clearing blades on real route", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "123" });
      const childBladeId = stack.blades.value[1].id;

      stack.registerBeforeClose(childBladeId, async () => true);

      const to = mockRoute({
        path: "/platform",
        matched: [rootRecord, platformRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(2);
    });

    it("skips blade restoration for Dashboard route", async () => {
      await stack.openWorkspace({ name: "Orders" });
      expect(stack.blades.value).toHaveLength(1);

      const to = mockRoute({
        path: "/",
        matched: [rootRecord, dashboardRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(0);
    });

    it("is a no-op when no blades are open and navigating to real route", async () => {
      expect(stack.blades.value).toHaveLength(0);

      const to = mockRoute({
        path: "/platform",
        matched: [rootRecord, platformRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(0);
    });
  });

  // ── Blade catch-all routes ──────────────────────────────────────────────

  describe("blade catch-all routes trigger restoration", () => {
    it("restores workspace from blade URL", async () => {
      const to = mockRoute({
        path: "/orders",
        matched: [rootRecord, catchAllRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Orders");
    });

    it("restores workspace + child blade from blade URL", async () => {
      const to = mockRoute({
        path: "/orders/order/uuid-456",
        matched: [rootRecord, catchAllRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(2);
      expect(stack.workspace.value?.name).toBe("Orders");
      expect(stack.blades.value[1].name).toBe("OrderDetails");
      expect(stack.blades.value[1].param).toBe("uuid-456");
    });

    it("clears blade stack when catch-all matches root path with no segments", async () => {
      // Pre-populate
      await stack.openWorkspace({ name: "Orders" });
      expect(stack.blades.value).toHaveLength(1);

      const to = mockRoute({
        path: "/",
        matched: [rootRecord, catchAllRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(0);
    });

    it("cancels navigation when beforeClose guard prevents clearing stack for root catch-all", async () => {
      await stack.openWorkspace({ name: "Orders" });
      await stack.openBlade({ name: "OrderDetails", param: "123" });
      const childBladeId = stack.blades.value[1].id;

      stack.registerBeforeClose(childBladeId, async () => true);

      const to = mockRoute({
        path: "/",
        matched: [rootRecord, catchAllRecord],
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBe(false);
      expect(stack.blades.value).toHaveLength(2);
    });
  });

  // ── Tenant prefix ──────────────────────────────────────────────────────

  describe("tenant prefix handling", () => {
    it("strips tenant prefix before parsing blade URL", async () => {
      const to = mockRoute({
        path: "/seller-123/orders",
        matched: [rootRecord, catchAllRecord],
        params: { sellerId: "seller-123" },
      });

      const result = await bladeRouterGuard(to, stack, registry);

      expect(result).toBeUndefined();
      expect(stack.blades.value).toHaveLength(1);
      expect(stack.workspace.value?.name).toBe("Orders");
    });
  });
});
