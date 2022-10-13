import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
const packageJson = fs.readFileSync(process.cwd() + "/package.json");
const version = JSON.parse(packageJson.toString()).version || 0;
import vue from "@vitejs/plugin-vue";
import { loadEnv } from "vite";
import typescript from "@rollup/plugin-typescript";

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
    plugins: [
        vue(),
        VitePWA({
            includeAssets: ["favicon.ico", "apple-touch-icon.png"],
            manifest: {
                name: "Vendor Portal",
                theme_color: "#319ED4",
                display: "fullscreen",
                start_url: "/index.html",
                icons: [
                    {
                        src: "./img/icons/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "./img/icons/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "./img/icons/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "./img/icons/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
        }),
    ],
    resolve: {
        preserveSymlinks: true,
        alias: {
            "@vc-shell/ui/dist/style.css": "@vc-shell/ui/dist/style.css",
            "@vc-shell/ui": "@vc-shell/ui/src/index.ts",
            "@vc-shell/core": "@vc-shell/core/src/index.ts",
            "@vc-shell/mod-assets": "@vc-shell/mod-assets/src/index.ts",
            "vue-router": "vue-router/dist/vue-router.cjs.js",
        },
    },
    base: process.env.APP_BASE_PATH,
    mode,
    envPrefix: "APP_",
    define: {
        ..._define,
        "import.meta.env.PACKAGE_VERSION": `"${version}"`,
        "import.meta.env.APP_PLATFORM_URL": `"${process.env.APP_PLATFORM_URL}"`,
        "import.meta.env.APP_LOG_ENABLED": `"${process.env.APP_LOG_ENABLED}"`,
        "import.meta.env.APP_LOG_LEVEL": `"${process.env.APP_LOG_LEVEL}"`,
        "import.meta.env.APP_BASE_PATH": `"${process.env.APP_BASE_PATH}"`,
    },
    server: {
        watch: {
            ignored: ["!**/node_modules/@vc-shell/**"],
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
            "url-pattern",
            "ace-builds",
            "@vc-shell/core",
            "@vc-shell/api-client",
            "@vc-shell/ui",
            "@vc-shell/mod-assets",
        ],
    },
    build: {
        sourcemap: true,
        emptyOutDir: true,
        commonjsOptions: {
            include: [/^@vc-shell(\/.+)?$/, /node_modules/],
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
