import vue from "@vitejs/plugin-vue";
import { getLibraryConfiguration } from "@vc-shell/config-generator";
import * as path from "node:path";
import { checker } from "vite-plugin-checker";

const mode = process.env.APP_ENV as string;

const getCSSOptimizationConfig = () => {
  if (mode !== "production") return {};

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const purgecss = require("@fullhuman/postcss-purgecss");
    return {
      postcss: {
        plugins: [
          purgecss({
            content: ["./ui/**/*.vue", "./shared/**/*.vue", "./core/**/*.vue"],
            defaultExtractor(content: string) {
              const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, "");
              return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || [];
            },
            safelist: [/^bi-/, /^fa-/, /^fas/, /^material-symbols/, /^vc-icon/],
          }),
        ],
      },
    };
  } catch (e) {
    console.warn("PurgeCSS not installed, skipping CSS optimization");
    return {};
  }
};

const createComponentChunks = () => {
  return {
    "ui-layout": [
      "./ui/components/atoms/vc-container",
      "./ui/components/atoms/vc-row",
      "./ui/components/atoms/vc-col",
      "./ui/components/atoms/vc-widget",
      "./ui/components/atoms/vc-card",
    ],

    "ui-controls": [
      "./ui/components/atoms/vc-button",
      "./ui/components/atoms/vc-link",
      "./ui/components/atoms/vc-switch",
      "./ui/components/atoms/vc-label",
    ],

    "ui-indicators": [
      "./ui/components/atoms/vc-loading",
      "./ui/components/atoms/vc-progress",
      "./ui/components/atoms/vc-status",
      "./ui/components/atoms/vc-status-icon",
      "./ui/components/atoms/vc-badge",
      "./ui/components/atoms/vc-skeleton",
    ],

    "ui-media": ["./ui/components/atoms/vc-image", "./ui/components/atoms/vc-video", "./ui/components/atoms/vc-icon"],

    "ui-helpers": ["./ui/components/atoms/vc-tooltip", "./ui/components/atoms/vc-hint"],

    "ui-form-fields": [
      "./ui/components/molecules/vc-input",
      "./ui/components/molecules/vc-input-currency",
      "./ui/components/molecules/vc-textarea",
      "./ui/components/molecules/vc-select",
      "./ui/components/molecules/vc-checkbox",
      "./ui/components/molecules/vc-radio-button",
      "./ui/components/molecules/vc-slider",
      "./ui/components/molecules/vc-rating",
      "./ui/components/molecules/vc-multivalue",
      "./ui/components/molecules/vc-field",
    ],

    "ui-form": ["./ui/components/molecules/vc-form", "./ui/components/molecules/vc-file-upload"],

    "ui-content": [
      "./ui/components/molecules/vc-editor",
      "./ui/components/molecules/vc-breadcrumbs",
      "./ui/components/molecules/vc-pagination",
      "./ui/components/molecules/vc-toast",
    ],

    "ui-data": ["./ui/components/organisms/vc-table", "./ui/components/organisms/vc-dynamic-property"],

    "ui-navigation": ["./ui/components/organisms/vc-blade"],

    "ui-modals": ["./ui/components/organisms/vc-popup"],

    "ui-media-advanced": ["./ui/components/organisms/vc-gallery"],

    "ui-app": ["./ui/components/organisms/vc-app", "./ui/components/organisms/vc-login-form"],
  };
};

const createCoreChunks = () => {
  return {
    "core-api": ["./core/api/platform.ts"],
    "core-composables": ["./core/composables/index.ts"],
    "core-plugins": ["./core/plugins/index.ts"],
    "core-services": ["./core/services/index.ts"],
    "core-directives": ["./core/directives/index.ts"],
    "core-utilities": ["./core/utilities/index.ts"],
    "core-constants": ["./core/constants/index.ts"],
    "core-interceptors": ["./core/interceptors/index.ts"],
  };
};

const createSharedChunks = () => {
  return {
    "shared-components": ["./shared/components/index.ts"],
    "shared-composables": ["./shared/composables/index.ts"],
    "shared-modules": ["./shared/modules/index.ts"],
    "shared-pages": ["./shared/pages/index.ts"],
  };
};

export default getLibraryConfiguration({
  plugins: [
    vue(),
    checker({
      vueTsc: true,
    }),
    {
      name: "generate-css-entry",
      generateBundle(outputOptions, bundle) {
        // Create empty CSS file index.css in the dist directory
        // This file will import other CSS modules through @import
        let cssImports = "";

        // Collect all CSS files from bundle
        Object.keys(bundle).forEach((fileName) => {
          if (fileName.endsWith(".css")) {
            // Find the path to the CSS file relative to the dist root
            const relativePath = `./${fileName}`;
            // Add import
            cssImports += `@import "${relativePath}";\n`;
          }
        });

        // Create a new asset with imports of all CSS
        this.emitFile({
          type: "asset",
          fileName: "index.css",
          source: cssImports,
        });
      },
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
    ...getCSSOptimizationConfig(),
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    cssMinify: mode === "production",
    minify: mode === "production",
    sourcemap: mode === "development",
    chunkSizeWarningLimit: 2000,
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "framework",
      formats: ["es"],
      fileName: () => "framework",
    },
    rollupOptions: {
      external: ["vue", "vue-router", "vee-validate", "@vc-shell/config-generator"],
      output: {
        manualChunks: {
          fonts: [
            "@fontsource/plus-jakarta-sans",
            "@fontsource/plus-jakarta-sans/200.css",
            "@fontsource/plus-jakarta-sans/300.css",
            "@fontsource/plus-jakarta-sans/400.css",
            "@fontsource/plus-jakarta-sans/500.css",
            "@fontsource/plus-jakarta-sans/600.css",
            "@fontsource/plus-jakarta-sans/700.css",
            "@fontsource/plus-jakarta-sans/800.css",
          ],
          "icons-css": [
            "@fortawesome/fontawesome-free/css/fontawesome.min.css",
            "@fortawesome/fontawesome-free/css/solid.min.css",
            "bootstrap-icons/font/bootstrap-icons.min.css",
            "material-symbols/outlined.css",
          ],
          "lucide-icons": ["lucide-vue-next"],
          vueuse: ["@vueuse/core"],
          utils: ["lodash"],
          styles: ["./assets/styles/index.scss"],

          ...createComponentChunks(),

          ...createCoreChunks(),

          ...createSharedChunks(),
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "framework.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
      onwarn(warning, defaultHandler) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          typeof warning.message === "string" &&
          warning.message.includes("/*#__PURE__*/")
        ) {
          return;
        }

        if (typeof warning.message === "string" && warning.message.includes("@microsoft/signalr")) {
          return;
        }

        if (defaultHandler) defaultHandler(warning);
      },
    },
  },
  envPrefix: "APP_",
});
