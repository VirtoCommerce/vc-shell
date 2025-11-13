import { createRequire } from "node:module";
import { mergeConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { StorybookConfig } from "@storybook/vue3-vite";
import path, { dirname, join } from "path";
import type { Plugin, PluginOption } from 'vite';

const require = createRequire(import.meta.url);

// Plugin to selectively disable some global variables from framework/index.ts
// but keep extension-points available
const preventGlobalsPlugin = (): Plugin => {
  return {
    name: 'prevent-vc-shell-globals',
    transform(code, id) {
      // Detect framework/index.ts file
      if (id.includes('framework/index.ts') && !id.includes('node_modules')) {
        // Keep extension-points and core functionality, disable only problematic globals
        // We'll keep the window.VcShellFramework but remove specific problematic assignments
        let modifiedCode = code;

        // Comment out specific problematic global assignments but keep the structure
        modifiedCode = modifiedCode.replace(
          /window\.VeeValidate\s*=\s*VeeValidate;/g,
          '// window.VeeValidate = VeeValidate; // Disabled in Storybook'
        );

        return {
          code: modifiedCode,
          map: null
        };
      }
      return null;
    }
  };
};

export default {
  stories: [
    "../framework/ui/components/**/*.stories.ts",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  staticDirs: ["./assets"],

  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {
      docgen: require('./advanced-docgen.js')
    },
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
          preventGlobalsPlugin(),
        ],
        assetsInclude: ["/sb-preview/runtime.js"],
        resolve: {
          alias: {
            "@vc-shell/framework/dist/index.css": "@vc-shell/framework/dist/index.css",
            "@vc-shell/framework": "@vc-shell/framework/index.ts",
            "@": path.resolve(__dirname, "../"),
            "framework": path.resolve(__dirname, "../framework"),
            "~/": path.resolve(__dirname, "../"),
            // Override extension-points imports to use the actual implementation
            "framework/core/plugins/extension-points": path.resolve(__dirname, "../framework/core/plugins/extension-points/index.ts"),
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

  }
} as StorybookConfig;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
