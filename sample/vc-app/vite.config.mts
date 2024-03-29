import { getApplicationConfiguration } from "@vc-shell/config-generator";
import { resolve } from "node:path";
import { VitePWA } from "vite-plugin-pwa";

const mode = process.env.APP_ENV as string;

export default getApplicationConfiguration({
  resolve: {
    alias: {
      "@vc-app/modules": mode === "development" ? resolve("src/modules/index.ts") : "@vc-app/modules",
      "@vc-app/api": mode === "development" ? resolve("src/api_client/marketplacevendor.ts") : "@vc-app/api",
    },
  },
  plugins: [
    VitePWA({
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "vc-app",
        short_name: "vc-app",
        theme_color: "#319ED4",
        display: "fullscreen",
        start_url: "/",
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
});
