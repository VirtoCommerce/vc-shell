const defaultConfig = require('@vc-shell/framework/tailwind.config')

module.exports = {
    prefix: 'tw-',
    content: ["../../node_modules/@vc-shell/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: defaultConfig.theme,
};
