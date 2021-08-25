/* eslint-disable */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-controls'],

  typescript: {
    check: false,
  },

  webpackFinal(config) {
    const tsconfigFile = path.resolve(__dirname, '../../tsconfig.build.json');

    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        configFile: tsconfigFile,
        extensions: config.resolve.extensions,
      }),
    ];

    return config;
  },
}
