/** @type { import('tailwindcss').Config } */
import type { Config } from "tailwindcss";

export const content = [
  "../../node_modules/@vc-shell/**/*.{vue,js,ts,jsx,tsx}",
  "./ui/components/**/*.{vue,js,ts,jsx,tsx}",
  "./shared/**/*.{vue,js,ts,jsx,tsx}",
];

export default {
  prefix: "tw-",
  theme: {
    fontFamily: {
      jakarta: ["Plus Jakarta Sans", "sans-serif"],
    },
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
          lineHeight: "1.125rem", //18px
        },
      ],
      s: [
        "0.875rem", //14px
        {
          lineHeight: "1.125rem", //18px
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
      colors: {
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
          DEFAULT: "var(--primary-500)",
        },
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          950: "var(--secondary-950)",
          DEFAULT: "var(--secondary-500)",
        },
        accent: {
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
          950: "var(--accent-950)",
          DEFAULT: "var(--accent-500)",
        },
        neutrals: {
          50: "var(--neutrals-50)",
          100: "var(--neutrals-100)",
          200: "var(--neutrals-200)",
          300: "var(--neutrals-300)",
          400: "var(--neutrals-400)",
          500: "var(--neutrals-500)",
          600: "var(--neutrals-600)",
          700: "var(--neutrals-700)",
          800: "var(--neutrals-800)",
          900: "var(--neutrals-900)",
          950: "var(--neutrals-950)",
          DEFAULT: "var(--neutrals-500)",
        },
        danger: {
          50: "var(--danger-50)",
          100: "var(--danger-100)",
          200: "var(--danger-200)",
          300: "var(--danger-300)",
          400: "var(--danger-400)",
          500: "var(--danger-500)",
          600: "var(--danger-600)",
          700: "var(--danger-700)",
          800: "var(--danger-800)",
          900: "var(--danger-900)",
          950: "var(--danger-950)",
          DEFAULT: "var(--danger-500)",
        },
        warning: {
          50: "var(--warning-50)",
          100: "var(--warning-100)",
          200: "var(--warning-200)",
          300: "var(--warning-300)",
          400: "var(--warning-400)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
          800: "var(--warning-800)",
          900: "var(--warning-900)",
          950: "var(--warning-950)",
          DEFAULT: "var(--warning-500)",
        },
        success: {
          50: "var(--success-50)",
          100: "var(--success-100)",
          200: "var(--success-200)",
          300: "var(--success-300)",
          400: "var(--success-400)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
          800: "var(--success-800)",
          900: "var(--success-900)",
          950: "var(--success-950)",
          DEFAULT: "var(--success-500)",
        },
        info: {
          50: "var(--info-50)",
          100: "var(--info-100)",
          200: "var(--info-200)",
          300: "var(--info-300)",
          400: "var(--info-400)",
          500: "var(--info-500)",
          600: "var(--info-600)",
          700: "var(--info-700)",
          800: "var(--info-800)",
          900: "var(--info-900)",
          950: "var(--info-950)",
          DEFAULT: "var(--info-500)",
        },
        additional: {
          50: "var(--additional-50)",
          950: "var(--additional-950)",
        },
      },
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
  content,
} as Config;
