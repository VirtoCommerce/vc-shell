import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";
import * as fs from "fs";
import { loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";

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

const getProxy = (target, options = {}) => {
  const dontTrustSelfSignedCertificate = false;
  return {
    target,
    secure: dontTrustSelfSignedCertificate,
    ...options,
  };
};

export default {
  mode,
  resolve: {
    preserveSymlinks: true,
  },
  envPrefix: "APP_",
  plugins: [mkcert({ hosts: ["localhost", "127.0.0.1"] }), vue()],
  define: {
    ..._define,

    "import.meta.env.PACKAGE_VERSION": `"${version}"`,
    "import.meta.env.APP_PLATFORM_URL": `"${process.env.APP_PLATFORM_URL}"`,
    "import.meta.env.APP_LOG_ENABLED": `"${process.env.APP_LOG_ENABLED}"`,
    "import.meta.env.APP_LOG_LEVEL": `"${process.env.APP_LOG_LEVEL}"`,

    // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
  },
  server: {
    watch: {
      ignored: ["!**/node_modules/@vc-shell/**"],
    },
    host: "0.0.0.0",
    port: 8080,
    https: true,
    proxy: {
      "/api": getProxy(`${process.env.APP_PLATFORM_URL}`),
      "/connect/token": getProxy(`${process.env.APP_PLATFORM_URL}`),
      "/pushNotificationHub": getProxy(`${process.env.APP_PLATFORM_URL}`),
      "^/pushNotificationHub": getProxy(`${process.env.APP_PLATFORM_URL}`, {
        changeOrigin: true,
        ws: true,
      }),
      "/Modules": getProxy(`${process.env.APP_PLATFORM_URL}`),
    },
  },
  optimizeDeps: {
    include: ["vue", "vue-router", "url-pattern", "ace-builds"],
  },
  build: {
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: tsconfigFile,
        }),
      ],
    },
  },
};
