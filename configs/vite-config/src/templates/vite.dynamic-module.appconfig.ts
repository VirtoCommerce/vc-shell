import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import type { Plugin, UserConfig } from "vite";
import { REMOTE_SHARED } from "./shared-deps";
import type { DynamicModuleOptions } from "@vite-config/types";
import { cwd } from "node:process";
import { resolve } from "node:path";
import { realpathSync } from "node:fs";

/**
 * Strips CSS/style from ALL files outside the module's own source directory.
 * Remote MF modules should not emit CSS from shared deps (framework, vue, etc.)
 * because the host app already provides all base styles, component CSS, and fonts.
 *
 * Works regardless of how deps are resolved (node_modules, portal:, link:, etc.)
 */
function stripExternalStyles(): Plugin {
  let normalizedRoot: string;

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
      // Normalize the incoming id as well to handle symlinked deps
      let normalizedId: string;
      try {
        // Strip query params (e.g. ?type=style) before resolving
        const idPath = id.split("?")[0];
        normalizedId = realpathSync(idPath);
      } catch {
        normalizedId = id;
      }

      if (/type=style/.test(id) && !normalizedId.startsWith(normalizedRoot)) {
        return { code: "", map: null };
      }
      if (/\.(css|scss|sass|less|styl)$/.test(id) && !normalizedId.startsWith(normalizedRoot)) {
        return { code: "", map: null };
      }
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
