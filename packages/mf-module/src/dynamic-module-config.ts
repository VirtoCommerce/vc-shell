import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import type { UserConfig } from "vite";
import { REMOTE_SHARED } from "@vc-shell/mf-config";
import { stripExternalStyles } from "./strip-external-styles";
import { preserveStandaloneHtml } from "./preserve-standalone-html";
import type { DynamicModuleOptions } from "./types";
import { viteBladePlugin } from "@vc-shell/config-generator";

export default function dynamicModuleConfiguration(
  pkg: { name: string; version: string },
  options: DynamicModuleOptions,
): UserConfig {
  const entry = options.entry ?? "./src/modules/index.ts";
  const base = process.env.APP_BASE_PATH || `/apps/${pkg.name}/`;

  return {
    base,
    plugins: [
      preserveStandaloneHtml(),
      viteBladePlugin(),
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
      emptyOutDir: false,
    },
  };
}
