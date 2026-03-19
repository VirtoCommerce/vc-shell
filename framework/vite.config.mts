import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePath } from "vite";
import { checker } from "vite-plugin-checker";
import libAssetsPlugin from "@laynezh/vite-plugin-lib-assets";

const mode = process.env.APP_ENV as string;
const frameworkRoot = path.dirname(fileURLToPath(import.meta.url));
const normalizedFrameworkRoot = normalizePath(frameworkRoot);
const frameworkAliases = {
  "@framework": normalizedFrameworkRoot,
  "@core": `${normalizedFrameworkRoot}/core`,
  "@core/": `${normalizedFrameworkRoot}/core/`,
  "@ui": `${normalizedFrameworkRoot}/ui`,
  "@ui/": `${normalizedFrameworkRoot}/ui/`,
  "@assets": `${normalizedFrameworkRoot}/assets`,
  "@assets/": `${normalizedFrameworkRoot}/assets/`,
  "@locales": `${normalizedFrameworkRoot}/locales`,
  "@locales/": `${normalizedFrameworkRoot}/locales/`,
  "@vc-shell/framework/": `${normalizedFrameworkRoot}/`,
  "@vc-shell/framework": path.resolve(frameworkRoot, "index.ts"),
  "@shell": `${normalizedFrameworkRoot}/shell`,
  "@shell/": `${normalizedFrameworkRoot}/shell/`,
  "@modules": `${normalizedFrameworkRoot}/modules`,
  "@modules/": `${normalizedFrameworkRoot}/modules/`,
};

export default getLibraryConfiguration({
  resolve: {
    alias: frameworkAliases,
  },
  plugins: [
    vue(),
    checker({
      vueTsc: true,
      enableBuild: false,
    }),
    libAssetsPlugin(),
  ],
  build: {
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: mode === "development",
    lib: {
      entry: {
        framework: path.resolve(frameworkRoot, "index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "vue-router", "vee-validate", "@vc-shell/config-generator"],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
      },
      onwarn(warning, defaultHandler) {
        // Ignore all warnings with strings /*#__PURE__*/
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          typeof warning.message === "string" &&
          warning.message.includes("/*#__PURE__*/")
        ) {
          return;
        }

        // Ignore warnings for specific libraries
        if (typeof warning.message === "string" && warning.message.includes("@microsoft/signalr")) {
          return;
        }

        // Suppress empty chunk warnings (files already removed by vc-remove-empty-chunks plugin)
        if (warning.code === "EMPTY_BUNDLE") return;

        // notification.ts is intentionally dynamically imported in useAsync/pendingErrorNotifications
        // to break circular dependency, but also statically imported elsewhere — Vite warns about this
        if (
          warning.plugin === "vite:reporter" &&
          typeof warning.message === "string" &&
          warning.message.includes("dynamic import will not move module into another chunk")
        ) {
          return;
        }

        // Show warning by default
        if (defaultHandler) defaultHandler(warning);
      },
    },
  },
  envPrefix: "APP_",
});
