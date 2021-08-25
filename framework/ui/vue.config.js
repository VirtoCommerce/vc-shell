/* eslint-disable */
const path = require('path');

module.exports = {
  // Disable hashes in filenames
  filenameHashing: false,

  // Tune webpack configuration
  chainWebpack: config => {
    const tsconfigFile = path.resolve(__dirname, './tsconfig.build.json');

    // Do not create entry points since we are building a library
    config.entryPoints.clear();

    // Remove unused webpack plugins to speed up bundling
    config.plugins.delete('html');
    config.plugins.delete('friendly-errors');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.plugins.delete('feature-flags');

    // Remove unused webpack rules to speed up bundling
    config.module.rules.delete('postcss');
    config.module.rules.delete('pug');
    config.module.rules.delete('scss');
    config.module.rules.delete('sass');
    config.module.rules.delete('stylus');
    config.module.rules.delete('tsx');
    config.module.rule('css').oneOfs.delete('normal-modules')
    config.module.rule('css').oneOfs.delete('vue-modules')
    config.module.rule('less').oneOfs.delete('normal-modules')
    config.module.rule('less').oneOfs.delete('vue-modules')

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
