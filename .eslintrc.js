module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['@typescript-eslint', 'vue', 'import'],
  extends: ["plugin:vue/vue3-recommended", "eslint:recommended", "plugin:import/recommended", "plugin:import/typescript", "@vue/typescript/recommended", "@vue/prettier", "@vue/eslint-config-typescript/recommended"],
  parser: "vue-eslint-parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    node: true,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "vue/multi-word-component-names": 'off',
    "vue/require-default-prop": 'off',
    "vue/no-v-html": 'off',
    "vue/no-template-shadow": "off"
  },
};
