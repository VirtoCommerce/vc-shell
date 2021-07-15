/* eslint-disable */
module.exports = {
  // disable hashes in filenames
  filenameHashing: false,

  productionSourceMap: false,

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },
  },
};
