import { ref, type App, type Plugin } from "vue";
import type { Router } from "vue-router";
import * as semver from "semver";
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

// Read versions from package.json to avoid rollup warnings about missing named exports
import vuePkg from "vue/package.json";
import vueRouterPkg from "vue-router/package.json";
import vueI18nPkg from "vue-i18n/package.json";
import lodashEsPkg from "lodash-es/package.json";
import vueusePkg from "@vueuse/core/package.json";
import frameworkPkg from "@vc-shell/framework/package.json";

const REGISTRY_URL = "/api/frontend-modules";

const RUNTIME_LIBS: Record<string, { lib: () => unknown; version: string }> = {
  vue: { lib: () => Vue, version: vuePkg.version },
  "vue-router": { lib: () => VueRouter, version: vueRouterPkg.version },
  "vue-i18n": { lib: () => VueI18n, version: vueI18nPkg.version },
  "vee-validate": { lib: () => VeeValidate, version: (VeeValidate as any).version ?? "4.0.0" },
  "lodash-es": { lib: () => LodashEs, version: lodashEsPkg.version },
  "@vueuse/core": { lib: () => VueuseCore, version: vueusePkg.version },
  "@vc-shell/framework": { lib: () => Framework, version: frameworkPkg.version },
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

export interface ModuleRegistryEntry {
  id: string;
  entry: string;
  version: string;
  compatibleWith?: {
    dependencies?: Record<string, string>;
    requires?: Record<string, string>;
  };
}

interface ModuleRegistry {
  modules: ModuleRegistryEntry[];
}

export interface RegisterRemoteModulesOptions {
  router: Router;
  appName: string;
}

// --- Helper functions ---

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

/** Convert NuGet-style version range notation to semver. */
function humanizeRange(range: string): string {
  const exact = range.match(/^\[\s*([^\],]+?)\s*\]$/);
  if (exact) return exact[1];
  const m = range.match(/^([[\(])\s*([^,]*?)\s*,\s*([^)\]]*?)\s*([)\]])$/);
  if (!m) return range;
  const [, openBracket, lower, upper, closeBracket] = m;
  const parts: string[] = [];
  if (lower) parts.push(`${openBracket === "[" ? ">=" : ">"}${lower}`);
  if (upper) parts.push(`${closeBracket === "]" ? "<=" : "<"}${upper}`);
  return parts.join(" ") || range;
}

// --- Main function ---

/**
 * Discover and load remote MF modules from the server registry.
 *
 * Call this in your app's main.ts BEFORE app.mount():
 * ```ts
 * import { registerRemoteModules } from "@vc-shell/mf-host";
 * registerRemoteModules(app, { router, appName: "my-app" });
 * ```
 *
 * The function is fire-and-forget (async internally).
 * It provides `ModulesReadyKey` and `ModulesLoadErrorKey` refs via app.provide()
 * so components can react to loading state.
 */
export function registerRemoteModules(app: App, options: RegisterRemoteModulesOptions): void {
  const { ModulesReadyKey, ModulesLoadErrorKey } = Framework;

  const modulesReady = ref(false);
  const modulesLoadError = ref(false);

  // Capture the original URL before the blade router guard can redirect it away.
  // During async module loading, the guard may not find workspaces (not registered yet)
  // and redirect to root — losing the tenant prefix and blade URL.
  const initialUrl = window.location.hash.replace(/^#/, "") || "/";

  app.provide(ModulesReadyKey, modulesReady);
  app.provide(ModulesLoadErrorKey, modulesLoadError);

  // Fire-and-forget async loading
  (async () => {
    try {
      performance.mark("vc:modules-start");

      const frameworkVersion = frameworkPkg.version;

      // 1. Build provides dict
      const provides: Record<string, string> = {};
      for (const [name, entry] of Object.entries(SHARED_LIBS)) {
        provides[name] = entry.version;
      }

      // 2. Fetch registry
      const response = await fetch(REGISTRY_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: options.appName, provides }),
      });
      if (response.status === 401 || response.status === 403) {
        modulesReady.value = true;
        performance.mark("vc:modules-done");
        return;
      }
      if (!response.ok) {
        throw new Error(`Registry fetch failed: ${response.status} ${response.statusText}`);
      }
      const registry: ModuleRegistry = await response.json();
      const modules = Array.isArray(registry.modules)
        ? registry.modules.filter(
            (m): m is ModuleRegistryEntry =>
              typeof m?.id === "string" && typeof m?.entry === "string" && typeof m?.version === "string",
          )
        : [];

      // 3. Compatibility filter
      const compatible = modules.filter((mod) => {
        const fwRange = mod.compatibleWith?.dependencies?.["@vc-shell/framework"];
        if (!fwRange) return true;
        const range = humanizeRange(fwRange);
        const coerced = semver.coerce(frameworkVersion)?.version ?? frameworkVersion;
        const ok = semver.satisfies(coerced, range);
        if (!ok)
          console.warn(
            `[mf-host] Module "${mod.id}" v${mod.version} requires framework ${range}, current ${frameworkVersion}. Skipping.`,
          );
        return ok;
      });

      if (compatible.length === 0) {
        modulesReady.value = true;
        performance.mark("vc:modules-done");
        return;
      }

      // 4. Init MF runtime
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
        remotes: compatible.map((mod) => ({ name: mod.id, entry: mod.entry, type: "module" as const })),
        shared,
      });

      // 5. Load all in parallel
      const results = await Promise.allSettled(
        compatible.map(async (mod) => ({ mod, exports: await mfInstance.loadRemote(`${mod.id}/module`) })),
      );

      performance.mark("vc:modules-loaded");

      const loaded: { mod: ModuleRegistryEntry; exports: unknown }[] = [];
      const failed: { mod: ModuleRegistryEntry; error: unknown }[] = [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === "fulfilled") loaded.push(r.value);
        else failed.push({ mod: compatible[i], error: r.reason });
      }

      for (const { mod, error } of failed) console.error(`[mf-host] Failed to load "${mod.id}":`, error);

      // 6. Install plugins
      for (const { mod, exports } of loaded) {
        const plugins = resolvePlugins(exports);
        if (plugins.length > 0) {
          for (const plugin of plugins) app.use(plugin, { router: options.router });
          console.info(`[mf-host] "${mod.id}" v${mod.version} installed (${plugins.length} sub-module(s)).`);
        } else {
          console.error(`[mf-host] "${mod.id}" has no install function. Skipping.`);
        }
      }

      if (failed.length > 0) {
        console.warn(
          `[mf-host] ${loaded.length}/${compatible.length} modules loaded. Failed: [${failed.map((f) => f.mod.id).join(", ")}]`,
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
