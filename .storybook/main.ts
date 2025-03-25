export default {
  stories: ["../framework/**/*.stories.ts"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  staticDirs: ["./assets"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      builder: {
        viteConfigPath: ".storybook/vite.config.mts",
      },
    },
  },
  docs: {
    autodocs: true,
  },
};
