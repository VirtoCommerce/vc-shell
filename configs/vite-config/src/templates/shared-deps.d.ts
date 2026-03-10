export interface SharedDepConfig {
    singleton?: boolean;
    requiredVersion?: string;
    eager?: boolean;
    import?: false | string;
}
/**
 * Canonical list of shared dependency names.
 * This is the SINGLE SOURCE OF TRUTH — loader-mf.ts imports this
 * to build its runtime shared config, ensuring build and runtime stay in sync.
 */
export declare const SHARED_DEP_NAMES: ReadonlyArray<"vue" | "vue-router" | "vue-i18n" | "vee-validate" | "lodash-es" | "@vueuse/core" | "@vc-shell/framework">;
/**
 * Shared deps for HOST app — bundles all deps (provides them to remotes).
 */
export declare const DEFAULT_SHARED: Record<string, SharedDepConfig>;
/**
 * Shared deps for REMOTE modules — `import: false` prevents bundling fallback chunks.
 * The remote relies entirely on the host to provide these deps at runtime.
 * This eliminates multi-MB fallback bundles (vue, framework, lodash, etc).
 */
export declare const REMOTE_SHARED: Record<string, SharedDepConfig>;
//# sourceMappingURL=shared-deps.d.ts.map