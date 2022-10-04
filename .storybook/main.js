const { mergeConfig } = require('vite');

module.exports = {
  stories: ['../@(framework|apps)/*/src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-controls', '@storybook/addon-backgrounds'],

  typescript: {
    check: false,
  },

  core: { builder: "@storybook/builder-vite" },

  async viteFinal(config) {
      return mergeConfig(config, {
          resolve: {
              preserveSymlinks: true,
              alias: {
                  "@virtoshell/core": "@virtoshell/core/src/index.ts",
              },
          },

      })
  },
}
