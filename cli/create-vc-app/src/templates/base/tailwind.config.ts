import defaultConfig from "@vc-shell/framework/tailwind.config";

export default {
  prefix: "tw-",
  content: ["../../node_modules/@vc-shell/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: defaultConfig.theme,
};
