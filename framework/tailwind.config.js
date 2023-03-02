/** @type { import('tailwindcss').Config } */
module.exports = {
  prefix: 'tw-',
  content: ["./ui/components/**/*.{vue,js,ts,jsx,tsx}", "./shared/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        fontFamily: {
            roboto: ["Roboto", "sans-serif"],
        },
        fontSize: {
            "xs": ["11px", "14px"],
            "sm": ["12px", "16px"],
            "base": ["13px", "18px"],
            "lg": ["14px", "19px"],
            "xl": ["16px", "22px"],
            "2xl": ["23px", "28px"],
        },
        lineHeight: {
            "xs": "14px",
            "sm": "16px",
            "base": "18px",
            "lg": "19px",
            "xl": "22px",
            "2xl": "28px",
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
                },
            },
            animation: {
                loadingMarker: "loadingMarker 3s infinite",
                loadingMarkers: "loadingMarkers 3s infinite",
                loadingProgress: "loadingProgress 1s linear infinite",
            }
        },
    },

  plugins: [require("@tailwindcss/line-clamp")],
}
