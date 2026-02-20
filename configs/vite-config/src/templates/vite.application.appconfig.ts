import vue from "@vitejs/plugin-vue";
import * as fs from "node:fs";
import { loadEnv, defineConfig, ProxyOptions, type PluginOption, normalizePath } from "vite";
import mkcert from "vite-plugin-mkcert";
import path from "node:path";
import { checker } from "vite-plugin-checker";
// import { visualizer } from "rollup-plugin-visualizer";

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
const normalizedFrameworkPath = normalizePath(frameworkPath);
const frameworkIndexPath = normalizePath(path.resolve(frameworkPath, "index.ts"));
const frameworkCorePath = `${normalizedFrameworkPath}/core`;
const frameworkUiPath = `${normalizedFrameworkPath}/ui`;
const frameworkSharedPath = `${normalizedFrameworkPath}/shared`;
const frameworkAssetsPath = `${normalizedFrameworkPath}/assets`;
const frameworkLocalesPath = `${normalizedFrameworkPath}/locales`;

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

let frameworkAliases: Record<string, string> | undefined;

if (mode === "development" && isMonorepo) {
  frameworkAliases = {
    "@vc-shell/framework/dist/index.css": normalizePath(path.resolve(frameworkPath, "assets/styles/index.scss")),
    // Keep subpath imports from framework source resolvable in app dev mode.
    "@framework": normalizedFrameworkPath,
    "@core": frameworkCorePath,
    "@core/": `${frameworkCorePath}/`,
    "@ui": frameworkUiPath,
    "@ui/": `${frameworkUiPath}/`,
    "@shared": frameworkSharedPath,
    "@shared/": `${frameworkSharedPath}/`,
    "@assets": frameworkAssetsPath,
    "@assets/": `${frameworkAssetsPath}/`,
    "@locales": frameworkLocalesPath,
    "@locales/": `${frameworkLocalesPath}/`,
    "@vc-shell/framework/": `${normalizedFrameworkPath}/`,
    "@vc-shell/framework": frameworkIndexPath,
  };
} else if (mode === "development") {
  frameworkAliases = {
    "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
  };
}

export default defineConfig({
  mode,
  resolve: {
    dedupe: ["@intlify", "vue", "@vue/runtime-core", "vue-i18n"],
    alias: frameworkAliases,
  },
  envPrefix: "APP_",
  base: appBasePath,
  plugins: [
    mkcert({ hosts: ["localhost", "127.0.0.1"] }),
    vue(),
    checker({
      vueTsc: true,
    }),
    // visualizer({
    //   open: true,
    //   filename: "dist/stats.html",
    // }) as PluginOption,
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
    __INTLIFY_PROD_DEVTOOLS__: mode === "development",

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
    include: [
      // Pre-bundle commonly used libraries for faster dev startup
      "vue",
      "vue-router",
      "vue-i18n",
      "@vueuse/core",
      "@vueuse/integrations",
      "lodash-es",
      "moment",
      "@headlessui/vue",
      "vee-validate",
    ],
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
      // external: ["@intlify", "vue-i18n"],
      // Improve tree-shaking
      // treeshake: {
      //   moduleSideEffects: false,
      //   propertyReadSideEffects: false,
      //   unknownGlobalSideEffects: false,
      // },
      // plugins: mode === "production" ? [analyzer({ summaryOnly: true })] : [],
      output: {
        // globals: {
        //   "@intlify": "@intlify",
        //   "vue-i18n": "vue-i18n",
        // },
        entryFileNames: `[name]` + hash + `.js`,
        chunkFileNames: `[name]` + hash + `.js`,
        // Optimize chunk loading order
        experimentalMinChunkSize: 1000,
        // Add preload/prefetch hints for better loading
        inlineDynamicImports: false,
        // Optimize asset URLs
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]${hash}[extname]`;

          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return `assets/images/[name]${hash}[extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]${hash}[extname]`;
          }
          return `assets/[name]${hash}[extname]`;
        },
        manualChunks: (id: string) => {
          // Normalize path for cross-platform compatibility
          const normalizedId = id.replace(/\\/g, "/");

          // PRIORITY: Handle API clients first (before any other logic)
          if (normalizedId.includes("/api_client/") && (normalizedId.endsWith(".ts") || normalizedId.endsWith(".js"))) {
            const fullPath = normalizedId.split("/").pop();
            if (fullPath) {
              // Remove extension and get filename
              const fileName = fullPath.replace(/\.(ts|js)$/, "");

              // Create chunk name from filename (any API client becomes separate chunk)
              if (fileName && fileName !== "index") {
                const chunkName = `api-${fileName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
                return chunkName;
              }
            }
            return "app-api";
          }

          // Handle VC-Shell framework files (both npm and local development)
          const isVcShellFramework =
            normalizedId.includes("@vc-shell/framework") || normalizedId.includes("/framework/dist/");

          if (isVcShellFramework) {
            // Handle main framework file
            if (
              normalizedId.includes("/framework.js") ||
              (normalizedId.includes("@vc-shell/framework") && !normalizedId.includes("/vendor-"))
            ) {
              return "vc-shell-framework";
            }

            // Handle framework vendor chunks
            if (normalizedId.includes("/vendor-")) {
              const filename = normalizedId.split("/").pop() || "";
              const vendorMatch = filename.match(/vendor-([^-]+)/);
              if (vendorMatch) {
                return `vc-shell-vendor-${vendorMatch[1]}`;
              }
              return "vc-shell-vendors";
            }

            // Any other framework files
            return "vc-shell-framework";
          }

          // Each node_modules library gets its own chunk (application vendors)
          if (normalizedId.includes("node_modules")) {
            // Extract library name from path
            const parts = normalizedId.split("node_modules/")[1].split("/");
            let libName = parts[0];

            // Handle scoped packages like @tiptap/core -> tiptap-core
            if (libName.startsWith("@")) {
              const scopedParts = normalizedId.split("node_modules/")[1].split("/").slice(0, 2);
              libName = scopedParts.join("-").replace("@", "");
            }

            // Clean up library name for chunk name - prefix with 'app-' to distinguish from framework vendors
            return `app-vendor-${libName.replace(/[^a-z0-9-]/gi, "-")}`;
          }

          // Application code - minimal chunking to reduce complexity
          if (normalizedId.includes("/src/")) {
            return "app-core";
          }

          return undefined;
        },
      },
    },
  },
  esbuild: {
    drop: mode === "production" ? ["debugger"] : [],
    pure: mode === "production" ? ["console.log", "console.info", "console.debug"] : [],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
