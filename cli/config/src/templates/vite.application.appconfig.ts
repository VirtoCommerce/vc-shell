import vue from "@vitejs/plugin-vue";
import { loadEnv } from "vite";
import typescript from "@rollup/plugin-typescript";
import * as fs from "fs";

// Get actual package version from package.json
const packageJson = fs.readFileSync(process.cwd() + "/package.json");
const version = JSON.parse(packageJson.toString()).version || 0;

// Build configuration for the application
const mode = process.env.APP_ENV as string;
process.env = {
  ...process.env,
  ...loadEnv(mode, process.cwd(), "APP_"),
};
const TSCONFIG = process.cwd() + "/tsconfig.json";
const TSCONFIG_BUILD = process.cwd() + "/tsconfig.build.json";
const tsconfigFile = mode === "production" ? TSCONFIG_BUILD : TSCONFIG;

// "Not so smart" override: https://github.com/bevacqua/dragula/issues/602#issuecomment-912863804
const _define: { global?: unknown } = {};
if (mode !== "production") {
  _define.global = {};
}

export default {
  mode,
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@virto-shell/ui": "@virto-shell/ui/src/index.ts",
      "@virto-shell/core": "@virto-shell/core/src/index.ts",
      "@virto-shell/mod-assets": "@virto-shell/mod-assets/src/index.ts",
    },
  },
  envPrefix: "APP_",
  plugins: [vue()],
  define: {
    ..._define,
    "import.meta.env.PACKAGE_VERSION": `"${version}"`,
    "import.meta.env.APP_PLATFORM_URL": `"${process.env.APP_PLATFORM_URL}"`,
    "import.meta.env.APP_LOG_ENABLED": `"${process.env.APP_LOG_ENABLED}"`,
    "import.meta.env.APP_LOG_LEVEL": `"${process.env.APP_LOG_LEVEL}"`,
  },
  server: {
    watch: {
      ignored: ["!**/node_modules/@virto-shell/**"],
    },
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": `${process.env.APP_PLATFORM_URL}`,
      "/connect/token": `${process.env.APP_PLATFORM_URL}`,
      "/pushNotificationHub": `${process.env.APP_PLATFORM_URL}`,
      "^/pushNotificationHub": {
        target: `${process.env.APP_PLATFORM_URL}`,
        changeOrigin: true,
        ws: true,
      },
      "/Modules": `${process.env.APP_PLATFORM_URL}`,
    },
  },
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "@virto-shell/core",
      "@virto-shell/api-client",
      "@virto-shell/ui",
      "@virto-shell/mod-assets",
      "url-pattern",
      "vee-validate",
      "ace-builds",
    ],
  },
  build: {
    sourcemap: true,
    emptyOutDir: true,
    commonjsOptions: {
      include: [/^@virto-shell(\/.+)?$/, /node_modules/],
    },
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: tsconfigFile,
        }),
      ],
    },
  },
};
