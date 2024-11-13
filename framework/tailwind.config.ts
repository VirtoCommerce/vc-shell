/** @type { import('tailwindcss').Config } */

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
  content,
};
