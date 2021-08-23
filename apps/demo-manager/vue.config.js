/* eslint-disable */
const fs = require('fs');
const packageJson = fs.readFileSync('./package.json');
const version = JSON.parse(packageJson).version || 0;

module.exports = {
  devServer: {
    proxy: {
      '/api': {
          target: `${process.env.PLATFORM_URL}`,
      },
      '/connect/token': {
        target: `${process.env.PLATFORM_URL}`,
      },
    },
    historyApiFallback: true,
  },

  chainWebpack: (config) => {
    config
      .plugin('define')
      .tap((args) => {
        let env = args[0]["process.env"];
        args[0]["process.env"] = {
          ...env,
          "PACKAGE_VERSION": `"${version}"`,
          "PLATFORM_URL": `${process.env.PLATFORM_URL}`,
        };
        return args;
       });
  },
};
