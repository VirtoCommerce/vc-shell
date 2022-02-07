/* eslint-disable */
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../@(framework|apps)/*/src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-controls', '@storybook/addon-backgrounds'],

  typescript: {
    check: false,
  },

  webpackFinal(config) {
    const tsconfigFile = path.resolve(__dirname, '../tsconfig.build.json');

    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        configFile: tsconfigFile,
        extensions: config.resolve.extensions,
      }),
    ];

    config.module.rules.push({
      test: /\.less$/,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            modules: true,
            importLoaders: 1
          },
        },
        require.resolve('less-loader')
      ]
    });

    return config;
  },
}
