export interface SharedDepConfig {
  singleton?: boolean;
  requiredVersion?: string;
  eager?: boolean;
  import?: false | string;
}

/**
 * Base shared dependency definitions for Module Federation.
 * Both host and remote use the same dep list with singleton negotiation.
 *
 * Subpath entries (e.g. "@vc-shell/framework/ui") are required because Module
 * Federation matches `shared` by exact import specifier — without them, every
 * `from "@vc-shell/framework/ui"` import gets bundled into the remote chunk,
 * producing duplicate framework copies and breaking provide/inject DI.
 */
export const SHARED_DEPS_BASE: Record<string, Omit<SharedDepConfig, "import">> = {
  vue: { singleton: true, requiredVersion: "^3.4.0" },
  "vue-router": { singleton: true, requiredVersion: "^4.0.0 || ^5.0.0" },
  "vue-i18n": { singleton: true, requiredVersion: "^9.0.0 || ^11.0.0" },
  "vee-validate": { singleton: true, requiredVersion: "^4.12.0" },
  "lodash-es": { singleton: true },
  "@vueuse/core": { singleton: true },
  "@vc-shell/framework": { singleton: true, requiredVersion: "^2.0.0" },
  "@vc-shell/framework/ui": { singleton: true, requiredVersion: "^2.0.0" },
  "@vc-shell/framework/ai-agent": { singleton: true, requiredVersion: "^2.0.0" },
  "@vc-shell/framework/extensions": { singleton: true, requiredVersion: "^2.0.0" },
};

/**
 * Canonical list of shared dependency names.
 * This is the SINGLE SOURCE OF TRUTH — loader and build configs import this
 * to build their runtime shared config, ensuring build and runtime stay in sync.
 */
export const SHARED_DEP_NAMES = Object.keys(SHARED_DEPS_BASE) as ReadonlyArray<
  | "vue"
  | "vue-router"
  | "vue-i18n"
  | "vee-validate"
  | "lodash-es"
  | "@vueuse/core"
  | "@vc-shell/framework"
  | "@vc-shell/framework/ui"
  | "@vc-shell/framework/ai-agent"
  | "@vc-shell/framework/extensions"
>;

/**
 * Shared deps for HOST app — bundles all deps (provides them to remotes).
 */
export const DEFAULT_SHARED: Record<string, SharedDepConfig> = { ...SHARED_DEPS_BASE };

/**
 * Shared deps for REMOTE modules — `import: false` prevents bundling fallback chunks.
 * The remote relies entirely on the host to provide these deps at runtime.
 * This eliminates multi-MB fallback bundles (vue, framework, lodash, etc).
 */
export const REMOTE_SHARED: Record<string, SharedDepConfig> = Object.fromEntries(
  Object.entries(SHARED_DEPS_BASE).map(([key, config]) => [key, { ...config, import: false as const }]),
);
