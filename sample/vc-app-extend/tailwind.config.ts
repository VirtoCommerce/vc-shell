import defaultConfig, { content } from "@vc-shell/framework/tailwind.config";

export default {
  prefix: "tw-",
  content: [...content, "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: defaultConfig.theme,
};
