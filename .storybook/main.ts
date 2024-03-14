import { mergeConfig } from "vite";

export default {
  stories: ["../framework/ui/components/**/*.stories.ts"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  staticDirs: ["./assets"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      builder: {
        viteConfigPath: ".storybook/vite.config.ts",
      },
    },
  },
  docs: {
    autodocs: true,
  },
};
