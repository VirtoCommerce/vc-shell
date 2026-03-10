import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import type { Plugin, UserConfig } from "vite";
import { REMOTE_SHARED, SHARED_DEP_NAMES } from "./shared-deps";
import type { DynamicModuleOptions } from "@vite-config/types";
import { cwd } from "node:process";
import { resolve } from "node:path";
import { realpathSync } from "node:fs";

/**
 * Strips CSS/style from shared dependencies and files outside the module root.
 * Remote MF modules should not emit CSS from shared deps (framework, vue, etc.)
 * because the host app already provides all base styles, component CSS, and fonts.
 *
 * Uses SHARED_DEP_NAMES as the single source of truth — the same list that
 * controls JS sharing also controls CSS exclusion.
 */
function stripExternalStyles(): Plugin {
  let normalizedRoot: string;
  const sharedDepPatterns = SHARED_DEP_NAMES.map(name => `/node_modules/${name}/`);

  return {
    name: "strip-external-styles",
    enforce: "pre",
    buildStart() {
      // Resolve symlinks once at build start, not at import time.
      // This handles yarn link, portal:, and other symlink scenarios.
      try {
        normalizedRoot = realpathSync(resolve(cwd()));
      } catch {
        normalizedRoot = resolve(cwd());
      }
    },
    transform(code, id) {
      const isStyleFile = /\.(css|scss|sass|less|styl)$/.test(id) || /type=style/.test(id);
      if (!isStyleFile) return null;

      // Normalize the incoming id to handle symlinked deps
      let normalizedId: string;
      try {
        // Strip query params (e.g. ?type=style) before resolving
        const idPath = id.split("?")[0];
        normalizedId = realpathSync(idPath);
      } catch {
        normalizedId = id.split("?")[0];
      }

      // Rule 1: Strip styles from shared dependencies
      if (sharedDepPatterns.some(p => normalizedId.includes(p))) {
        return { code: "", map: null };
      }

      // Rule 2: Strip styles from files outside the module root (symlink/portal scenario)
      if (!normalizedId.startsWith(normalizedRoot)) {
        return { code: "", map: null };
      }

      // Rule 3: Keep everything else (module's own styles)
      return null;
    },
  };
}

export default function dynamicModuleConfiguration(
  pkg: { name: string; version: string },
  options: DynamicModuleOptions,
): UserConfig {
  const entry = options.entry ?? "./src/modules/index.ts";

  return {
    plugins: [
      stripExternalStyles(),
      vue(),
      federation({
        name: pkg.name,
        filename: "remoteEntry.js",
        exposes: options.exposes ?? {
          "./module": entry,
        },
        shared: { ...REMOTE_SHARED },
        dts: false,
      }),
    ],
    build: {
      target: "esnext",
      outDir: "dist",
    },
  };
}
