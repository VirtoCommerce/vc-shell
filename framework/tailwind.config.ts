/** @type { import('tailwindcss').Config } */
import config from "@vc-shell/tailwind-config";
export default {
  ...config,
  content: ["./ui/components/**/*.{vue,js,ts,jsx,tsx}", "./shared/**/*.{vue,js,ts,jsx,tsx}"],
};
