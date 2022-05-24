module.exports = {
  content: ["./src/components/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    corePlugins: {
      preflight: false,
    }
  },
  plugins: [require("@tailwindcss/line-clamp")],
}
