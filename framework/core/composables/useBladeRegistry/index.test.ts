import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createBladeRegistry } from "./index";
import type { IBladeRegistrationData } from "./index";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Minimal blade component mock satisfying isValidBladeComponent() */
function makeBlade(name = "TestBlade") {
  return defineComponent({ name, render: () => h("div") });
}

function makeRegistrationData(
  overrides: Partial<IBladeRegistrationData> = {},
): IBladeRegistrationData {
  return {
    component: makeBlade() as any,
    ...overrides,
  };
}

function createTestApp() {
  return createApp({ render: () => h("div") });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("createBladeRegistry", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  // ── Basic registration ──────────────────────────────────────────────────

  describe("registerBlade", () => {
    it("registers a blade and makes it retrievable", () => {
      const registry = createBladeRegistry(app);
      const data = makeRegistrationData({ route: "/orders", isWorkspace: true });

      registry._registerBladeFn("Orders", data);

      expect(registry.getBlade("Orders")).toBe(data);
      expect(registry.registeredBladesMap.value.has("Orders")).toBe(true);
    });

    it("registers component globally on the app", () => {
      const registry = createBladeRegistry(app);
      const blade = makeBlade("Orders");

      registry._registerBladeFn("Orders", { component: blade as any, route: "/orders" });

      expect(app.component("Orders")).toBe(blade);
    });

    it("throws on empty name", () => {
      const registry = createBladeRegistry(app);
      expect(() => registry._registerBladeFn("", makeRegistrationData())).toThrow(
        "non-empty string",
      );
    });

    it("throws when component is missing", () => {
      const registry = createBladeRegistry(app);
      expect(() =>
        registry._registerBladeFn("Test", { component: undefined as any }),
      ).toThrow("must include a component");
    });
  });

  // ── P2.9: Duplicate registration (fail-fast) ────────────────────────────

  describe("duplicate registration (P2.9)", () => {
    it("throws on duplicate name by default", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("Orders", makeRegistrationData({ route: "/orders" }));

      expect(() =>
        registry._registerBladeFn("Orders", makeRegistrationData({ route: "/orders" })),
      ).toThrow("already registered");
    });

    it("allows overwrite when allowOverwrite=true", () => {
      const registry = createBladeRegistry(app);
      const first = makeRegistrationData({ route: "/orders" });
      const second = makeRegistrationData({ route: "/orders-v2" });

      registry._registerBladeFn("Orders", first);
      registry._registerBladeFn("Orders", second, true);

      expect(registry.getBlade("Orders")).toBe(second);
    });

    it("error message suggests allowOverwrite", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("Orders", makeRegistrationData());

      expect(() => registry._registerBladeFn("Orders", makeRegistrationData())).toThrow(
        "allowOverwrite=true",
      );
    });
  });

  // ── P2.7: Reverse URL index (getBladeByRoute) ──────────────────────────

  describe("getBladeByRoute (P2.7)", () => {
    it("finds blade by route segment", () => {
      const registry = createBladeRegistry(app);
      const data = makeRegistrationData({ route: "/orders", isWorkspace: true });

      registry._registerBladeFn("Orders", data);

      const result = registry.getBladeByRoute("orders");
      expect(result).toBeDefined();
      expect(result!.name).toBe("Orders");
      expect(result!.data).toBe(data);
    });

    it("finds blade with leading slash", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("Orders", makeRegistrationData({ route: "/orders" }));

      const result = registry.getBladeByRoute("/orders");
      expect(result).toBeDefined();
      expect(result!.name).toBe("Orders");
    });

    it("finds blade without leading slash", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("Orders", makeRegistrationData({ route: "/orders" }));

      const result = registry.getBladeByRoute("orders");
      expect(result).toBeDefined();
      expect(result!.name).toBe("Orders");
    });

    it("returns undefined for unknown route", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("Orders", makeRegistrationData({ route: "/orders" }));

      expect(registry.getBladeByRoute("/unknown")).toBeUndefined();
    });

    it("returns undefined for empty route", () => {
      const registry = createBladeRegistry(app);
      expect(registry.getBladeByRoute("")).toBeUndefined();
    });

    it("updates index on overwrite", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("Orders", makeRegistrationData({ route: "/orders" }));
      registry._registerBladeFn("OrdersV2", makeRegistrationData({ route: "/orders" }), false);

      // Should fail because different name → duplicate route maps to last registered
      // Actually "OrdersV2" is a different name so it won't fail on name check.
      // The route index maps /orders → OrdersV2 (last registration wins)
      const result = registry.getBladeByRoute("/orders");
      expect(result!.name).toBe("OrdersV2");
    });

    it("handles blades without routes", () => {
      const registry = createBladeRegistry(app);
      registry._registerBladeFn("NoRoute", makeRegistrationData());

      // No route, so reverse lookup shouldn't find it
      expect(registry.getBladeByRoute("NoRoute")).toBeUndefined();
    });
  });

  // ── getBladeComponent ──────────────────────────────────────────────────

  describe("getBladeComponent", () => {
    it("returns component from registry", () => {
      const registry = createBladeRegistry(app);
      const blade = makeBlade("Orders");
      registry._registerBladeFn("Orders", { component: blade as any, route: "/orders" });

      expect(registry.getBladeComponent("Orders")).toBe(blade);
    });

    it("returns undefined for unknown name", () => {
      const registry = createBladeRegistry(app);
      expect(registry.getBladeComponent("Unknown")).toBeUndefined();
    });

    it("returns undefined for empty name", () => {
      const registry = createBladeRegistry(app);
      expect(registry.getBladeComponent("")).toBeUndefined();
    });
  });
});
