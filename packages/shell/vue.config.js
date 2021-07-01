/* eslint-disable */
const path = require("path");

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      symlinks: false,
      alias: {
        vue: path.resolve("./node_modules/vue"),
      },
    },
  },
};
