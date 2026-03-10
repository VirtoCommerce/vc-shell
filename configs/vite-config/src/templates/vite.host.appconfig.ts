import { federation } from "@module-federation/vite";
import type { UserConfig } from "vite";
import { DEFAULT_SHARED, type SharedDepConfig } from "./shared-deps";

export interface HostFederationOptions {
  sharedDeps?: Record<string, SharedDepConfig>;
}

/**
 * Vite plugin configuration for Module Federation HOST apps.
 *
 * **Build-time only.** This configures the MF build plugin so Vite can:
 * - Resolve `import` statements to shared deps without bundling duplicates
 * - Generate proper chunk structure for MF host semantics
 *
 * **Does NOT replace runtime init().** The runtime loader (`loader-mf.ts`)
 * still calls `@module-federation/enhanced/runtime` `init()` to register
 * actual module instances (`lib: () => Vue`, etc.) and discover remotes
 * from the server registry. Build-time plugin handles bundling;
 * runtime init handles module provision.
 *
 * @example
 * ```ts
 * // vite.config.ts (host app)
 * import { getApplicationConfiguration, getHostFederationConfig } from "@vc-shell/config-generator";
 * import { mergeConfig } from "vite";
 *
 * export default mergeConfig(
 *   getApplicationConfiguration(),
 *   getHostFederationConfig(),
 * );
 * ```
 */
export function getHostFederationConfig(
  options?: HostFederationOptions,
): UserConfig {
  return {
    plugins: [
      federation({
        name: "host",
        remotes: {},
        shared: {
          ...DEFAULT_SHARED,
          ...options?.sharedDeps,
        },
      }),
    ],
  };
}
