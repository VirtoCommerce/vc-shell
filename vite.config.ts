import { getApplicationConfiguration } from "@virtoshell/config-generator";
import { VitePWA } from "vite-plugin-pwa";

export default getApplicationConfiguration({
  resolve: {
    alias: null,
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
