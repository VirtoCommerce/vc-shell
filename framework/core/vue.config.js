/* eslint-disable */
const path = require('path');
const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  // Disable hashes in filenames
  filenameHashing: false,

  // Tune webpack configuration
  chainWebpack: config => {
    const tsconfigFile = path.resolve(__dirname, './tsconfig.build.json');
    config.resolve.plugin('paths').use(tsconfigPathsPlugin, [{
      configFile: tsconfigFile
    }]);

    // Do not create entry points since we are building a library
    config.entryPoints.clear();

    // Remove unused webpack plugins to speed up bundling
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.plugins.delete('feature-flags');
    config.plugins.delete('vue-loader');

    // Remove unused webpack rules to speed up bundling
    config.module.rules.delete('postcss');
    config.module.rules.delete('pug');
    config.module.rules.delete('scss');
    config.module.rules.delete('sass');
    config.module.rules.delete('stylus');
    config.module.rules.delete('tsx');
    config.module.rules.delete('css');
    config.module.rules.delete('less');
    config.module.rules.delete('vue');
    config.module.rules.delete('images');
    config.module.rules.delete('svg');
    config.module.rules.delete('media');
    config.module.rules.delete('fonts');

    // Override typescript rules to bundle declaration files in package
    config.module.rule('ts').uses.delete('thread-loader');
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => {
        options.transpileOnly = false;
        options.happyPackMode = false;
        return options;
      });

    // Remove external packages from bundle
    config.externals([
      "@virtoshell/api-client",
    ]);

    // Define tsconfig settings for bundling
    config.module
      .rule('ts')
      .use('ts-loader')
      .merge({
        options: {
          configFile: tsconfigFile,
        },
      });
    config
      .plugin('fork-ts-checker')
      .tap(args => {
        args[0].typescript.configFile = tsconfigFile;
        return args;
      });
  },
};
