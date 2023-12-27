import { getApplicationConfiguration } from "@vc-shell/config-generator";
import { VitePWA } from "vite-plugin-pwa";
import process from "node:process";

const mode = process.env.APP_ENV as string;

export default getApplicationConfiguration({
  resolve: {
    alias: {
      "@vcmp-vendor-portal/modules": mode === "development" ? "src/modules/index.ts" : "@vcmp-vendor-portal/modules",
      "@vcmp-vendor-portal/api/orders":
        mode === "development" ? "src/api_client/orders.ts" : "@vcmp-vendor-portal/api/orders",
      "@vcmp-vendor-portal/api/marketplacevendor":
        mode === "development" ? "src/api_client/marketplacevendor.ts" : "@vcmp-vendor-portal/api/marketplacevendor",
      "@vcmp-vendor-portal/api/catalog":
        mode === "development" ? "src/api_client/catalog.ts" : "@vcmp-vendor-portal/api/catalog",
    },
  },
  plugins: [
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
});
