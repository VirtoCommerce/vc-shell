import { describe, it, expect, vi } from "vitest";
import { createApp } from "vue";
import { createAppModule, defineAppModule } from "@core/plugins/modularity";
import { BladeRegistryKey } from "@core/composables/useBladeRegistry";

// ── Helper ────────────────────────────────────────────────────────────────────

function setupApp() {
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
  it("returns a Vue plugin object with an install method", () => {
    const mod = createAppModule({});
    expect(mod).toBeDefined();
    expect(typeof mod).toBe("object");
    expect(typeof mod.install).toBe("function");
  });

  it("install() registers blade components on the Vue app", () => {
    const MockBlade = { name: "MockProductBlade", url: "/mock-products" } as any;
    const mod = createAppModule({ MockProductBlade: MockBlade });

    const { app, registered } = setupApp();
    mod.install(app, undefined as any);

    expect(registered["MockProductBlade"]).toBeDefined();
  });

  it("install() accepts pages with no URL — registers without route", () => {
    const MockBlade = { name: "RoutelesaBlade" } as any;
    const mod = createAppModule({ RoutelesaBlade: MockBlade });

    const { app, registered } = setupApp();
    mod.install(app, undefined as any);

    expect(registered["RoutelesaBlade"]).toBeDefined();
    expect((registered["RoutelesaBlade"] as any).route).toBeUndefined();
  });
});

// ── defineAppModule ───────────────────────────────────────────────────────────

describe("defineAppModule", () => {
  it("returns a Vue plugin with install method", () => {
    const mod = defineAppModule({});
    expect(mod).toBeDefined();
    expect(typeof mod.install).toBe("function");
  });

  it("registers blades in BladeRegistry without mutating components", () => {
    const { app, registered } = setupApp();

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

  it("uses export key as fallback name when component.name is missing", () => {
    const { app, registered } = setupApp();

    const MockBlade = { url: "/nameless" } as any;
    const mod = defineAppModule({ blades: { NamelessBlade: MockBlade } });
    mod.install(app);

    expect(registered["NamelessBlade"]).toBeDefined();
  });

  it("works without BladeRegistry when no blades provided", () => {
    const app = createApp({ template: "<div/>" });

    const mod = defineAppModule({ locales: { en: { test: "hello" } } });
    expect(() => mod.install(app)).not.toThrow();
  });

  it("empty options — no errors", () => {
    const app = createApp({ template: "<div/>" });

    const mod = defineAppModule({});
    expect(() => mod.install(app)).not.toThrow();
  });

  it("merges locales without throwing", () => {
    const app = createApp({ template: "<div/>" });

    const mod = defineAppModule({ locales: { en: { key: "value" } } });
    expect(() => mod.install(app)).not.toThrow();
  });
});

// ── createAppModule legacy adapter ────────────────────────────────────────────

describe("createAppModule legacy adapter", () => {
  it("delegates to defineAppModule — blades registered without mutation", () => {
    const { app, registered } = setupApp();

    const MockBlade = { name: "LegacyBlade", url: "/legacy" } as any;
    const mod = createAppModule({ LegacyBlade: MockBlade });
    mod.install(app);

    expect(registered["LegacyBlade"]).toBeDefined();
    // No mutation
    expect(MockBlade.isBlade).toBeUndefined();
    expect(MockBlade.moduleUid).toBeUndefined();
  });
});
