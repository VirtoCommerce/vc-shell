import type { UserConfig } from "vite";

/**
 * Vite config helper for MF host apps.
 * Pre-bundles transitive MF runtime dependency to prevent dev-mode full-reloads.
 */
export function mfHostConfig(): UserConfig {
  return {
    optimizeDeps: {
      include: ["@vc-shell/mf-host > @module-federation/runtime"],
    },
  };
}
