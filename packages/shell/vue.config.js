module.exports = {
  productionSourceMap: false,

  chainWebpack: (config) => {
    config.resolve.symlinks(false)
  }
};
