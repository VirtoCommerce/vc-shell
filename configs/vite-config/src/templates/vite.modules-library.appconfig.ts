import { defineConfig, type UserConfig } from "vite";
import { resolve, join } from "node:path";
import { cwd } from "node:process";
import vue from "@vitejs/plugin-vue";

/** Common externals shared across all module library builds */
const DEFAULT_EXTERNALS: (string | RegExp)[] = [
  /node_modules/,
  /^@vc-shell\/framework(\/|$)/,
  "vue",
  "vue-router",
  "vee-validate",
  "vue-i18n",
  "lodash-es",
  "@vueuse/core",
];

export interface ModulesLibraryOptions extends UserConfig {
  /** Entry point relative to cwd. @default "./index.ts" */
  entry?: string;
  /** Output directory relative to cwd. @default "dist" */
  outDir?: string;
  /** Additional external dependencies beyond the defaults */
  externals?: (string | RegExp)[];
}

export default function modulesLibraryConfiguration(options: ModulesLibraryOptions = {}) {
  const { entry = "./index.ts", outDir = "dist", externals = [], ...userConfig } = options;

  const allExternals = [...DEFAULT_EXTERNALS, ...externals];

  return defineConfig({
    build: {
      copyPublicDir: false,
      lib: {
        entry: resolve(cwd(), entry),
        fileName: (_, name) => `${name}.mjs`,
        formats: ["es"],
      },
      outDir: join(cwd(), outDir),
      cssCodeSplit: false,
      rollupOptions: {
        external: allExternals,
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "style.css";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
    plugins: [vue()],
  });
}
