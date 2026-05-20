import { ref, type App, type Plugin } from "vue";
import type { Router } from "vue-router";
import { createInstance } from "@module-federation/runtime";
import { SHARED_DEPS_BASE } from "@vc-shell/mf-config";

// Shared deps — statically imported. No circular dependency because
// this package is separate from @vc-shell/framework.
import * as Vue from "vue";
import * as VueRouter from "vue-router";
import * as VueI18n from "vue-i18n";
import * as VeeValidate from "vee-validate";
import * as LodashEs from "lodash-es";
import * as VueuseCore from "@vueuse/core";
import * as Framework from "@vc-shell/framework";
import * as FrameworkUi from "@vc-shell/framework/ui";
import * as FrameworkAiAgent from "@vc-shell/framework/ai-agent";
import * as FrameworkExtensions from "@vc-shell/framework/extensions";

// Read versions from package.json to avoid rollup warnings about missing named exports
import vuePkg from "vue/package.json";
import vueRouterPkg from "vue-router/package.json";
import vueI18nPkg from "vue-i18n/package.json";
import lodashEsPkg from "lodash-es/package.json";
import vueusePkg from "@vueuse/core/package.json";
import frameworkPkg from "@vc-shell/framework/package.json";

import type { AppManifestResponse } from "@vc-shell/framework";

const RUNTIME_LIBS: Record<string, { lib: () => unknown; version: string }> = {
  vue: { lib: () => Vue, version: vuePkg.version },
  "vue-router": { lib: () => VueRouter, version: vueRouterPkg.version },
  "vue-i18n": { lib: () => VueI18n, version: vueI18nPkg.version },
  "vee-validate": { lib: () => VeeValidate, version: (VeeValidate as any).version ?? "4.0.0" },
  "lodash-es": { lib: () => LodashEs, version: lodashEsPkg.version },
  "@vueuse/core": { lib: () => VueuseCore, version: vueusePkg.version },
  "@vc-shell/framework": { lib: () => Framework, version: frameworkPkg.version },
  // Subpath exports of @vc-shell/framework — must be shared individually because
  // Module Federation matches `shared` by exact import specifier. Without these,
  // every `from "@vc-shell/framework/ui"` import in a remote gets bundled locally,
  // producing a duplicate framework copy and breaking provide/inject DI.
  "@vc-shell/framework/ui": { lib: () => FrameworkUi, version: frameworkPkg.version },
  "@vc-shell/framework/ai-agent": { lib: () => FrameworkAiAgent, version: frameworkPkg.version },
  "@vc-shell/framework/extensions": { lib: () => FrameworkExtensions, version: frameworkPkg.version },
};

const SHARED_LIBS = Object.fromEntries(
  Object.entries(SHARED_DEPS_BASE).map(([name, config]) => {
    const runtime = RUNTIME_LIBS[name];
    if (!runtime) {
      throw new Error(`[mf-host] Missing runtime mapping for shared dep "${name}". Update RUNTIME_LIBS.`);
    }
    return [name, { ...runtime, requiredVersion: config.requiredVersion ?? "*" }];
  }),
);

// --- Types ---

interface ModuleRegistryEntry {
  id: string;
  entry: string;
  version: string;
  remoteName: string;
  exposedKey: string;
}

export interface RegisterRemoteModulesOptions {
  router: Router;
  appName: string;
  /**
   * Optional manifest endpoint override. Defaults to
   * `/api/apps/${encodeURIComponent(appName)}/manifest`.
   * Useful for ops debugging or non-standard deployments.
   */
  manifestUrl?: string;
}

// --- Helper functions ---

function defaultManifestUrl(appName: string): string {
  return `/api/apps/${encodeURIComponent(appName)}/manifest`;
}

function buildEntryUrl(filePath: string, hash?: string): string {
  return hash ? `${filePath}?v=${encodeURIComponent(hash)}` : filePath;
}

function stripLeadingDotSlash(s: string): string {
  return s.replace(/^\.\//, "");
}

/** Resolve Vue plugin(s) from MF module exports. */
function resolvePlugins(exports: unknown): Plugin[] {
  const mod = exports as Record<string, any> | null;
  if (!mod) return [];
  if (mod.default?.install) return [mod.default];
  if (mod.install) return [mod as Plugin];
  const target = mod.default ?? mod;
  const plugins: Plugin[] = [];
  for (const value of Object.values(target)) {
    const v = value as Record<string, any> | null;
    if (!v || typeof v !== "object") continue;
    if ("install" in v) {
      plugins.push(v as Plugin);
    } else if (v.default?.install) {
      plugins.push(v.default);
    }
  }
  return plugins;
}

// --- Main function ---

/**
 * Discover and load remote MF modules from the platform's backoffice
 * modularity manifest endpoint.
 *
 * Call this in your app's main.ts BEFORE app.mount():
 * ```ts
 * import { registerRemoteModules } from "@vc-shell/mf-host";
 * registerRemoteModules(app, { router, appName: "my-app" });
 * ```
 *
 * The function is fire-and-forget (async internally). It provides
 * `ModulesReadyKey` and `ModulesLoadErrorKey` refs via `app.provide()` so
 * components can react to loading state.
 */
export function registerRemoteModules(app: App, options: RegisterRemoteModulesOptions): void {
  const { ModulesReadyKey, ModulesLoadErrorKey } = Framework;

  const modulesReady = ref(false);
  const modulesLoadError = ref(false);

  app.provide(ModulesReadyKey, modulesReady);
  app.provide(ModulesLoadErrorKey, modulesLoadError);

  (async () => {
    try {
      performance.mark("vc:modules-start");

      // 1. Fetch manifest
      const manifestUrl = options.manifestUrl ?? defaultManifestUrl(options.appName);

      const response = await fetch(manifestUrl, {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        // Unified policy: 401/403/404/5xx → warn + skip, no loadError.
        console.warn(
          `[mf-host] manifest endpoint ${manifestUrl} returned HTTP ${response.status}; skipping plugin discovery.`,
        );
        modulesReady.value = true;
        performance.mark("vc:modules-done");
        return;
      }

      const manifest = (await response.json()) as AppManifestResponse;

      // 2. Validate plugins[] structurally (NSwag emits everything as optional)
      const validPlugins = (manifest.plugins ?? []).filter(
        (p) =>
          typeof p?.id === "string" &&
          typeof p?.version === "string" &&
          typeof p?.entry?.path === "string" &&
          typeof p?.remote?.name === "string" &&
          typeof p?.remote?.exposed === "string",
      );

      const entries: ModuleRegistryEntry[] = validPlugins.map((p) => ({
        id: p.id!,
        entry: buildEntryUrl(p.entry!.path!, p.entry!.hash),
        version: p.version!,
        remoteName: p.remote!.name!,
        exposedKey: stripLeadingDotSlash(p.remote!.exposed!),
      }));

      if (entries.length === 0) {
        modulesReady.value = true;
        performance.mark("vc:modules-done");
        return;
      }

      // 3. Init MF runtime
      const shared: Record<string, any> = {};
      for (const [name, entry] of Object.entries(SHARED_LIBS)) {
        shared[name] = {
          version: entry.version,
          lib: entry.lib,
          shareConfig: { singleton: true, requiredVersion: entry.requiredVersion },
        };
      }
      const mfInstance = createInstance({
        name: "host",
        remotes: entries.map((e) => ({ name: e.remoteName, entry: e.entry, type: "module" as const })),
        shared,
      });

      // 4. Load all remotes in parallel
      const results = await Promise.allSettled(
        entries.map(async (e) => ({
          entry: e,
          exports: await mfInstance.loadRemote(`${e.remoteName}/${e.exposedKey}`),
        })),
      );

      performance.mark("vc:modules-loaded");

      const loaded: { entry: ModuleRegistryEntry; exports: unknown }[] = [];
      const failed: { entry: ModuleRegistryEntry; error: unknown }[] = [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled") loaded.push(r.value);
        else failed.push({ entry: entries[i], error: r.reason });
      }

      for (const { entry, error } of failed) {
        console.error(`[mf-host] Failed to load "${entry.id}":`, error);
      }

      // 5. Install plugins
      for (const { entry, exports } of loaded) {
        const plugins = resolvePlugins(exports);
        if (plugins.length > 0) {
          for (const plugin of plugins) app.use(plugin, { router: options.router });
          console.info(`[mf-host] "${entry.id}" v${entry.version} installed (${plugins.length} sub-module(s)).`);
        } else {
          console.error(`[mf-host] "${entry.id}" has no install function. Skipping.`);
        }
      }

      if (failed.length > 0) {
        console.warn(
          `[mf-host] ${loaded.length}/${entries.length} plugins loaded. Failed: [${failed
            .map((f) => f.entry.id)
            .join(", ")}]`,
        );
      }

      performance.mark("vc:modules-installed");
      modulesReady.value = true;

      const resolvedPath = options.router.currentRoute.value.fullPath;
      if (resolvedPath !== "/") options.router.replace(resolvedPath);

      performance.mark("vc:modules-done");
    } catch (error) {
      console.error("[mf-host] Module loading failed:", error);
      modulesLoadError.value = true;
      performance.mark("vc:modules-done");
    }
  })();
}
