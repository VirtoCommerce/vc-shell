/* eslint-disable */
module.exports = {
  // disable hashes in filenames
  filenameHashing: false,

  // delete HTML related webpack plugins
  chainWebpack: config => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.externals(["vue-i18n", "vue-logger-plugin"]);
  },

  productionSourceMap: false,
};
