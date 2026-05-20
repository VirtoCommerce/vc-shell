import path from "node:path";
import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import type { UserConfig } from "vite";
import { REMOTE_SHARED } from "@vc-shell/mf-config";
import { stripExternalStyles } from "./strip-external-styles";
import type { DynamicModuleOptions } from "./types";
import { viteBladePlugin } from "@vc-shell/config-generator";

export default function dynamicModuleConfiguration(
  pkg: { name: string; version: string },
  options: DynamicModuleOptions,
): UserConfig {
  const entry = options.entry ?? "./src/modules/index.ts";
  const base = process.env.APP_BASE_PATH || `/apps/${pkg.name}/`;
  const remoteName = options.remoteName ?? pkg.name;

  let outDir: string;
  let emptyOutDir: boolean | undefined;
  if (options.appId) {
    const moduleRoot = options.moduleRoot ?? process.cwd();
    outDir = path.resolve(moduleRoot, "plugins", options.appId);
    emptyOutDir = true;
  } else {
    outDir = "dist/mf";
    // emptyOutDir left undefined — preserves Vite's default (auto-clean for inside-root).
  }

  return {
    base,
    plugins: [
      viteBladePlugin(),
      stripExternalStyles(),
      vue(),
      federation({
        name: remoteName,
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
      outDir,
      emptyOutDir,
    },
  };
}
