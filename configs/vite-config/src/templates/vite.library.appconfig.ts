import { defineConfig, PluginOption } from "vite";
import { cwd } from "node:process";
import path from "node:path";
// import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  // plugins: [
  //   visualizer({
  //     open: true,
  //     filename: "dist/stats-shell.html",
  //   }) as PluginOption,
  // ],
  resolve: {
    dedupe: ["@intlify", "vue", "@vue/runtime-core"],
  },
  build: {
    lib: {
      entry: path.resolve(cwd(), "index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      // Externalize deps that consuming apps likely have or should manage
      // external: [
      //   // Vue ecosystem (required)
      //   "vue",
      //   "@vue/runtime-core",
      //   "@vue/shared",
      //   "vue-router", // Most Vue apps have router

      //   // Common utilities (let apps choose versions)
      //   "@vueuse/core", // Popular Vue composition utilities
      //   "@vueuse/integrations", // Optional VueUse extensions
      //   "@vueuse/components", // VueUse components
      //   "lodash-es", // Utility library
      //   "moment", // Date library
      // ],
      output: {
        entryFileNames: "framework.js",
        chunkFileNames: "[name]-[hash].js",
        // globals: {
        //   vue: "Vue",
        //   "vue-router": "VueRouter",
        //   "@vueuse/core": "VueUse",
        //   "@vueuse/integrations": "VueUse",
        //   "@vueuse/components": "VueUse",
        //   moment: "Moment",
        //   "lodash-es": "Lodash",
        // },
        // Simple chunking: one library = one chunk, all shell code in main chunk
        manualChunks: (id) => {
          // Normalize path for cross-platform compatibility
          const normalizedId = id.replace(/\\/g, "/");

          // Each node_modules library gets its own chunk
          if (normalizedId.includes("node_modules")) {
            // Extract library name from path
            const parts = normalizedId.split("node_modules/")[1].split("/");
            let libName = parts[0];

            // Handle scoped packages like @tiptap/core -> tiptap-core
            if (libName.startsWith("@")) {
              const scopedParts = normalizedId.split("node_modules/")[1].split("/").slice(0, 2);
              libName = scopedParts.join("-").replace("@", "");
            }

            // Clean up library name for chunk name
            return `vendor-${libName.replace(/[^a-z0-9-]/gi, "-")}`;
          }

          // All framework code (ui, core, shared, assets, locales) goes to main chunk
          // Return undefined to include in the main framework.js file
          return undefined;
        },
      },
      // Improved tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.APP_ENV === "production",
        drop_debugger: process.env.APP_ENV === "production",
        pure_funcs: process.env.APP_ENV === "production" ? ["console.log", "console.info", "console.debug"] : [],
      },
      mangle: {
        safari10: true,
      },
    },
  },
  esbuild: {
    drop: process.env.APP_ENV === "production" ? ["console", "debugger"] : [],
    treeShaking: true,
  },
});
