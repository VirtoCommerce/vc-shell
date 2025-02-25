import config from "./framework/tailwind.config";
export default {
  prefix: "tw-",
  theme: config.theme,
  content: ["./framework/**/*.{vue,js,ts,jsx,tsx}"],
};
