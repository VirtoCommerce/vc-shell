import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, type App } from "vue";
import { createRouter, createWebHistory } from "vue-router";

const mockLoadRemote = vi.fn();

vi.mock("@module-federation/runtime", () => ({
  createInstance: vi.fn(() => ({ loadRemote: mockLoadRemote })),
}));

const { MockModulesReadyKey, MockModulesLoadErrorKey } = vi.hoisted(() => ({
  MockModulesReadyKey: Symbol("ModulesReady"),
  MockModulesLoadErrorKey: Symbol("ModulesLoadError"),
}));
vi.mock("@vc-shell/framework", () => ({
  ModulesReadyKey: MockModulesReadyKey,
  ModulesLoadErrorKey: MockModulesLoadErrorKey,
}));

vi.mock("@vc-shell/framework/ui", () => ({}));
vi.mock("@vc-shell/framework/ai-agent", () => ({}));
vi.mock("@vc-shell/framework/extensions", () => ({}));

vi.mock("@vc-shell/framework/package.json", () => ({
  default: { version: "1.2.4" },
}));
vi.mock("vue/package.json", () => ({ default: { version: "3.5.0" } }));
vi.mock("vue-router/package.json", () => ({ default: { version: "4.5.0" } }));
vi.mock("vue-i18n/package.json", () => ({ default: { version: "9.10.0" } }));
vi.mock("lodash-es/package.json", () => ({ default: { version: "4.17.21" } }));
vi.mock("@vueuse/core/package.json", () => ({ default: { version: "10.7.1" } }));

import { createInstance } from "@module-federation/runtime";
import { SHARED_DEPS_BASE } from "@vc-shell/mf-config";
import { registerRemoteModules } from "./register-remote-modules";

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

function flushPromises() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function manifest200(plugins: any[]) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ appId: "test-app", version: "1.0.0", title: "Test", plugins }),
  };
}

function makePlugin(overrides: Record<string, any> = {}) {
  return {
    id: "marketplace-reviews",
    version: "1.0.0",
    entry: { type: "script", path: "/Modules/$(X)/plugins/test-app/remoteEntry.js" },
    contentFiles: [],
    remote: { name: "VirtoCommerce.MarketplaceReviews", exposed: "./Module" },
    ...overrides,
  };
}

describe("registerRemoteModules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as any;
    global.performance = { mark: vi.fn() } as any;
  });

  describe("provide setup", () => {
    it("provides ModulesReadyKey and ModulesLoadErrorKey", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.has(MockModulesReadyKey)).toBe(true);
      expect(provided.has(MockModulesLoadErrorKey)).toBe(true);
    });

    it("sets modulesReady=true after empty manifest", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesReadyKey).value).toBe(true);
    });
  });

  describe("fetch — endpoint and method", () => {
    it("sends GET to /api/apps/<appName>/manifest with no body", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/apps/test-app/manifest",
        expect.objectContaining({
          method: "GET",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        }),
      );
      const init = (global.fetch as any).mock.calls[0][1];
      expect(init.body).toBeUndefined();
    });

    it("encodes appName with special characters", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "my/app name" });
      await flushPromises();

      expect(global.fetch).toHaveBeenCalledWith("/api/apps/my%2Fapp%20name/manifest", expect.anything());
    });

    it("uses manifestUrl override when provided", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "test-app", manifestUrl: "https://custom.example/manifest" });
      await flushPromises();

      expect(global.fetch).toHaveBeenCalledWith("https://custom.example/manifest", expect.anything());
    });
  });

  describe("mapping — plugin → remote", () => {
    it("loads one valid plugin via createInstance + loadRemote", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(createInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "host",
          remotes: [
            {
              name: "VirtoCommerce.MarketplaceReviews",
              entry: "/Modules/$(X)/plugins/test-app/remoteEntry.js",
              type: "module",
            },
          ],
        }),
      );
      expect(mockLoadRemote).toHaveBeenCalledWith("VirtoCommerce.MarketplaceReviews/Module");
    });

    it("appends ?v=<hash> to entry url when plugin.entry.hash is set", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(
        manifest200([
          makePlugin({
            entry: { type: "script", path: "/plugins/p/remoteEntry.js", hash: "abc/def 1" },
          }),
        ]),
      );
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      const remotes = (createInstance as any).mock.calls[0][0].remotes;
      expect(remotes[0].entry).toBe("/plugins/p/remoteEntry.js?v=abc%2Fdef%201");
    });

    it("leaves entry url untouched when hash is absent", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      const remotes = (createInstance as any).mock.calls[0][0].remotes;
      expect(remotes[0].entry).toBe("/Modules/$(X)/plugins/test-app/remoteEntry.js");
    });

    it("strips leading ./ from remote.exposed when building loadRemote key", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(
        manifest200([makePlugin({ remote: { name: "ModX", exposed: "./Module" } })]),
      );
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(mockLoadRemote).toHaveBeenCalledWith("ModX/Module");
    });

    it("filters out plugins missing required fields", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      (global.fetch as any).mockResolvedValue(
        manifest200([
          makePlugin(),
          { id: "no-entry", version: "1", remote: { name: "X", exposed: "./M" } },
          { id: "no-remote", version: "1", entry: { type: "script", path: "/x" } },
          makePlugin({ id: null }),
        ]),
      );
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(mockLoadRemote).toHaveBeenCalledTimes(1);
      expect(provided.get(MockModulesReadyKey).value).toBe(true);
    });

    it("does nothing when plugins array is empty", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(createInstance).not.toHaveBeenCalled();
      expect(mockLoadRemote).not.toHaveBeenCalled();
      expect(provided.get(MockModulesReadyKey).value).toBe(true);
    });
  });

  describe("error handling", () => {
    function nonOk(status: number) {
      return { ok: false, status };
    }

    it("HTTP 401 → warn + skip, modulesReady=true, modulesLoadError=false", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      (global.fetch as any).mockResolvedValue(nonOk(401));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesReadyKey).value).toBe(true);
      expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("HTTP 403 → warn + skip", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      (global.fetch as any).mockResolvedValue(nonOk(403));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesReadyKey).value).toBe(true);
      expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
    });

    it("HTTP 404 → warn + skip", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      (global.fetch as any).mockResolvedValue(nonOk(404));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesReadyKey).value).toBe(true);
      expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
    });

    it("HTTP 500 → warn + skip (same policy)", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      (global.fetch as any).mockResolvedValue(nonOk(500));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesReadyKey).value).toBe(true);
      expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
    });

    it("network/throw error → modulesLoadError=true", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      (global.fetch as any).mockRejectedValue(new Error("Network down"));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesLoadErrorKey).value).toBe(true);
      expect(provided.get(MockModulesReadyKey).value).toBe(false);
    });

    it("continues installing remaining plugins when one loadRemote fails", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.spyOn(console, "warn").mockImplementation(() => undefined);

      (global.fetch as any).mockResolvedValue(
        manifest200([
          makePlugin({ id: "broken", remote: { name: "Broken", exposed: "./Module" } }),
          makePlugin({ id: "working", remote: { name: "Working", exposed: "./Module" } }),
        ]),
      );

      const workingInstall = vi.fn();
      mockLoadRemote
        .mockRejectedValueOnce(new Error("boom"))
        .mockResolvedValueOnce({ default: { install: workingInstall } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(workingInstall).toHaveBeenCalled();
      expect(provided.get(MockModulesReadyKey).value).toBe(true);
      expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
    });
  });

  describe("resolvePlugins — sub-module collection format", () => {
    it("installs all sub-modules from { default: { Rating: { install }, Orders: { install } } }", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));

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
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));

      const ratingInstall = vi.fn();
      mockLoadRemote.mockResolvedValue({
        default: { Rating: { default: { install: ratingInstall } } },
      });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(ratingInstall).toHaveBeenCalled();
    });

    it("handles module that exports install directly (not as default)", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));

      const directInstall = vi.fn();
      mockLoadRemote.mockResolvedValue({ install: directInstall });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(directInstall).toHaveBeenCalled();
    });

    it("skips a plugin whose exports yield no install (null exports)", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));
      mockLoadRemote.mockResolvedValue(null);

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(mockLoadRemote).toHaveBeenCalledTimes(1);
      expect(provided.get(MockModulesReadyKey).value).toBe(true);
    });
  });

  describe("shared scope", () => {
    it("createInstance receives every shared dep declared in SHARED_DEPS_BASE", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      const sharedKeys = Object.keys((createInstance as any).mock.calls[0][0].shared);
      expect(sharedKeys.sort()).toEqual(Object.keys(SHARED_DEPS_BASE).sort());
      expect(sharedKeys).toContain("@vc-shell/framework");
      expect(sharedKeys).toContain("@vc-shell/framework/ui");
    });
  });

  describe("performance marks", () => {
    it("emits start → loaded → installed → done in order on the happy path", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));
      mockLoadRemote.mockResolvedValue({ default: { install: vi.fn() } });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      const marks = (performance.mark as any).mock.calls.map((c: any[]) => c[0]);
      expect(marks).toEqual(["vc:modules-start", "vc:modules-loaded", "vc:modules-installed", "vc:modules-done"]);
    });

    it("emits start → done (no loaded/installed) when manifest returns 401", async () => {
      const { app, router } = createTestApp();
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      (global.fetch as any).mockResolvedValue({ ok: false, status: 401 });

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      const marks = (performance.mark as any).mock.calls.map((c: any[]) => c[0]);
      expect(marks).toEqual(["vc:modules-start", "vc:modules-done"]);
    });
  });

  describe("resilience — manifest timeout", () => {
    it("manifest fetch that never settles → modulesReady=true after the budget, warn, no loadError", async () => {
      vi.useFakeTimers();
      try {
        const { app, router } = createTestApp();
        const provided = spyProvide(app);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        // Never settles — only the timeout can end the wait.
        (global.fetch as any).mockReturnValue(new Promise(() => {}));

        registerRemoteModules(app, { router, appName: "test-app", manifestTimeoutMs: 5000 });
        await vi.advanceTimersByTimeAsync(5001);

        expect(provided.get(MockModulesReadyKey).value).toBe(true);
        expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
      } finally {
        vi.useRealTimers();
      }
    });

    it("respects a custom manifestTimeoutMs (does not fire at the default)", async () => {
      vi.useFakeTimers();
      try {
        const { app, router } = createTestApp();
        const provided = spyProvide(app);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        (global.fetch as any).mockReturnValue(new Promise(() => {}));

        registerRemoteModules(app, { router, appName: "test-app", manifestTimeoutMs: 1000 });
        await vi.advanceTimersByTimeAsync(1001);

        expect(provided.get(MockModulesReadyKey).value).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it("real AbortError (DOMException) from fetch → treated as skip, not loadError", async () => {
      const { app, router } = createTestApp();
      const provided = spyProvide(app);
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      // Simulates AbortSignal.timeout() firing and fetch rejecting with the real DOMException.
      (global.fetch as any).mockRejectedValue(new DOMException("aborted", "AbortError"));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      expect(provided.get(MockModulesReadyKey).value).toBe(true);
      expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("passes an AbortSignal to fetch so the manifest request is actually abortable", async () => {
      const { app, router } = createTestApp();
      (global.fetch as any).mockResolvedValue(manifest200([]));

      registerRemoteModules(app, { router, appName: "test-app" });
      await flushPromises();

      const init = (global.fetch as any).mock.calls[0][1];
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe("resilience — remote load timeout", () => {
    it("a remote whose loadRemote never settles fails after the budget; others still install", async () => {
      vi.useFakeTimers();
      try {
        const { app, router } = createTestApp();
        const provided = spyProvide(app);
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        (global.fetch as any).mockResolvedValue(
          manifest200([
            makePlugin({ id: "hanging", remote: { name: "Hanging", exposed: "./Module" } }),
            makePlugin({ id: "working", remote: { name: "Working", exposed: "./Module" } }),
          ]),
        );
        const workingInstall = vi.fn();
        mockLoadRemote
          .mockReturnValueOnce(new Promise(() => {})) // hanging — only the timeout ends it
          .mockResolvedValueOnce({ default: { install: workingInstall } });

        registerRemoteModules(app, { router, appName: "test-app", loadTimeoutMs: 1000 });
        await vi.advanceTimersByTimeAsync(1001);

        expect(workingInstall).toHaveBeenCalled();
        expect(provided.get(MockModulesReadyKey).value).toBe(true);
        // A failed remote is fail-open: shell renders, no hard error.
        expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
        expect(error).toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it("respects a custom loadTimeoutMs (does not resolve before the budget)", async () => {
      vi.useFakeTimers();
      try {
        const { app, router } = createTestApp();
        const provided = spyProvide(app);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        (global.fetch as any).mockResolvedValue(manifest200([makePlugin()]));
        mockLoadRemote.mockReturnValue(new Promise(() => {}));

        registerRemoteModules(app, { router, appName: "test-app", loadTimeoutMs: 2000 });

        await vi.advanceTimersByTimeAsync(1999);
        expect(provided.get(MockModulesReadyKey).value).toBe(false);

        await vi.advanceTimersByTimeAsync(2);
        expect(provided.get(MockModulesReadyKey).value).toBe(true);
        expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it("logs a late settle when a timed-out remote's loadRemote eventually resolves", async () => {
      vi.useFakeTimers();
      try {
        const { app, router } = createTestApp();
        const provided = spyProvide(app);
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        (global.fetch as any).mockResolvedValue(manifest200([makePlugin({ id: "late-settler" })]));

        let resolveLoad: (value: unknown) => void;
        mockLoadRemote.mockReturnValueOnce(
          new Promise((resolve) => {
            resolveLoad = resolve;
          }),
        );

        registerRemoteModules(app, { router, appName: "test-app", loadTimeoutMs: 1000 });

        // Advance past the budget — the remote should be treated as failed.
        await vi.advanceTimersByTimeAsync(1001);
        expect(provided.get(MockModulesReadyKey).value).toBe(true);
        expect(provided.get(MockModulesLoadErrorKey).value).toBe(false);
        expect(error).toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("after its"));

        // Now let the underlying loadRemote promise settle, well past the budget.
        resolveLoad!({ default: { install: vi.fn() } });
        await vi.advanceTimersByTimeAsync(1000);

        expect(warn).toHaveBeenCalledWith(expect.stringContaining("after its"));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("late-settler"));
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
