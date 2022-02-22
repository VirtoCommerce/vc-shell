import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import fs from "fs";

// Get actual package version from package.json
const packageJson = fs.readFileSync("./package.json");
const version = JSON.parse(packageJson.toString()).version || 0;

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "APP_") };
  const TSCONFIG = path.resolve(__dirname, "./tsconfig.json");
  const TSCONFIG_BUILD = path.resolve(__dirname, "./tsconfig.build.json");
  const tsconfigFile = mode === "production" ? TSCONFIG_BUILD : TSCONFIG;

  return {
    envPrefix: "APP_",
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
    define: {
      "import.meta.env.PACKAGE_VERSION": `"${version}"`,
      "import.meta.env.APP_PLATFORM_URL": `"${process.env.APP_PLATFORM_URL}"`,
    },
    server: {
      watch: {},
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        "/api": `${process.env.APP_PLATFORM_URL}`,
        "/connect/token": `${process.env.APP_PLATFORM_URL}`,
        "/pushNotificationHub": `${process.env.APP_PLATFORM_URL}`,
        "/Modules": `${process.env.APP_PLATFORM_URL}`,
      },
    },
    optimizeDeps: {
      include: [
        "@virtoshell/core",
        "@virtoshell/api-client",
        "@virtoshell/ui",
        "@virtoshell/mod-assets",
      ],
    },
    build: {
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        plugins: [
          typescript({
            tsconfig: tsconfigFile,
          }),
        ],
      },
      commonjsOptions: {
        include: [/^@virtoshell(\/.+)?$/, /node_modules/],
      },
    },
  };
});
