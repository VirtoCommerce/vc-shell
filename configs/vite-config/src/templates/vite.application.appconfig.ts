import vue from "@vitejs/plugin-vue";
import * as fs from "node:fs";
import { loadEnv, defineConfig, ProxyOptions } from "vite";
import mkcert from "vite-plugin-mkcert";
import path from "node:path";
import { checker } from "vite-plugin-checker";

const packageJson = fs.readFileSync(process.cwd() + "/package.json");
const version = JSON.parse(packageJson.toString()).version || 0;

const mode = process.env.APP_ENV as string;
process.env = {
  ...process.env,
  ...loadEnv(mode, process.cwd(), "APP_"),
};

const isDemo = mode === "development" && !process.env.APP_PLATFORM_URL;
const isMonorepo = fs.existsSync(path.resolve(process.cwd(), "./../../framework/package.json"));
const hash = Math.floor(Math.random() * 90000) + 10000;

const getProxyOptions = (targetUrl: ProxyOptions["target"], options: Omit<ProxyOptions, "target"> = {}) => {
  const dontTrustSelfSignedCertificate = false;
  return {
    target: targetUrl,
    changeOrigin: true,
    secure: dontTrustSelfSignedCertificate,
    ...options,
  };
};

const workspaceRoot = isMonorepo ? path.resolve(process.cwd(), "../../") : process.cwd();

const frameworkPath = isMonorepo
  ? path.resolve(workspaceRoot, "framework")
  : path.resolve(process.cwd(), "node_modules/@vc-shell/framework");

const appBasePath = process.env.APP_BASE_PATH || "/";
const appBasePathWithSlash = appBasePath.endsWith("/") ? appBasePath : `${appBasePath}/`;

const proxyPaths = ["/api", "/connect/token", "/Modules", "/images", "/pushNotificationHub"];

const commonProxyOptions = process.env.APP_PLATFORM_URL ? getProxyOptions(process.env.APP_PLATFORM_URL) : "";

const proxyConfig = Object.fromEntries(proxyPaths.map((path) => [path, commonProxyOptions]));

if (process.env.APP_PLATFORM_URL) {
  proxyConfig["^/pushNotificationHub"] = getProxyOptions(process.env.APP_PLATFORM_URL, { ws: true });

  proxyConfig["^/"] = getProxyOptions(process.env.APP_PLATFORM_URL, {
    ws: false,
    // Use custom bypass function to exclude some requests from proxying
    bypass: (req) => {
      const url = req.url;
      // Exclude app base path
      if (
        url?.startsWith(appBasePathWithSlash) ||
        url === appBasePath.slice(0, -1) ||
        proxyPaths.some((path) => url?.startsWith(path))
      ) {
        return req.url;
      }
      // Exclude vite paths
      if (
        url &&
        (url.startsWith("/@vite/") ||
          url.startsWith("/@id/") ||
          url.startsWith("/@fs/") ||
          url === "/__vite_ping" ||
          url.startsWith("/__vite") ||
          url === "/favicon.ico" ||
          url === "/" ||
          url.includes("/vite"))
      ) {
        return req.url;
      }
      // Proxy all other requests
      return null;
    },
    configure: (proxy) => {
      proxy.on("error", (err) => {
        console.error("Proxy error:", err);
      });
      proxy.on("proxyReq", (proxyReq, req) => {
        console.log(`Proxying request: ${req.method} ${req.url} -> ${process.env.APP_PLATFORM_URL}${proxyReq.path}`);
      });
    },
  });
}

export default defineConfig({
  mode,
  resolve: {
    alias:
      mode === "development"
        ? isMonorepo
          ? {
              "@vc-shell/framework/dist/index.css": path.resolve(frameworkPath, "assets/styles/index.scss"),
              "@vc-shell/framework": path.resolve(frameworkPath, "index.ts"),
            }
          : {
              "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
              "vue-router": "vue-router/dist/vue-router.cjs.js",
            }
        : undefined,
  },
  envPrefix: "APP_",
  base: appBasePath,
  plugins: [
    mkcert({ hosts: ["localhost", "127.0.0.1"] }),
    vue(),
    checker({
      vueTsc: true,
    }),
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
        // Allow access to the root of the monorepo and node_modules
        workspaceRoot,
        process.cwd(),
        // For the monorepo case, also allow access to the framework
        ...(isMonorepo ? [frameworkPath] : []),
      ],
    },
    watch: {
      ignored: ["!**/node_modules/@vc-shell/**"],
    },
    host: "0.0.0.0",
    port: 8080,
    proxy: proxyConfig,
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
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
