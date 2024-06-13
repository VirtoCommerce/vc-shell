import { getApplicationConfiguration } from "@vc-shell/config-generator";
import { resolve } from "node:path";

const mode = process.env.APP_ENV as string;

export default getApplicationConfiguration({
  resolve: {
    alias: {
      "@vc-app/modules": mode === "development" ? resolve("src/modules/index.ts") : "@vc-app/modules",
      "@vc-app/api": mode === "development" ? resolve("src/api_client/marketplacevendor.ts") : "@vc-app/api",
    },
  },
});
