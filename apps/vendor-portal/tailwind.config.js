module.exports = {
    content: ["../../node_modules/@virtoshell/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{vue,js,ts,jsx,tsx}"],

    theme: {
        fontFamily: {
            roboto: ["Roboto", "sans-serif"],
        },
        fontSize: {
            "xs": "11px",
            "sm": "12px",
            "base": "13px",
            "lg": "14px",
            "xl": "16px",
            "2xl": "23px",
        },
        lineHeight: {
            "xs": "14px",
            "sm": "16px",
            "base": "18px",
            "lg": "19px",
            "xl": "22px",
            "header": "28px"
        },
        extend: {
            keyframes: {
                loadingMarker: {
                    '50%': {transform: 'translateX(96px)'}
                },
                loadingMarkers: {
                    '50%': {transform: 'translateX(-31px)'}
                },
                loadingProgress: {
                    from: {
                        "background-position": '0 0, left'
                    },
                    to: {
                        "background-position": '30px 0, left'
                    }
                }
            },
            animation: {
                loadingMarker: "loadingMarker 3s infinite",
                loadingMarkers: "loadingMarkers 3s infinite",
                loadingProgress: "loadingProgress 1s linear infinite"
            }
        },
    },

    plugins: [require("@tailwindcss/line-clamp")],
};
