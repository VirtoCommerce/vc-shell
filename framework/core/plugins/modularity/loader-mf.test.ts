import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

// Mock MF runtime BEFORE importing module under test
vi.mock("@module-federation/enhanced/runtime", () => ({
  init: vi.fn(),
  loadRemote: vi.fn(),
}));

// Mock logger
vi.mock("@core/utilities", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock semver
vi.mock("semver", () => ({
  satisfies: vi.fn((version: string, range: string) => {
    // Simple mock: ^1.0.0 matches 1.x, ^2.0.0 matches 2.x
    const majorRange = range.match(/\^(\d+)/)?.[1];
    const majorVersion = version.split(".")[0];
    if (majorRange) return majorRange === majorVersion;
    // For non-caret ranges (e.g. >=1.0.0 <2.0.0), do a basic check
    return true;
  }),
  coerce: vi.fn((version: string) => {
    const m = version.match(/^(\d+\.\d+\.\d+)/);
    return m ? { version: m[1] } : null;
  }),
}));

// Mock package.json to provide a known framework version
vi.mock("../../../package.json", () => ({
  default: { version: "1.2.4" },
}));

import { init, loadRemote } from "@module-federation/enhanced/runtime";
import { satisfies } from "semver";
import { dynamicModulesPlugin, type ModuleRegistryEntry } from "./loader-mf";
import { ModulesReadyKey, ModulesLoadErrorKey } from "@framework/injection-keys";
import { SHARED_DEP_NAMES } from "../../../../configs/vite-config/src/templates/shared-deps";

function createTestApp() {
  const app = createApp({ template: "<div />" });
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/", component: { template: "<div />" } }],
  });
  app.use(router);
  return { app, router };
}

function spyProvide(app: App) {
  const provided = new Map<symbol, any>();
  const origProvide = app.provide.bind(app);
  app.provide = ((key: any, value: any) => {
    provided.set(key, value);
    return origProvide(key, value);
  }) as any;
  return provided;
}

describe("dynamicModulesPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as any;
    global.performance = { mark: vi.fn() } as any;
  });

  it("provides ModulesReadyKey and ModulesLoadErrorKey", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules: [] }),
    });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    expect(provided.has(ModulesReadyKey as any)).toBe(true);
    expect(provided.has(ModulesLoadErrorKey as any)).toBe(true);
  });

  it("sets modulesReady=true after loading empty registry", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules: [] }),
    });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    const modulesReady = provided.get(ModulesReadyKey as any);
    expect(modulesReady.value).toBe(true);
  });

  it("loads modules in parallel via Promise.allSettled", async () => {
    const { app, router } = createTestApp();

    const modules: ModuleRegistryEntry[] = [
      { id: "mod-a", entry: "/a/remoteEntry.js", version: "1.0.0" },
      { id: "mod-b", entry: "/b/remoteEntry.js", version: "1.0.0" },
      { id: "mod-c", entry: "/c/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    const fakeModuleA = { install: vi.fn() };
    const fakeModuleB = { install: vi.fn() };
    const fakeModuleC = { install: vi.fn() };

    (loadRemote as any)
      .mockResolvedValueOnce({ default: fakeModuleA })
      .mockResolvedValueOnce({ default: fakeModuleB })
      .mockResolvedValueOnce({ default: fakeModuleC });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    // All three loadRemote calls should have been made
    expect(loadRemote).toHaveBeenCalledTimes(3);
    expect(loadRemote).toHaveBeenCalledWith("mod-a/module");
    expect(loadRemote).toHaveBeenCalledWith("mod-b/module");
    expect(loadRemote).toHaveBeenCalledWith("mod-c/module");

    // All three modules should be installed
    expect(fakeModuleA.install).toHaveBeenCalled();
    expect(fakeModuleB.install).toHaveBeenCalled();
    expect(fakeModuleC.install).toHaveBeenCalled();
  });

  it("initializes MF runtime with all compatible remotes", async () => {
    const { app, router } = createTestApp();

    const modules: ModuleRegistryEntry[] = [
      { id: "reviews", entry: "/reviews/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    const fakeModule = { install: vi.fn() };
    (loadRemote as any).mockResolvedValue({ default: fakeModule });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "host",
        remotes: [{ name: "reviews", entry: "/reviews/remoteEntry.js", type: "module" }],
      }),
    );
  });

  it("builds fetch URL with appName and frameworkVersion from package.json", async () => {
    const { app, router } = createTestApp();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules: [] }),
    });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/frontend-modules?appName=test-app&frameworkVersion=1.2.4",
      { credentials: "same-origin" },
    );
  });

  it("filters incompatible modules by framework version (client-side)", async () => {
    const { app, router } = createTestApp();

    const modules: ModuleRegistryEntry[] = [
      {
        id: "old-module",
        entry: "/modules/old/remoteEntry.js",
        version: "0.1.0",
        compatibleWith: { framework: "^2.0.0" },
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    // Framework version is 1.2.4 (from mocked package.json), module requires ^2.0.0
    expect(loadRemote).not.toHaveBeenCalled();
  });

  it("sets modulesLoadError=true on fetch failure", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    const loadError = provided.get(ModulesLoadErrorKey as any);
    expect(loadError.value).toBe(true);
  });

  it("sets modulesLoadError=true on HTTP error response", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    const loadError = provided.get(ModulesLoadErrorKey as any);
    expect(loadError.value).toBe(true);
  });

  it("continues loading remaining modules if one fails", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    const modules: ModuleRegistryEntry[] = [
      { id: "broken", entry: "/broken/remoteEntry.js", version: "1.0.0" },
      { id: "working", entry: "/working/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    const workingModule = { install: vi.fn() };
    (loadRemote as any)
      .mockRejectedValueOnce(new Error("Module load failed"))
      .mockResolvedValueOnce({ default: workingModule });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    // Working module should still be installed
    expect(workingModule.install).toHaveBeenCalled();

    // modulesReady should be true (partial success is not an error)
    const modulesReady = provided.get(ModulesReadyKey as any);
    expect(modulesReady.value).toBe(true);
  });

  it("handles module that exports install directly (not as default)", async () => {
    const { app, router } = createTestApp();

    const modules: ModuleRegistryEntry[] = [
      { id: "direct", entry: "/direct/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    const directModule = { install: vi.fn() };
    // No .default wrapper — install is directly on exports
    (loadRemote as any).mockResolvedValue(directModule);

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    expect(directModule.install).toHaveBeenCalled();
  });

  it("skips modules with invalid registry entries", async () => {
    const { app, router } = createTestApp();

    const modules = [
      { id: "valid", entry: "/valid/remoteEntry.js", version: "1.0.0" },
      { id: null, entry: "/bad/remoteEntry.js", version: "1.0.0" }, // invalid
      { id: "no-entry", version: "1.0.0" }, // missing entry
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    const validModule = { install: vi.fn() };
    (loadRemote as any).mockResolvedValue({ default: validModule });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    // Only 1 valid module should trigger loadRemote
    expect(loadRemote).toHaveBeenCalledTimes(1);
    expect(loadRemote).toHaveBeenCalledWith("valid/module");
  });

  describe("resolvePlugins — sub-module collection format", () => {
    it("installs all sub-modules from { default: { Rating: { install }, Orders: { install } } }", async () => {
      const { app, router } = createTestApp();

      const modules: ModuleRegistryEntry[] = [
        { id: "marketplace", entry: "/mp/remoteEntry.js", version: "1.0.0" },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      const ratingInstall = vi.fn();
      const ordersInstall = vi.fn();

      (loadRemote as any).mockResolvedValue({
        default: {
          Rating: { install: ratingInstall },
          Orders: { install: ordersInstall },
        },
      });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(ratingInstall).toHaveBeenCalled();
      expect(ordersInstall).toHaveBeenCalled();
    });

    it("installs namespace-wrapped sub-modules { default: { Rating: { default: { install } } } }", async () => {
      const { app, router } = createTestApp();

      const modules: ModuleRegistryEntry[] = [
        { id: "marketplace", entry: "/mp/remoteEntry.js", version: "1.0.0" },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      const ratingInstall = vi.fn();

      (loadRemote as any).mockResolvedValue({
        default: {
          Rating: { default: { install: ratingInstall } },
        },
      });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(ratingInstall).toHaveBeenCalled();
    });

    it("skips modules with null/empty exports (no install found)", async () => {
      const { app, router } = createTestApp();

      const modules: ModuleRegistryEntry[] = [
        { id: "empty-mod", entry: "/empty/remoteEntry.js", version: "1.0.0" },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      // loadRemote returns null (empty exports)
      (loadRemote as any).mockResolvedValue(null);

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      // loadRemote was called but no install should be invoked — no crash
      expect(loadRemote).toHaveBeenCalledTimes(1);
    });

    it("skips sub-module entries that are not objects", async () => {
      const { app, router } = createTestApp();

      const modules: ModuleRegistryEntry[] = [
        { id: "mixed", entry: "/mixed/remoteEntry.js", version: "1.0.0" },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      const validInstall = vi.fn();

      (loadRemote as any).mockResolvedValue({
        default: {
          __version: "1.0.0", // string, should be skipped
          count: 42, // number, should be skipped
          Valid: { install: validInstall },
        },
      });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(validInstall).toHaveBeenCalled();
    });
  });

  describe("humanizeRange — NuGet-to-npm range conversion via compatibility filter", () => {
    it("converts [1.0.0,2.0.0) to >=1.0.0 <2.0.0", async () => {
      const { app, router } = createTestApp();
      const modules: ModuleRegistryEntry[] = [
        {
          id: "nuget-range",
          entry: "/nr/remoteEntry.js",
          version: "1.0.0",
          compatibleWith: { framework: "[1.0.0,2.0.0)" },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      // humanizeRange converts [1.0.0,2.0.0) → ">=1.0.0 <2.0.0"
      // semver.satisfies is called with the converted range
      expect(satisfies).toHaveBeenCalledWith(
        expect.any(String),
        ">=1.0.0 <2.0.0",
      );
    });

    it("converts (1.0.0,2.0.0] to >1.0.0 <=2.0.0", async () => {
      const { app, router } = createTestApp();
      const modules: ModuleRegistryEntry[] = [
        {
          id: "nuget-exclusive",
          entry: "/ne/remoteEntry.js",
          version: "1.0.0",
          compatibleWith: { framework: "(1.0.0,2.0.0]" },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(satisfies).toHaveBeenCalledWith(
        expect.any(String),
        ">1.0.0 <=2.0.0",
      );
    });

    it("converts [1.2.4,] to >=1.2.4 (open upper bound)", async () => {
      const { app, router } = createTestApp();
      const modules: ModuleRegistryEntry[] = [
        {
          id: "nuget-open",
          entry: "/no/remoteEntry.js",
          version: "1.0.0",
          compatibleWith: { framework: "[1.2.4,]" },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(satisfies).toHaveBeenCalledWith(
        expect.any(String),
        ">=1.2.4",
      );
    });

    it("passes through npm-style ranges like ^1.2.0 unchanged", async () => {
      const { app, router } = createTestApp();
      const modules: ModuleRegistryEntry[] = [
        {
          id: "npm-range",
          entry: "/npm/remoteEntry.js",
          version: "1.0.0",
          compatibleWith: { framework: "^1.2.0" },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(satisfies).toHaveBeenCalledWith(
        expect.any(String),
        "^1.2.0",
      );
    });

    it("passes through >=1.0.0 unchanged", async () => {
      const { app, router } = createTestApp();
      const modules: ModuleRegistryEntry[] = [
        {
          id: "gte-range",
          entry: "/gte/remoteEntry.js",
          version: "1.0.0",
          compatibleWith: { framework: ">=1.0.0" },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

      await dynamicModulesPlugin.install!(app, {
        router,
        appName: "test-app",
      });

      expect(satisfies).toHaveBeenCalledWith(
        expect.any(String),
        ">=1.0.0",
      );
    });
  });

  it("sets performance marks in correct order", async () => {
    const { app, router } = createTestApp();

    const modules: ModuleRegistryEntry[] = [
      { id: "mod", entry: "/mod/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

    await dynamicModulesPlugin.install!(app, {
      router,
      appName: "test-app",
    });

    const marks = (performance.mark as any).mock.calls.map((c: any[]) => c[0]);
    expect(marks).toEqual([
      "vc:modules-start",
      "vc:modules-loaded",
      "vc:modules-installed",
      "vc:modules-done",
    ]);
  });

  it("init() receives exactly the deps from SHARED_DEP_NAMES", async () => {
    const modules: ModuleRegistryEntry[] = [
      { id: "test-mod", entry: "http://cdn/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    (loadRemote as any).mockResolvedValue({ default: { install: vi.fn() } });

    const { app, router } = createTestApp();
    await dynamicModulesPlugin.install!(app, { router, appName: "test" });

    const initCall = vi.mocked(init).mock.calls[0][0];
    const sharedKeys = Object.keys(initCall.shared!);
    expect(sharedKeys.sort()).toEqual([...SHARED_DEP_NAMES].sort());
  });
});
