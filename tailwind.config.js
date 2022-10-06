const defaultConfig = require('@vc-shell/ui/tailwind.config')

module.exports = {
    content: ["../../node_modules/@vc-shell/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: defaultConfig.theme,

    plugins: [require("@tailwindcss/line-clamp")],
};
