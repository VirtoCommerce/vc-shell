module.exports = {
    content: ["../../node_modules/@virtoshell/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{vue,js,ts,jsx,tsx}"],

    theme: {
        fontFamily: {
            roboto: ["Roboto", "sans-serif"],
        },
        fontSize: {
            "xs": "11px",
            "sm": "12px",
            "m": "13px",
            "lg": "14px",
            "xl": "16px",
            "2xl": "23px",
        },
        lineHeight: {
            "xs": "14px",
            "sm": "16px",
            "m": "18px",
            "lg": "19px",
            "xl": "22px",
            "header": "28px"
        },
        extend: {
            spacing: {
                "xs": "4px",
                "s": "8px",
                "m": "12px",
                "l": "16px",
                "xl": "20px",
            },
        },
    },

    plugins: [require("@tailwindcss/line-clamp")],
};
