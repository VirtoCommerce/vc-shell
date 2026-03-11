import { ref, type App, type Plugin } from "vue";
import type { Router } from "vue-router";
import { ModulesReadyKey, ModulesLoadErrorKey } from "@framework/injection-keys";
import * as semver from "semver";
import { init, loadRemote } from "@module-federation/enhanced/runtime";
import { createLogger } from "@core/utilities";
import packageJson from "../../../package.json";

// Shared deps — the host provides these to MF remotes at runtime.
// The canonical dep list is defined in shared-deps.ts (single source of truth).
// Runtime init() needs explicit `lib` references because the build-time
// federation plugin only handles bundling, not runtime module provision.
import * as Vue from "vue";
import * as VueRouter from "vue-router";
import * as VueI18n from "vue-i18n";
import * as VeeValidate from "vee-validate";
import * as LodashEs from "lodash-es";
import * as VueuseCore from "@vueuse/core";
// Read versions from package.json to avoid rollup warnings about missing named exports
import vueI18nPkg from "vue-i18n/package.json";
import lodashEsPkg from "lodash-es/package.json";
import vueusePkg from "@vueuse/core/package.json";
import vueRouterPkg from "vue-router/package.json";

const logger = createLogger("module-loader-mf");

const REGISTRY_URL = "/api/frontend-modules";
const frameworkVersion: string = packageJson.version;

const SHARED_LIBS_STATIC: Record<string, { lib: () => unknown; version: string; requiredVersion: string }> = {
  vue:                    { lib: () => Vue,         version: Vue.version,               requiredVersion: "^3.4.0" },
  "vue-router":           { lib: () => VueRouter,   version: vueRouterPkg.version,      requiredVersion: "^4.0.0" },
  "vue-i18n":             { lib: () => VueI18n,     version: vueI18nPkg.version,        requiredVersion: "^9.0.0" },
  "vee-validate":         { lib: () => VeeValidate, version: (VeeValidate as any).version ?? "4.0.0", requiredVersion: "^4.0.0" },
  "lodash-es":            { lib: () => LodashEs,    version: lodashEsPkg.version,       requiredVersion: "^4.0.0" },
  "@vueuse/core":         { lib: () => VueuseCore,  version: vueusePkg.version,         requiredVersion: "^10.0.0" },
};

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

export interface DynamicModulesPluginOptions {
  router: Router;
  appName: string;
}

/**
 * Resolve Vue plugin(s) from MF module exports.
 * Supports:
 *  - Single plugin: `export default { install }` or `export { install }`
 *  - Sub-module collection: `export default { Rating: { install }, Orders: { install } }`
 */
function resolvePlugins(exports: unknown): Plugin[] {
  const mod = exports as Record<string, any> | null;
  if (!mod) return [];

  // Single plugin: export default { install }
  if (mod.default?.install) return [mod.default];
  // Single plugin: export { install }
  if (mod.install) return [mod as Plugin];

  // Sub-module collection: export default { Rating: { install }, ... }
  // Handles both direct plugins and namespace imports (import * as X → { default: { install } })
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

/**
 * Convert NuGet-style version range notation to human-readable form.
 * `[1.2.4,2.0.0)` → `>=1.2.4 <2.0.0`, `[1.2.4,]` → `>=1.2.4`
 * Non-NuGet ranges (e.g. `^1.2.0`) are returned as-is.
 */
function humanizeRange(range: string): string {
  // Exact version: [1.2.4]
  const exact = range.match(/^\[\s*([^\],]+?)\s*\]$/);
  if (exact) return exact[1];

  // Range: [lower,upper) or (lower,upper]
  const m = range.match(/^([[\(])\s*([^,]*?)\s*,\s*([^)\]]*?)\s*([)\]])$/);
  if (!m) return range;

  const [, openBracket, lower, upper, closeBracket] = m;
  const parts: string[] = [];

  if (lower) {
    parts.push(`${openBracket === "[" ? ">=" : ">"}${lower}`);
  }
  if (upper) {
    parts.push(`${closeBracket === "]" ? "<=" : "<"}${upper}`);
  }

  return parts.join(" ") || range;
}

export const dynamicModulesPlugin: Plugin = {
  async install(app: App, options: DynamicModulesPluginOptions) {
    const modulesReady = ref(false);
    const modulesLoadError = ref(false);

    app.provide(ModulesReadyKey, modulesReady);
    app.provide(ModulesLoadErrorKey, modulesLoadError);

    try {
      performance.mark("vc:modules-start");

      // Lazy-load the framework namespace to avoid circular dependency
      // (loader-mf.ts is part of the framework it provides to MF remotes)
      const Framework = await import("@vc-shell/framework");
      const SHARED_LIBS: Record<string, { lib: () => unknown; version: string; requiredVersion: string }> = {
        ...SHARED_LIBS_STATIC,
        "@vc-shell/framework": { lib: () => Framework, version: frameworkVersion, requiredVersion: `^${frameworkVersion}` },
      };

      // 1. Build provides dictionary from shared libs versions
      const provides: Record<string, string> = {};
      for (const [name, entry] of Object.entries(SHARED_LIBS)) {
        provides[name] = entry.version;
      }

      // 2. Fetch module registry from API (POST with appName + provides)
      const response = await fetch(REGISTRY_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: options.appName, provides }),
      });
      if (response.status === 401 || response.status === 403) {
        logger.info("Not authenticated — skipping dynamic modules.");
        modulesReady.value = true;
        performance.mark("vc:modules-done");
        return;
      }
      if (!response.ok) {
        throw new Error(`Registry fetch failed: ${response.status} ${response.statusText}`);
      }
      const registry: ModuleRegistry = await response.json();
      const rawModules = registry.modules;
      const modules = Array.isArray(rawModules)
        ? rawModules.filter(
            (m): m is ModuleRegistryEntry =>
              typeof m?.id === "string" && typeof m?.entry === "string" && typeof m?.version === "string",
          )
        : [];

      // 3. Client-side compatibility filter (safety net — server already filters)
      const compatible = modules.filter((mod) => {
        const deps = mod.compatibleWith?.dependencies;
        if (!deps) {
          return true;
        }
        const fwRange = deps["@vc-shell/framework"];
        if (!fwRange) {
          return true;
        }
        const range = humanizeRange(fwRange);
        // Prerelease versions (e.g. 1.2.4-beta.8) are less than the release (1.2.4)
        // in semver, which would incorrectly exclude them from ranges like >=1.2.4.
        // Coerce to release version so prereleases are treated as compatible.
        const coerced = semver.coerce(frameworkVersion)?.version ?? frameworkVersion;
        const isCompatible = semver.satisfies(coerced, range);
        if (!isCompatible) {
          logger.warn(
            `Module "${mod.id}" v${mod.version} requires framework ${range}, ` +
              `but current is ${frameworkVersion}. Skipping.`,
          );
        }
        return isCompatible;
      });

      if (compatible.length === 0) {
        logger.info("No compatible dynamic modules to load.");
        modulesReady.value = true;
        performance.mark("vc:modules-done");
        return;
      }

      // 4. Initialize MF runtime with all remotes and shared deps
      const shared: Record<string, any> = {};
      for (const [name, entry] of Object.entries(SHARED_LIBS)) {
        shared[name] = {
          version: entry.version,
          lib: entry.lib,
          shareConfig: { singleton: true, requiredVersion: entry.requiredVersion },
        };
      }

      init({
        name: "host",
        remotes: compatible.map((mod) => ({
          name: mod.id,
          entry: mod.entry,
          type: "module",
        })),
        shared,
      });

      // 5. Load all modules in parallel
      const loadResults = await Promise.allSettled(
        compatible.map(async (mod) => ({
          mod,
          exports: await loadRemote(`${mod.id}/module`),
        })),
      );

      performance.mark("vc:modules-loaded");

      // 6. Separate successes and failures
      const loaded: { mod: ModuleRegistryEntry; exports: unknown }[] = [];
      const failed: { mod: ModuleRegistryEntry; error: unknown }[] = [];

      for (let i = 0; i < loadResults.length; i++) {
        const result = loadResults[i];
        if (result.status === "fulfilled") {
          loaded.push(result.value);
        } else {
          failed.push({ mod: compatible[i], error: result.reason });
        }
      }

      // 7. Log failures
      for (const { mod, error } of failed) {
        logger.error(`Failed to load module "${mod.id}":`, error);
      }

      // 8. Install loaded modules (sequential — app.use is not thread-safe)
      for (const { mod, exports } of loaded) {
        const plugins = resolvePlugins(exports);
        if (plugins.length > 0) {
          for (const plugin of plugins) {
            app.use(plugin, { router: options.router });
          }
          logger.info(`Module "${mod.id}" v${mod.version} installed (${plugins.length} sub-module(s)).`);
        } else {
          logger.error(
            `Module "${mod.id}" does not export an install function. Skipping.`,
          );
        }
      }

      // 9. Summary log
      if (failed.length > 0) {
        logger.warn(
          `Loaded ${loaded.length}/${compatible.length} modules. Failed: [${failed.map((f) => f.mod.id).join(", ")}]`,
        );
      } else {
        logger.info(`All ${loaded.length} modules loaded successfully.`);
      }

      performance.mark("vc:modules-installed");
      modulesReady.value = true;

      // Re-resolve current route so module-registered routes take effect.
      // Read fullPath AFTER modules install (not before) to avoid stale path
      // if user navigated during async loading.
      const resolvedPath = options.router.currentRoute.value.fullPath;
      if (resolvedPath !== "/") {
        options.router.replace(resolvedPath);
      }

      performance.mark("vc:modules-done");
    } catch (error) {
      logger.error("Module loading failed:", error);
      modulesLoadError.value = true;
      performance.mark("vc:modules-done");
    }
  },
};
