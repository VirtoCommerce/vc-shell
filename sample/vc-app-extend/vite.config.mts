import { getApplicationConfiguration } from "@vc-shell/config-generator";

export default getApplicationConfiguration({
  resolve: {
    alias: {
      "@vc-app/api": "@vc-app-extend/api",
    },
  },
});
