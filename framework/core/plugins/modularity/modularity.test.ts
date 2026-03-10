import { describe, it, expect, vi } from "vitest";
import { createApp } from "vue";

// ── createAppModule contract (FR-5.1) ─────────────────────────────────────────

describe("createAppModule contract", () => {
  it("returns a Vue plugin object with an install method", async () => {
    const { createAppModule } = await import("@core/plugins/modularity");
    const mod = createAppModule({});
    expect(mod).toBeDefined();
    expect(typeof mod).toBe("object");
    expect(typeof mod.install).toBe("function");
  });

  it("install() registers blade components on the Vue app", async () => {
    const { createAppModule } = await import("@core/plugins/modularity");

    // Create a mock blade with a name (required for registry lookup)
    const MockBlade = { name: "MockProductBlade", url: "/mock-products" } as any;
    const mod = createAppModule({ MockProductBlade: MockBlade });

    const app = createApp({ template: "<div/>" });
    // Provide a minimal blade registry so install() can register blades
    const registered: Record<string, unknown> = {};
    const mockRegistry = {
      _registerBladeFn: (name: string, data: unknown) => {
        registered[name] = data;
      },
      getBlade: vi.fn(),
      getBladeComponent: vi.fn(),
      getBladeByRoute: vi.fn(),
      registeredBladesMap: { value: new Map() },
    };
    // Inject the registry via provide so app.runWithContext picks it up
    const { BladeRegistryKey } = await import("@core/composables/useBladeRegistry");
    app.provide(BladeRegistryKey, mockRegistry);

    mod.install(app, undefined as any);

    // Blade should have been registered with registry
    expect(registered["MockProductBlade"]).toBeDefined();
  });

  it("install() accepts pages with no URL — registers without route", async () => {
    const { createAppModule } = await import("@core/plugins/modularity");

    const MockBlade = { name: "RoutelesaBlade" } as any;
    const mod = createAppModule({ RoutelesaBlade: MockBlade });

    const app = createApp({ template: "<div/>" });
    const registered: Record<string, unknown> = {};
    const mockRegistry = {
      _registerBladeFn: (name: string, data: unknown) => {
        registered[name] = data;
      },
      getBlade: vi.fn(),
      getBladeComponent: vi.fn(),
      getBladeByRoute: vi.fn(),
      registeredBladesMap: { value: new Map() },
    };
    const { BladeRegistryKey } = await import("@core/composables/useBladeRegistry");
    app.provide(BladeRegistryKey, mockRegistry);

    mod.install(app, undefined as any);

    // Should register with blade name but no route
    expect(registered["RoutelesaBlade"]).toBeDefined();
    expect((registered["RoutelesaBlade"] as any).route).toBeUndefined();
  });
});
