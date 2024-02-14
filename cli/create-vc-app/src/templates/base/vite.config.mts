import { getApplicationConfiguration } from "@vc-shell/config-generator";
import { VitePWA } from "vite-plugin-pwa";

// Remove it after you added APP_PLATFORM_URL to .env file. Demo mode works only with yarn serve
const isDemo = !process.env.APP_PLATFORM_URL;

const mode = process.env.APP_ENV as string;

export default getApplicationConfiguration({
  define: {
    // Set demo mode
    __DEMO_MODE__: isDemo,
  },
  plugins: [
    VitePWA({
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "App",
        short_name: "App",
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
