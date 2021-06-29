module.exports = {
  root: true,

  env: {
    node: true,
  },

  parserOptions: {
    ecmaVersion: 2020,
  },

  rules: {
    "no-console": "off",
    "no-debugger": "off",
  },

  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
};
