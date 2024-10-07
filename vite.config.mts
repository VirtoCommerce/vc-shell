import { resolve } from "node:path";
import { getApplicationConfiguration } from "@vc-shell/config-generator";
import process from "node:process";

const mode = process.env.APP_ENV as string;

export default getApplicationConfiguration({
  resolve: {
    alias: {
      "@vcmp-vendor-portal/modules/dist/style.css":
        mode === "development" ? resolve("src/styles/index.scss") : "@vcmp-vendor-portal/modules/dist/style.css",
      "@vcmp-vendor-portal/modules":
        mode === "development" ? resolve("src/modules/index.ts") : "@vcmp-vendor-portal/modules",
      "@vcmp-vendor-portal/api/orders":
        mode === "development" ? resolve("src/api_client/virtocommerce.orders.ts") : "@vcmp-vendor-portal/api/orders",
      "@vcmp-vendor-portal/api/marketplacevendor":
        mode === "development"
          ? resolve("src/api_client/virtocommerce.marketplacevendor.ts")
          : "@vcmp-vendor-portal/api/marketplacevendor",
      "@vcmp-vendor-portal/api/catalog":
        mode === "development" ? resolve("src/api_client/virtocommerce.catalog.ts") : "@vcmp-vendor-portal/api/catalog",
    },
  },
});
