import type { Plugin } from "vite";
import { SHARED_DEP_NAMES } from "@vc-shell/mf-config";
import { cwd } from "node:process";
import { resolve } from "node:path";
import { realpathSync } from "node:fs";

/**
 * Strips CSS from shared dependencies and files outside the module root: the host app
 * already provides base styles, component CSS and fonts.
 *
 * SHARED_DEP_NAMES is the single source of truth — the list that controls JS sharing also
 * controls CSS exclusion.
 */
export function stripExternalStyles(): Plugin {
  let normalizedRoot: string;
  const sharedDepPatterns = SHARED_DEP_NAMES.map((name) => `/node_modules/${name}/`);

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
      if (sharedDepPatterns.some((p) => normalizedId.includes(p))) {
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
