import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import vuePrettierConfig from "@vue/eslint-config-prettier";
import storybookPlugin from "eslint-plugin-storybook";

export default [
  // Ignores (replaces .eslintignore)
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "cli/create-vc-app/src/templates/**",
      "api-client.ts",
      ".worktrees/**",
    ],
  },

  // Vue recommended (flat config)
  ...pluginVue.configs["flat/recommended"],

  // TypeScript
  ...vueTsEslintConfig(),

  // Storybook
  ...storybookPlugin.configs["flat/recommended"],

  // Z-index token enforcement — blocks tw-z-[<number>] in templates
  {
    files: ["**/*.vue"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/tw-z-\\[\\d/]",
          message: "Use tw-z-[var(--z-*)] token instead of hardcoded tw-z-[number]. See framework/assets/styles/theme/_z-index.scss",
        },
      ],
    },
  },

  // Prettier (must be last among formatting configs)
  vuePrettierConfig,

  // Project rules
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/triple-slash-reference": "off",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "off",
      "vue/no-template-shadow": "off",
      "vue/one-component-per-file": "off",
    },
  },
];
