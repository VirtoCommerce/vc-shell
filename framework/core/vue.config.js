/* eslint-disable */
module.exports = {
  // disable hashes in filenames
  filenameHashing: false,

  // delete HTML related webpack plugins
  chainWebpack: config => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.module.rule('ts').uses.delete('thread-loader');
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => {
        options.transpileOnly = false;
        options.happyPackMode = false;
        options.compilerOptions = {
          declaration: true,
          noEmit: false,
          outDir: 'dist',
        };
        return options;
      })
    config.externals([
      "vue-i18n",
      "@virtoshell/ui",
      "vue-logger-plugin",
      "vue-router",
    ]);
  },

  productionSourceMap: false,
};
