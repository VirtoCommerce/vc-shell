module.exports = {
  stories: ['../@(framework|apps)/*/src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-controls', '@storybook/addon-backgrounds'],

  typescript: {
    check: false,
  },

  core: { builder: "storybook-builder-vite" },

  async viteFinal(config) {
      config.resolve.preserveSymlinks = true
      return config
  },
}
