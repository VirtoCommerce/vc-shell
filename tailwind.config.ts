import config from "./framework/tailwind.config";
export default {
  prefix: "tw-",
  theme: config.theme,
  content: ["./framework/ui/**/*.{vue,tsx}", "./framework/shared/**/*.{vue,tsx}"],
};
