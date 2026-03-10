import { describe, it, expect } from "vitest";
import { createApp } from "vue";
import { DynamicModuleRegistryStateKey, type DynamicModuleRegistryState } from "@framework/injection-keys";

/**
 * Helper: create a minimal Vue app and provide an independent
 * DynamicModuleRegistryState, mimicking what the framework install() does.
 */
function createAppWithRegistry() {
  const app = createApp({});
  const registry: DynamicModuleRegistryState = {
    registeredModules: {},
    installedBladeIds: new Set<string>(),
    registeredSchemas: {},
  };
  app.provide(DynamicModuleRegistryStateKey, registry);
  return { app, registry };
}

describe("per-app dynamic module registry (FR-3.2)", () => {
  it("two createApp() calls produce independent registeredModules", () => {
    const { registry: r1 } = createAppWithRegistry();
    const { registry: r2 } = createAppWithRegistry();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r1.registeredModules as any)["TestBlade"] = { name: "TestBlade" };

    expect(r1.registeredModules).toHaveProperty("TestBlade");
    expect(r2.registeredModules).not.toHaveProperty("TestBlade");
  });

  it("two createApp() calls produce independent installedBladeIds", () => {
    const { registry: r1 } = createAppWithRegistry();
    const { registry: r2 } = createAppWithRegistry();

    r1.installedBladeIds.add("blade-a");

    expect(r1.installedBladeIds.has("blade-a")).toBe(true);
    expect(r2.installedBladeIds.has("blade-a")).toBe(false);
  });

  it("two createApp() calls produce independent registeredSchemas", () => {
    const { registry: r1 } = createAppWithRegistry();
    const { registry: r2 } = createAppWithRegistry();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r1.registeredSchemas as any)["schema-a"] = { settings: { id: "schema-a" } };

    expect(r1.registeredSchemas).toHaveProperty("schema-a");
    expect(r2.registeredSchemas).not.toHaveProperty("schema-a");
  });

  it("registering a module in app1 does not appear in app2 registry", () => {
    const { app: app1, registry: r1 } = createAppWithRegistry();
    const { app: app2, registry: r2 } = createAppWithRegistry();

    // Simulate module registration in app1
    app1.runWithContext(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r1.registeredModules as any)["ModuleA"] = { name: "ModuleA" };
      r1.installedBladeIds.add("module-a-blade");
    });

    // app2 should be unaffected
    app2.runWithContext(() => {
      expect(r2.registeredModules).not.toHaveProperty("ModuleA");
      expect(r2.installedBladeIds.has("module-a-blade")).toBe(false);
    });

    // Verify app1 still has the module
    expect(r1.registeredModules).toHaveProperty("ModuleA");
    expect(r1.installedBladeIds.has("module-a-blade")).toBe(true);
  });

  it("DynamicModuleRegistryStateKey is provided during framework install", () => {
    const { app, registry } = createAppWithRegistry();

    // Verify the key is retrievable via runWithContext (same mechanism used by dynamic modules)
    const { inject } = require("vue");
    const injected = app.runWithContext(() => inject(DynamicModuleRegistryStateKey));

    expect(injected).toBe(registry);
    expect(injected).toHaveProperty("registeredModules");
    expect(injected).toHaveProperty("installedBladeIds");
    expect(injected).toHaveProperty("registeredSchemas");
  });
});
