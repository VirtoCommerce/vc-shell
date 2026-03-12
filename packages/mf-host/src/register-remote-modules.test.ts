import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

// Create a mock loadRemote that we can control per-test
const mockLoadRemote = vi.fn();

// Mock MF runtime BEFORE importing module under test
vi.mock("@module-federation/runtime", () => ({
  createInstance: vi.fn(() => ({ loadRemote: mockLoadRemote })),
}));

// Mock semver
vi.mock("semver", () => ({
  satisfies: vi.fn((version: string, range: string) => {
    const majorRange = range.match(/\^(\d+)/)?.[1];
    const majorVersion = version.split(".")[0];
    if (majorRange) return majorRange === majorVersion;
    return true;
  }),
  coerce: vi.fn((version: string) => {
    const m = version.match(/^(\d+\.\d+\.\d+)/);
    return m ? { version: m[1] } : null;
  }),
}));

// Mock @vc-shell/framework to provide injection keys
// vi.hoisted runs before vi.mock hoisting, making symbols available to the factory
const { MockModulesReadyKey, MockModulesLoadErrorKey } = vi.hoisted(() => ({
  MockModulesReadyKey: Symbol("ModulesReady"),
  MockModulesLoadErrorKey: Symbol("ModulesLoadError"),
}));
vi.mock("@vc-shell/framework", () => ({
  ModulesReadyKey: MockModulesReadyKey,
  ModulesLoadErrorKey: MockModulesLoadErrorKey,
}));

// Mock package.json imports
vi.mock("@vc-shell/framework/package.json", () => ({
  default: { version: "1.2.4" },
}));
vi.mock("vue/package.json", () => ({
  default: { version: "3.5.0" },
}));
vi.mock("vue-router/package.json", () => ({
  default: { version: "4.5.0" },
}));
vi.mock("vue-i18n/package.json", () => ({
  default: { version: "9.10.0" },
}));
vi.mock("lodash-es/package.json", () => ({
  default: { version: "4.17.21" },
}));
vi.mock("@vueuse/core/package.json", () => ({
  default: { version: "10.7.1" },
}));

import { createInstance } from "@module-federation/runtime";
import { satisfies } from "semver";
import { registerRemoteModules, type ModuleRegistryEntry } from "./register-remote-modules";

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

/** Flush all pending microtasks so the fire-and-forget IIFE completes. */
function flushPromises() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe("registerRemoteModules", () => {
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

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(provided.has(MockModulesReadyKey)).toBe(true);
    expect(provided.has(MockModulesLoadErrorKey)).toBe(true);
  });

  it("sets modulesReady=true after loading empty registry", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules: [] }),
    });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    const modulesReady = provided.get(MockModulesReadyKey);
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

    mockLoadRemote
      .mockResolvedValueOnce({ default: fakeModuleA })
      .mockResolvedValueOnce({ default: fakeModuleB })
      .mockResolvedValueOnce({ default: fakeModuleC });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(mockLoadRemote).toHaveBeenCalledTimes(3);
    expect(mockLoadRemote).toHaveBeenCalledWith("mod-a/module");
    expect(mockLoadRemote).toHaveBeenCalledWith("mod-b/module");
    expect(mockLoadRemote).toHaveBeenCalledWith("mod-c/module");

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
    mockLoadRemote.mockResolvedValue({ default: fakeModule });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(createInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "host",
        remotes: [{ name: "reviews", entry: "/reviews/remoteEntry.js", type: "module" }],
      }),
    );
  });

  it("sends POST request with appName and provides dictionary", async () => {
    const { app, router } = createTestApp();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules: [] }),
    });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/frontend-modules",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.appName).toBe("test-app");
    expect(body.provides).toBeDefined();
    expect(body.provides["@vc-shell/framework"]).toBe("1.2.4");
  });

  it("filters incompatible modules by framework version (client-side)", async () => {
    const { app, router } = createTestApp();

    const modules: ModuleRegistryEntry[] = [
      {
        id: "old-module",
        entry: "/modules/old/remoteEntry.js",
        version: "0.1.0",
        compatibleWith: { dependencies: { "@vc-shell/framework": "^2.0.0" } },
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    // Framework version is 1.2.4 (from mocked package.json), module requires ^2.0.0
    expect(mockLoadRemote).not.toHaveBeenCalled();
  });

  it("sets modulesLoadError=true on fetch failure", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    const loadError = provided.get(MockModulesLoadErrorKey);
    expect(loadError.value).toBe(true);
  });

  it("sets modulesReady=true on 401 (not authenticated — silent skip)", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    // 401 means not authenticated — modules are skipped, not an error
    const modulesReady = provided.get(MockModulesReadyKey);
    expect(modulesReady.value).toBe(true);
    const loadError = provided.get(MockModulesLoadErrorKey);
    expect(loadError.value).toBe(false);
  });

  it("sets modulesLoadError=true on non-auth HTTP error", async () => {
    const { app, router } = createTestApp();
    const provided = spyProvide(app);

    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    const loadError = provided.get(MockModulesLoadErrorKey);
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
    mockLoadRemote
      .mockRejectedValueOnce(new Error("Module load failed"))
      .mockResolvedValueOnce({ default: workingModule });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(workingModule.install).toHaveBeenCalled();

    const modulesReady = provided.get(MockModulesReadyKey);
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
    mockLoadRemote.mockResolvedValue(directModule);

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(directModule.install).toHaveBeenCalled();
  });

  it("skips modules with invalid registry entries", async () => {
    const { app, router } = createTestApp();

    const modules = [
      { id: "valid", entry: "/valid/remoteEntry.js", version: "1.0.0" },
      { id: null, entry: "/bad/remoteEntry.js", version: "1.0.0" },
      { id: "no-entry", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    const validModule = { install: vi.fn() };
    mockLoadRemote.mockResolvedValue({ default: validModule });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    expect(mockLoadRemote).toHaveBeenCalledTimes(1);
    expect(mockLoadRemote).toHaveBeenCalledWith("valid/module");
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

      mockLoadRemote.mockResolvedValue({
        default: {
          Rating: { install: ratingInstall },
          Orders: { install: ordersInstall },
        },
      });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

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

      mockLoadRemote.mockResolvedValue({
        default: {
          Rating: { default: { install: ratingInstall } },
        },
      });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

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

      mockLoadRemote.mockResolvedValue(null);

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(mockLoadRemote).toHaveBeenCalledTimes(1);
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

      mockLoadRemote.mockResolvedValue({
        default: {
          __version: "1.0.0",
          count: 42,
          Valid: { install: validInstall },
        },
      });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

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
          compatibleWith: { dependencies: { "@vc-shell/framework": "[1.0.0,2.0.0)" } },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

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
          compatibleWith: { dependencies: { "@vc-shell/framework": "(1.0.0,2.0.0]" } },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

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
          compatibleWith: { dependencies: { "@vc-shell/framework": "[1.2.4,]" } },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

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
          compatibleWith: { dependencies: { "@vc-shell/framework": "^1.2.0" } },
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ modules }),
      });

      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(satisfies).toHaveBeenCalledWith(
        expect.any(String),
        "^1.2.0",
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

    mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

    registerRemoteModules(app, { router, appName: "test-app" });
    await flushPromises();

    const marks = (performance.mark as any).mock.calls.map((c: any[]) => c[0]);
    expect(marks).toEqual([
      "vc:modules-start",
      "vc:modules-loaded",
      "vc:modules-installed",
      "vc:modules-done",
    ]);
  });

  it("createInstance() receives all 7 shared deps", async () => {
    const modules: ModuleRegistryEntry[] = [
      { id: "test-mod", entry: "http://cdn/remoteEntry.js", version: "1.0.0" },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ modules }),
    });

    mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

    const { app, router } = createTestApp();
    registerRemoteModules(app, { router, appName: "test" });
    await flushPromises();

    const createInstanceCall = vi.mocked(createInstance).mock.calls[0][0];
    const sharedKeys = Object.keys(createInstanceCall.shared!);
    const expectedDeps = ["vue", "vue-router", "vue-i18n", "vee-validate", "lodash-es", "@vueuse/core", "@vc-shell/framework"];
    expect(sharedKeys.sort()).toEqual(expectedDeps.sort());
  });
});
