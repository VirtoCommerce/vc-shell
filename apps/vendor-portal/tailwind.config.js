const defaultConfig = require('@virtoshell/ui/tailwind.config')

module.exports = {
    content: ["../../node_modules/@virtoshell/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: defaultConfig.theme,

    plugins: [require("@tailwindcss/line-clamp")],
};
