import vue from "@vitejs/plugin-vue";
import * as fs from "node:fs";
import { loadEnv, ProxyOptions, defineConfig, searchForWorkspaceRoot, splitVendorChunkPlugin } from "vite";
import mkcert from "vite-plugin-mkcert";
import path from "node:path";
import { checker } from "vite-plugin-checker";

// Get actual package version from package.json
const packageJson = fs.readFileSync(process.cwd() + "/package.json");
const version = JSON.parse(packageJson.toString()).version || 0;

// Build configuration for the application
const mode = process.env.APP_ENV as string;
process.env = {
  ...process.env,
  ...loadEnv(mode, process.cwd(), "APP_"),
};

const isDemo = mode === "development" && !process.env.APP_PLATFORM_URL;

const isMonorepo = fs.existsSync(path.resolve(process.cwd(), "./../../framework/package.json"));

const hash = Math.floor(Math.random() * 90000) + 10000;

const getProxy = (target: ProxyOptions["target"], options: Omit<ProxyOptions, "target"> = {}): ProxyOptions => {
  const dontTrustSelfSignedCertificate = false;
  return {
    target,
    changeOrigin: true,
    secure: dontTrustSelfSignedCertificate,
    ...options,
  };
};

const workspaceRoot = isMonorepo
  ? searchForWorkspaceRoot(path.resolve(process.cwd(), "./../../framework/package.json"))
  : searchForWorkspaceRoot(process.cwd());

export default defineConfig({
  mode,
  resolve: {
    alias:
      mode === "development"
        ? isMonorepo
          ? {
              "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
              "@vc-shell/framework": "@vc-shell/framework/index.ts",
            }
          : {
              "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
              "vue-router": "vue-router/dist/vue-router.cjs.js",
              "vee-validate": "vee-validate/dist/vee-validate.js",
            }
        : undefined,
  },
  envPrefix: "APP_",
  base: process.env.APP_BASE_PATH,
  plugins: [
    mkcert({ hosts: ["localhost", "127.0.0.1"] }),
    vue(),
    checker({
      vueTsc: true,
    }),
    splitVendorChunkPlugin(),
  ],
  define: {
    "import.meta.env.PACKAGE_VERSION": `"${version}"`,
    "import.meta.env.APP_PLATFORM_URL": `"${process.env.APP_PLATFORM_URL ? process.env.APP_PLATFORM_URL : ""}"`,
    "import.meta.env.APP_BASE_PATH": `"${process.env.APP_BASE_PATH}"`,
    "import.meta.env.APP_I18N_LOCALE": `"${process.env.APP_I18N_LOCALE ? process.env.APP_I18N_LOCALE : ""}"`,
    "import.meta.env.APP_I18N_FALLBACK_LOCALE": `"${
      process.env.APP_I18N_FALLBACK_LOCALE ? process.env.APP_I18N_FALLBACK_LOCALE : ""
    }"`,

    // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,

    // Set demo mode
    __DEMO_MODE__: isDemo,
  },
  server: {
    fs: {
      allow: [
        // search up for workspace root
        workspaceRoot,
      ],
    },
    watch: {
      ignored: ["!**/node_modules/@vc-shell/**"],
    },
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": process.env.APP_PLATFORM_URL ? getProxy(`${process.env.APP_PLATFORM_URL}`) : "",
      "/connect/token": process.env.APP_PLATFORM_URL ? getProxy(`${process.env.APP_PLATFORM_URL}`) : "",
      "/pushNotificationHub": process.env.APP_PLATFORM_URL ? getProxy(`${process.env.APP_PLATFORM_URL}`) : "",
      "^/pushNotificationHub": process.env.APP_PLATFORM_URL
        ? getProxy(`${process.env.APP_PLATFORM_URL} `, {
            ws: true,
          })
        : "",
      "/Modules": process.env.APP_PLATFORM_URL ? getProxy(`${process.env.APP_PLATFORM_URL}`) : "",
    },
  },
  optimizeDeps: {
    exclude: ["@vc-shell/framework"],
    esbuildOptions: {
      target: ["esnext", "safari14"],
    },
  },
  build: {
    target: "esnext",
    minify: true,
    sourcemap: mode === "development",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `[name]` + hash + `.js`,
        chunkFileNames: `[name]` + hash + `.js`,
      },
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
});
