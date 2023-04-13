const {
  mergeConfig
} = require('vite');
module.exports = {
  stories: ['../framework/ui/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-controls', '@storybook/addon-backgrounds'],
  core: {
    builder: '@storybook/builder-vite'
  },
  staticDirs: ['./assets'],
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        preserveSymlinks: true,
        alias: {
          "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
          "@vc-shell/framework": "@vc-shell/framework/index.ts",
        }
      }
    });
  },
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
};
