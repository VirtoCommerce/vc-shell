import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import * as path from "node:path";
import { checker } from "vite-plugin-checker";

const mode = process.env.APP_ENV as string;

export default getLibraryConfiguration({
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: mode === "development",
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
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
