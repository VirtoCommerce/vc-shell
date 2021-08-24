/* eslint-disable */
module.exports = {
  // Disable hashes in filenames
  filenameHashing: false,

  // Tune webpack configuration
  chainWebpack: config => {
    // Do not create entry points since we are building a library
    config.entryPoints.clear();

    // Remove unused webpack plugins to speed up bundling
    config.plugins.delete('html');
    config.plugins.delete('friendly-errors');
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
    config.module.rules.delete('vue');
    config.module.rules.delete('images');
    config.module.rules.delete('svg');
    config.module.rules.delete('media');
    config.module.rules.delete('fonts');
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
  },
};
