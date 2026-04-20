import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "vue";

// ── Helper ────────────────────────────────────────────────────────────────────

async function setupApp() {
  const { BladeRegistryKey } = await import("@core/composables/useBladeRegistry");
  const app = createApp({ template: "<div/>" });
  const registered: Record<string, any> = {};
  const mockRegistry = {
    _registerBladeFn: (name: string, data: unknown) => {
      registered[name] = data;
    },
    getBlade: vi.fn(),
    getBladeComponent: vi.fn(),
    getBladeByRoute: vi.fn(),
    registeredBladesMap: { value: new Map() },
  };
  app.provide(BladeRegistryKey, mockRegistry);
  return { app, registered, mockRegistry };
}

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

// ── defineAppModule ───────────────────────────────────────────────────────────

describe("defineAppModule", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns a Vue plugin with install method", async () => {
    const { defineAppModule } = await import("@core/plugins/modularity");
    const mod = defineAppModule({});
    expect(mod).toBeDefined();
    expect(typeof mod.install).toBe("function");
  });

  it("registers blades in BladeRegistry without mutating components", async () => {
    const { defineAppModule } = await import("@core/plugins/modularity");
    const { app, registered } = await setupApp();

    const MockBlade = { name: "TestBlade", url: "/test" } as any;
    const mod = defineAppModule({ blades: { TestBlade: MockBlade } });
    mod.install(app);

    expect(registered["TestBlade"]).toBeDefined();
    expect(registered["TestBlade"].component).toBe(MockBlade);
    expect(registered["TestBlade"].route).toBe("/test");
    // No mutation on component
    expect(MockBlade.isBlade).toBeUndefined();
    expect(MockBlade.moduleUid).toBeUndefined();
  });

  it("uses export key as fallback name when component.name is missing", async () => {
    const { defineAppModule } = await import("@core/plugins/modularity");
    const { app, registered } = await setupApp();

    const MockBlade = { url: "/nameless" } as any;
    const mod = defineAppModule({ blades: { NamelessBlade: MockBlade } });
    mod.install(app);

    expect(registered["NamelessBlade"]).toBeDefined();
  });

  it("works without BladeRegistry when no blades provided", async () => {
    const { defineAppModule } = await import("@core/plugins/modularity");
    const app = createApp({ template: "<div/>" });

    const mod = defineAppModule({ locales: { en: { test: "hello" } } });
    expect(() => mod.install(app)).not.toThrow();
  });

  it("empty options — no errors", async () => {
    const { defineAppModule } = await import("@core/plugins/modularity");
    const app = createApp({ template: "<div/>" });

    const mod = defineAppModule({});
    expect(() => mod.install(app)).not.toThrow();
  });

  it("merges locales without throwing", async () => {
    const { defineAppModule } = await import("@core/plugins/modularity");
    const app = createApp({ template: "<div/>" });

    const mod = defineAppModule({ locales: { en: { key: "value" } } });
    expect(() => mod.install(app)).not.toThrow();
  });
});

// ── createAppModule legacy adapter ────────────────────────────────────────────

describe("createAppModule legacy adapter", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("delegates to defineAppModule — blades registered without mutation", async () => {
    const { createAppModule } = await import("@core/plugins/modularity");
    const { app, registered } = await setupApp();

    const MockBlade = { name: "LegacyBlade", url: "/legacy" } as any;
    const mod = createAppModule({ LegacyBlade: MockBlade });
    mod.install(app);

    expect(registered["LegacyBlade"]).toBeDefined();
    // No mutation
    expect(MockBlade.isBlade).toBeUndefined();
    expect(MockBlade.moduleUid).toBeUndefined();
  });
});
