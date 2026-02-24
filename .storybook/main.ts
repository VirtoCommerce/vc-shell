import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mergeConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { StorybookConfig } from "@storybook/vue3-vite";
import path, { dirname, join } from "path";
import { fileURLToPath } from "node:url";
import type { Plugin } from 'vite';
import advancedDocgen from './advanced-docgen.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const frameworkRoot = path.resolve(__dirname, "../framework");

// Plugin to strip invalid __docgenInfo assignments from barrel re-export files.
// vue-component-meta injects `ComponentName.__docgenInfo = {...}` into barrel files
// that use `export * from`, but ESM `export *` does NOT create local bindings,
// so the assignments throw ReferenceError at runtime.
const stripInvalidDocgen = (): Plugin => {
  return {
    name: 'strip-invalid-docgen',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('node_modules') || !code.includes('__docgenInfo')) {
        return null;
      }

      let modified = false;
      const result = code.replace(/^;(\w+)\.__docgenInfo\s*=\s*\{.*$/gm, (match, varName) => {
        // Keep docgen if the variable is a local binding (imported or declared)
        const isLocal =
          new RegExp(`\\bimport\\b[^;]*\\b${varName}\\b`).test(code) ||
          new RegExp(`(?:const|let|var|function|class)\\s+${varName}\\b`).test(code);
        if (!isLocal) {
          modified = true;
          return ''; // Strip — variable is only a re-export, not a local binding
        }
        return match;
      });

      return modified ? { code: result, map: null } : null;
    }
  };
};

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
    "../framework/shared/components/**/*.stories.ts",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
  ],

  staticDirs: ["./assets"],

  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {
      docgen: advancedDocgen
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

      // Check if framework/dist/index.css exists (production build)
      const distCssPath = path.resolve(__dirname, "../framework/dist/index.css");
      const hasDist = existsSync(distCssPath);

      return mergeConfig(config, {
        plugins: [
          vue(),
          preventGlobalsPlugin(),
          stripInvalidDocgen(),
        ],
        assetsInclude: ["/sb-preview/runtime.js"],
        resolve: {
          alias: {
            "@framework": frameworkRoot,
            "@core": path.resolve(frameworkRoot, "core"),
            "@core/": `${path.resolve(frameworkRoot, "core")}/`,
            "@ui": path.resolve(frameworkRoot, "ui"),
            "@ui/": `${path.resolve(frameworkRoot, "ui")}/`,
            // Explicit alias to help vue-component-meta resolve type imports in SFCs
            "@ui/types": path.resolve(frameworkRoot, "ui/types/index.ts"),
            "@ui/types/": `${path.resolve(frameworkRoot, "ui/types")}/`,
            "@shared": path.resolve(frameworkRoot, "shared"),
            "@shared/": `${path.resolve(frameworkRoot, "shared")}/`,
            "@assets": path.resolve(frameworkRoot, "assets"),
            "@assets/": `${path.resolve(frameworkRoot, "assets")}/`,
            "@locales": path.resolve(frameworkRoot, "locales"),
            "@locales/": `${path.resolve(frameworkRoot, "locales")}/`,
            // In dev mode (no dist), resolve to SCSS sources
            // In production mode (with dist), resolve to compiled CSS
            "@vc-shell/framework/dist/index.css": hasDist
              ? distCssPath
              : path.resolve(__dirname, "../framework/assets/styles/index.scss"),
            "@vc-shell/framework": path.resolve(__dirname, "../framework/index.ts"),
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

  }
} as StorybookConfig;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
