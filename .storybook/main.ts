import { mergeConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { StorybookConfig } from "@storybook/vue3-vite";
import path from "path";
import type { Plugin, PluginOption } from 'vite';

export default {
  stories: [
    "../framework/ui/components/**/*.stories.ts",
    "../framework/shared/modules/dynamic/components/fields/storybook/**/*.stories.ts"
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  staticDirs: ["./assets"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      docgen: require('./advanced-docgen.js')
    },
  },
  docs: {
    autodocs: true,
  },
  async viteFinal(config, { configType }) {
      // Plugin setup to make vue-component-meta work after vue
      const plugins = config.plugins || [];

      // Find and modify the vue-component-meta plugin to load after vue
      const vueComponentMetaPlugin = plugins.find(
        (plugin) => {
          if (!plugin) return false;
          // Check if the plugin is an object with a name
          return typeof plugin === 'object' && 'name' in plugin &&
                 plugin.name === "storybook:vue-component-meta-plugin";
        }
      );

      if (vueComponentMetaPlugin && typeof vueComponentMetaPlugin === 'object') {
        // Set enforce: 'post', so the plugin loads after vue
        (vueComponentMetaPlugin as any).enforce = 'post';
        console.log('Vue Component Meta Plugin configured with enforce: post');
      }

      return mergeConfig(config, {
        plugins: [
          vue(),
        ],
        assetsInclude: ["/sb-preview/runtime.js"],
        resolve: {
          alias: {
            "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
            "@vc-shell/framework": "@vc-shell/framework/index.ts",
            "@": path.resolve(__dirname, "../"),
            "framework": path.resolve(__dirname, "../framework"),
            "~/": path.resolve(__dirname, "../"),
          },
          dedupe: ['vue', 'vue-router', 'vue-i18n']
        },
        optimizeDeps: {
          include: ['vue', 'vue-router', 'vue-i18n', '@vueuse/core', 'lodash-es']
        },
        define: {
          // Disable Vue warnings
          __VUE_PROD_DEVTOOLS__: 'false'
        }
      });

  },
} as StorybookConfig;
