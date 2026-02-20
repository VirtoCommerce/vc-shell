module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: ["@typescript-eslint", "vue", "import"],
  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/eslint-config-typescript/recommended",
    "plugin:storybook/recommended",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2022,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        project: [
          "cli/*/tsconfig.json",
          "framework/tsconfig.json",
          "apps/*/tsconfig.json",
          "sample/*/tsconfig.json",
          "configs/*/tsconfig.json",
        ],
      },
      alias: {
        map: [
          ["@", "./framework"],
          ["@framework", "./framework"],
          ["@core", "./framework/core"],
          ["@ui", "./framework/ui"],
          ["@shared", "./framework/shared"],
          ["@assets", "./framework/assets"],
          ["@locales", "./framework/locales"],
          ["@vite-config", "./configs/vite-config/src"],
          ["@release-config", "./configs/release-config/src"],
          ["@api-client-generator", "./cli/api-client/src"],
          ["@create-vc-app", "./cli/create-vc-app/src"],
        ],
        extensions: [".ts", ".js", ".jsx", ".json", ".vue"],
      },
    },
  },
  rules: {
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "vue/multi-word-component-names": "off",
    "vue/require-default-prop": "off",
    "vue/no-v-html": "off",
    "vue/no-template-shadow": "off",
    "vue/one-component-per-file": "off",
  },
};
