/** @type { import('tailwindcss').Config } */

const primaryColors = {
  DEFAULT: "rgb(from var(--primary-500) r g b / <alpha-value>)",
  50: "rgb(from var(--primary-50) r g b / <alpha-value>)",
  100: "rgb(from var(--primary-100) r g b / <alpha-value>)",
  200: "rgb(from var(--primary-200) r g b / <alpha-value>)",
  300: "rgb(from var(--primary-300) r g b / <alpha-value>)",
  400: "rgb(from var(--primary-400) r g b / <alpha-value>)",
  500: "rgb(from var(--primary-500) r g b / <alpha-value>)",
  600: "rgb(from var(--primary-600) r g b / <alpha-value>)",
  700: "rgb(from var(--primary-700) r g b / <alpha-value>)",
  800: "rgb(from var(--primary-800) r g b / <alpha-value>)",
  900: "rgb(from var(--primary-900) r g b / <alpha-value>)",
  950: "rgb(from var(--primary-950) r g b / <alpha-value>)",
};

const secondaryColors = {
  DEFAULT: "rgb(from var(--secondary-500) r g b / <alpha-value>)",
  50: "rgb(from var(--secondary-50) r g b / <alpha-value>)",
  100: "rgb(from var(--secondary-100) r g b / <alpha-value>)",
  200: "rgb(from var(--secondary-200) r g b / <alpha-value>)",
  300: "rgb(from var(--secondary-300) r g b / <alpha-value>)",
  400: "rgb(from var(--secondary-400) r g b / <alpha-value>)",
  500: "rgb(from var(--secondary-500) r g b / <alpha-value>)",
  600: "rgb(from var(--secondary-600) r g b / <alpha-value>)",
  700: "rgb(from var(--secondary-700) r g b / <alpha-value>)",
  800: "rgb(from var(--secondary-800) r g b / <alpha-value>)",
  900: "rgb(from var(--secondary-900) r g b / <alpha-value>)",
  950: "rgb(from var(--secondary-950) r g b / <alpha-value>)",
};

const infoColors = {
  DEFAULT: "rgb(from var(--info-500) r g b / <alpha-value>)",
  50: "rgb(from var(--info-50) r g b / <alpha-value>)",
  100: "rgb(from var(--info-100) r g b / <alpha-value>)",
  200: "rgb(from var(--info-200) r g b / <alpha-value>)",
  300: "rgb(from var(--info-300) r g b / <alpha-value>)",
  400: "rgb(from var(--info-400) r g b / <alpha-value>)",
  500: "rgb(from var(--info-500) r g b / <alpha-value>)",
  600: "rgb(from var(--info-600) r g b / <alpha-value>)",
  700: "rgb(from var(--info-700) r g b / <alpha-value>)",
  800: "rgb(from var(--info-800) r g b / <alpha-value>)",
  900: "rgb(from var(--info-900) r g b / <alpha-value>)",
  950: "rgb(from var(--info-950) r g b / <alpha-value>)",
};

const successColors = {
  DEFAULT: "rgb(from var(--success-500) r g b / <alpha-value>)",
  50: "rgb(from var(--success-50) r g b / <alpha-value>)",
  100: "rgb(from var(--success-100) r g b / <alpha-value>)",
  200: "rgb(from var(--success-200) r g b / <alpha-value>)",
  300: "rgb(from var(--success-300) r g b / <alpha-value>)",
  400: "rgb(from var(--success-400) r g b / <alpha-value>)",
  500: "rgb(from var(--success-500) r g b / <alpha-value>)",
  600: "rgb(from var(--success-600) r g b / <alpha-value>)",
  700: "rgb(from var(--success-700) r g b / <alpha-value>)",
  800: "rgb(from var(--success-800) r g b / <alpha-value>)",
  900: "rgb(from var(--success-900) r g b / <alpha-value>)",
  950: "rgb(from var(--success-950) r g b / <alpha-value>)",
};

const warningColors = {
  DEFAULT: "rgb(from var(--warning-500) r g b / <alpha-value>)",
  50: "rgb(from var(--warning-50) r g b / <alpha-value>)",
  100: "rgb(from var(--warning-100) r g b / <alpha-value>)",
  200: "rgb(from var(--warning-200) r g b / <alpha-value>)",
  300: "rgb(from var(--warning-300) r g b / <alpha-value>)",
  400: "rgb(from var(--warning-400) r g b / <alpha-value>)",
  500: "rgb(from var(--warning-500) r g b / <alpha-value>)",
  600: "rgb(from var(--warning-600) r g b / <alpha-value>)",
  700: "rgb(from var(--warning-700) r g b / <alpha-value>)",
  800: "rgb(from var(--warning-800) r g b / <alpha-value>)",
  900: "rgb(from var(--warning-900) r g b / <alpha-value>)",
  950: "rgb(from var(--warning-950) r g b / <alpha-value>)",
};

const dangerColors = {
  DEFAULT: "rgb(from var(--danger-500) r g b / <alpha-value>)",
  50: "rgb(from var(--danger-50) r g b / <alpha-value>)",
  100: "rgb(from var(--danger-100) r g b / <alpha-value>)",
  200: "rgb(from var(--danger-200) r g b / <alpha-value>)",
  300: "rgb(from var(--danger-300) r g b / <alpha-value>)",
  400: "rgb(from var(--danger-400) r g b / <alpha-value>)",
  500: "rgb(from var(--danger-500) r g b / <alpha-value>)",
  600: "rgb(from var(--danger-600) r g b / <alpha-value>)",
  700: "rgb(from var(--danger-700) r g b / <alpha-value>)",
  800: "rgb(from var(--danger-800) r g b / <alpha-value>)",
  900: "rgb(from var(--danger-900) r g b / <alpha-value>)",
  950: "rgb(from var(--danger-950) r g b / <alpha-value>)",
};

const neutralColors = {
  DEFAULT: "rgb(from var(--neutral-500) r g b / <alpha-value>)",
  50: "rgb(from var(--neutral-50) r g b / <alpha-value>)",
  100: "rgb(from var(--neutral-100) r g b / <alpha-value>)",
  200: "rgb(from var(--neutral-200) r g b / <alpha-value>)",
  300: "rgb(from var(--neutral-300) r g b / <alpha-value>)",
  400: "rgb(from var(--neutral-400) r g b / <alpha-value>)",
  500: "rgb(from var(--neutral-500) r g b / <alpha-value>)",
  600: "rgb(from var(--neutral-600) r g b / <alpha-value>)",
  700: "rgb(from var(--neutral-700) r g b / <alpha-value>)",
  800: "rgb(from var(--neutral-800) r g b / <alpha-value>)",
  900: "rgb(from var(--neutral-900) r g b / <alpha-value>)",
  950: "rgb(from var(--neutral-950) r g b / <alpha-value>)",
};

const accentColors = {
  DEFAULT: "rgb(from var(--accent-500) r g b / <alpha-value>)",
  50: "rgb(from var(--accent-50) r g b / <alpha-value>)",
  100: "rgb(from var(--accent-100) r g b / <alpha-value>)",
  200: "rgb(from var(--accent-200) r g b / <alpha-value>)",
  300: "rgb(from var(--accent-300) r g b / <alpha-value>)",
  400: "rgb(from var(--accent-400) r g b / <alpha-value>)",
  500: "rgb(from var(--accent-500) r g b / <alpha-value>)",
  600: "rgb(from var(--accent-600) r g b / <alpha-value>)",
  700: "rgb(from var(--accent-700) r g b / <alpha-value>)",
  800: "rgb(from var(--accent-800) r g b / <alpha-value>)",
  900: "rgb(from var(--accent-900) r g b / <alpha-value>)",
  950: "rgb(from var(--accent-950) r g b / <alpha-value>)",
};

const additionalColors = {
  50: "rgb(from var(--additional-50) r g b / <alpha-value>)",
  950: "rgb(from var(--additional-950) r g b / <alpha-value>)",
};

const colors = {
  transparent: "transparent",
  current: "currentColor",
  inherit: "inherit",

  primary: primaryColors,
  secondary: secondaryColors,
  info: infoColors,
  success: successColors,
  warning: warningColors,
  danger: dangerColors,
  neutral: neutralColors,
  accent: accentColors,
  additional: additionalColors,
};

export default {
  prefix: "tw-",
  theme: {
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
    },
    // fontSize: {
    //   xs: ["11px", "14px"],
    //   sm: ["12px", "16px"],
    //   base: ["13px", "18px"],
    //   lg: ["14px", "19px"],
    //   xl: ["16px", "22px"],
    //   "2xl": ["23px", "28px"],
    // },
    // lineHeight: {
    //   xs: "14px",
    //   sm: "16px",
    //   base: "18px",
    //   lg: "19px",
    //   xl: "22px",
    //   "2xl": "28px",
    //   header: "28px",
    // },
    // colors,

    // backgroundColor: {
    //   ...colors,
    // },

    // textColor: {
    //   ...colors,
    // },

    // textDecorationColor: {
    //   ...colors,
    // },

    // borderColor: {
    //   ...colors,
    //   DEFAULT: neutralColors[200],
    // },

    // divideColor: {
    //   ...colors,
    //   DEFAULT: neutralColors[200],
    // },

    // outlineColor: {
    //   ...colors,
    //   DEFAULT: primaryColors[100],
    // },

    // ringColor: {
    //   ...colors,
    //   DEFAULT: primaryColors[100],
    // },

    // boxShadowColor: {
    //   ...colors,
    // },

    fontSize: {
      xxs: [
        "0.625rem", //10px
        {
          lineHeight: "0.75rem", //12px
        },
      ],
      xs: [
        "0.75rem", //12px
        {
          lineHeight: "0.875rem", //14px
        },
      ],
      sm: [
        "0.875rem", //14px
        {
          lineHeight: "1rem", //18px
        },
      ],
      s: [
        "0.875rem", //14px
        {
          lineHeight: "1rem", //18px
        },
      ],
      base: [
        "1rem", //16px
        {
          lineHeight: "1.25rem", //20px
        },
      ],
      lg: [
        "1.125rem", //18px
        {
          lineHeight: "1.375rem", //22px
        },
      ],
      xl: [
        "1.25rem", //20px
        {
          lineHeight: "1.75rem", //28px
        },
      ],
      "2xl": [
        "1.5rem", //24px
        {
          lineHeight: "2rem", //32px
        },
      ],
      "3xl": [
        "1.875rem", //30px
        {
          lineHeight: "2.25rem", //36px
        },
      ],
      "4xl": [
        "2.25rem", //36px
        {
          lineHeight: "2.5rem", //40px
        },
      ],
      "5xl": [
        "3rem", //48px
        {
          lineHeight: "3rem", //48px
        },
      ],
      "6xl": [
        "3.75rem", //60px
        {
          lineHeight: "3.75rem", //60px
        },
      ],
      "7xl": [
        "4.5rem", //72px
        {
          lineHeight: "4.5rem", //72px
        },
      ],
      "8xl": [
        "6rem", //96px
        {
          lineHeight: "6rem", //96px
        },
      ],
    },
    extend: {
      keyframes: {
        loadingMarker: {
          "50%": { transform: "translateX(96px)" },
        },
        loadingMarkers: {
          "50%": { transform: "translateX(-31px)" },
        },
        loadingProgress: {
          from: {
            "background-position": "0 0, left",
          },
          to: {
            "background-position": "30px 0, left",
          },
        },
      },
      animation: {
        loadingMarker: "loadingMarker 3s infinite",
        loadingMarkers: "loadingMarkers 3s infinite",
        loadingProgress: "loadingProgress 1s linear infinite",
      },
    },
  },
  content: ["./ui/components/**/*.{vue,js,ts,jsx,tsx}", "./shared/**/*.{vue,js,ts,jsx,tsx}"],
};

export const content = ["../../node_modules/@vc-shell/**/*.{vue,js,ts,jsx,tsx}"];
