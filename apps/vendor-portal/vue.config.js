/* eslint-disable */
const fs = require('fs');
const path = require('path');
const tsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// Get actual package version from package.json
const packageJson = fs.readFileSync('./package.json');
const version = JSON.parse(packageJson).version || 0;

// Get tsconfig settings
const TSCONFIG = path.resolve(__dirname, './tsconfig.json');
const TSCONFIG_BUILD = path.resolve(__dirname, './tsconfig.build.json');

module.exports = {
  // Set up development server
  devServer: {
    proxy: {
      '/api': {
        target: `${process.env.PLATFORM_URL}`,
      },
      '/connect/token': {
        target: `${process.env.PLATFORM_URL}`,
      },
      '/pushNotificationHub': {
        target: `${process.env.PLATFORM_URL}`,
      },
    },
    historyApiFallback: true,
  },

  pwa: {
    name: 'Vendor Portal',
    themeColor: '#319ED4',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',

    // настройки манифеста
    manifestOptions: {
      display: 'fullscreen',
      start_url: "/index.html",
      icons: [
        { 'src': './img/icons/192x192.png', 'sizes': '192x192', 'type': 'image/png' },
        { 'src': './img/icons/512x512.png', 'sizes': '512x512', 'type': 'image/png' },
        { 'src': './img/icons/192x192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'maskable' },
        { 'src': './img/icons/512x512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable' }
      ],
    },

    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      navigateFallback: 'index.html',
    },

    iconPaths: {
      favicon32: 'img/icons/63x64.png',
      favicon16: 'img/icons/32x32.png',
      appleTouchIcon: 'img/icons/192x192.png',
      maskIcon: 'img/icons/512x512.png',
      msTileImage: 'img/icons/192x192.png'
    }
  },

  // Tune webpack configuration
  chainWebpack: (config) => {
    const tsconfigFile = config.get('mode') === "production" ? TSCONFIG_BUILD : TSCONFIG;
    config.resolve.plugin('paths').use(tsconfigPathsPlugin, [{
      configFile: tsconfigFile
    }]);

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

    // Define additional environment variables
    config
      .plugin('define')
      .tap((args) => {
        let env = args[0]["process.env"];
        args[0]["process.env"] = {
          ...env,
          "PACKAGE_VERSION": `"${version}"`,
          "PLATFORM_URL": `"${process.env.PLATFORM_URL}"`,
        };
        return args;
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
