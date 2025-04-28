export default {
  stories: [
    "../framework/ui/components/**/*.stories.ts",
    "../framework/shared/modules/dynamic/components/fields/storybook/**/*.stories.ts"
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  staticDirs: ["./assets"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      docgen: "vue-component-meta",
      builder: {
        viteConfigPath: ".storybook/vite.config.mts",
      },
    },
  },
  docs: {
    autodocs: true,
  },
};
