module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  ignorePatterns: ["**/*.cjs.js"],
  plugins: ['@typescript-eslint', 'vue'],
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "plugin:import/recommended", "plugin:import/typescript", "@vue/typescript/recommended", "@vue/prettier", "@vue/eslint-config-typescript/recommended"],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "vue/multi-word-component-names": 'off'
  },
  globals: { defineOptions: 'writable' }
};
