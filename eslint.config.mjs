import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import vuePrettierConfig from "@vue/eslint-config-prettier";
import storybookPlugin from "eslint-plugin-storybook";
import importPlugin from "eslint-plugin-import";

export default [
  // Ignores (replaces .eslintignore)
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      // `.ejs` sources are not valid TS/Vue, so they stay out of the lint globs
      // by extension; the plain files under `templates/` are linted.
      "cli/create-vc-app/src/templates/**/_yarn/**",
      "cli/migrate/tests/**/__testfixtures__/**",
      "configs/vite-config/src/templates/**",
      "api-client.ts",
      ".worktrees/**",
    ],
  },

  // Import resolution. Must come before the Vue/TS configs: the recommended
  // preset sets a global `languageOptions.ecmaVersion` with no `files` scope and
  // would otherwise override the parsers they install.
  importPlugin.flatConfigs.recommended,

  importPlugin.flatConfigs.typescript,

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
      "vue/no-restricted-class": [
        "error",
        "/tw-z-\\[\\d/",
      ],
    },
  },

  // Test files: relax Vue rules that apply to component props — test stubs
  // commonly use array-form props which is fine for mocks.
  {
    files: ["**/*.test.{ts,vue}", "**/*.spec.{ts,vue}"],
    rules: {
      "vue/require-prop-types": "off",
    },
  },

  // Prettier (must be last among formatting configs)
  vuePrettierConfig,

  // Project rules
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["tsconfig.json", "*/tsconfig.json", "*/*/tsconfig.json"],
          noWarnOnMultipleProjects: true,
        },
      },
    },
    rules: {
      // Workspace packages resolve through `main`/`types` fields that point into
      // `dist/`, and CI does not build before linting (`yarn install` →
      // `yarn lint:check`, no build step). Whether the resolver falls back to
      // `src/` is platform-dependent, so do not rely on it.
      "import/no-unresolved": ["error", { ignore: ["^@vc-shell/"] }],
      // TypeScript already covers these, and the rules parse dependency sources
      // with espree, which chokes on modern syntax in `dist` output.
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/triple-slash-reference": "off",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "off",
      "vue/no-template-shadow": "off",
      "vue/one-component-per-file": "off",
    },
  },

  // File-scoped exceptions. These must stay last: flat config resolves rules in
  // array order, so an earlier override would be undone by the block above.
  //
  // Scaffolding templates reference files that only exist after rendering
  // (`routes.ts` is `routes.ts.ejs`, `/assets/*` is served from `public/`).
  {
    files: ["cli/create-vc-app/src/templates/**"],
    rules: {
      "import/no-unresolved": "off",
    },
  },

  // The public barrel re-exports some names both explicitly and via `export *`
  // from the same module. That is legal — an explicit export shadows a star
  // export — but the rule cannot tell it apart from a genuine collision.
  {
    files: ["framework/index.ts"],
    rules: {
      "import/export": "off",
    },
  },
];
