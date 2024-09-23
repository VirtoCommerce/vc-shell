import defaultConfig from "@vc-shell/framework/tailwind.config";
import path from "path";

export default {
  prefix: "tw-",
  content: [
    path.join(path.dirname(require.resolve("@vc-shell/framework")), "**/*.{vue,js,ts,jsx,tsx}"),
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: defaultConfig.theme,
};
