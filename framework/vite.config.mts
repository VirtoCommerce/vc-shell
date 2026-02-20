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
  "@shared": `${normalizedFrameworkRoot}/shared`,
  "@shared/": `${normalizedFrameworkRoot}/shared/`,
  "@assets": `${normalizedFrameworkRoot}/assets`,
  "@assets/": `${normalizedFrameworkRoot}/assets/`,
  "@locales": `${normalizedFrameworkRoot}/locales`,
  "@locales/": `${normalizedFrameworkRoot}/locales/`,
  "@vc-shell/framework/": `${normalizedFrameworkRoot}/`,
  "@vc-shell/framework": path.resolve(frameworkRoot, "index.ts"),
};

export default getLibraryConfiguration({
  resolve: {
    alias: frameworkAliases,
  },
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
    libAssetsPlugin(),
  ],
  build: {
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: mode === "development",
    lib: {
      entry: path.resolve(frameworkRoot, "index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "vue-router", "vee-validate", "@vc-shell/config-generator"],
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

        // Show warning by default
        if (defaultHandler) defaultHandler(warning);
      },
    },
  },
  envPrefix: "APP_",
});
