import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * Preserve the standalone index.html across the MF bundle build.
 *
 * MF modules typically have two build steps:
 * 1. `build:app` — standalone app with all dependencies bundled
 * 2. `build:modules-bundle` — MF remote producing `remoteEntry.js`
 *
 * The MF build overwrites index.html with an MF-bootstrapped version
 * that requires a host to provide shared dependencies. This plugin saves
 * the standalone HTML before the build and restores it after all files
 * are written, so direct navigation to `/apps/{name}/` still works.
 *
 * If no pre-existing index.html is found (first build or clean dist),
 * the plugin does nothing — the MF-generated HTML is kept as-is.
 */
export function preserveStandaloneHtml(outDir = "dist"): Plugin {
  let savedHtml: Buffer | null = null;
  const htmlPath = resolve(outDir, "index.html");

  return {
    name: "preserve-standalone-html",
    buildStart() {
      try {
        savedHtml = readFileSync(htmlPath);
      } catch {
        savedHtml = null;
      }
    },
    closeBundle() {
      if (savedHtml) {
        writeFileSync(htmlPath, savedHtml);
      }
    },
  };
}
