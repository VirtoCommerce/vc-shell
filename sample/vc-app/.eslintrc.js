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
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 2022,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json", "./src/api_client/tsconfig.json", "./src/modules/tsconfig.json"],
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
  },
};
