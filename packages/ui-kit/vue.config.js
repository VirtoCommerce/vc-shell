/* eslint-disable */
const path = require("path");

module.exports = {
  // disable hashes in filenames
  filenameHashing: false,

  // delete HTML related webpack plugins
  chainWebpack: config => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  },

  productionSourceMap: false,

  configureWebpack: {
    // Fix for vue instance duplication: https://github.com/vuejs/vue-next/issues/2064#issuecomment-797365133
    resolve: {
      symlinks: false,
      alias: {
        vue: path.resolve("./node_modules/vue"),
      },
    },
  }
};
