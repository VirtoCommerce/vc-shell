import path, { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default {
  build: {
    lib: {
      entry: resolve(__dirname, "./src/modules/index.ts"),
      fileName: "vc-sample-modules",
      formats: ["es"],
    },
    outDir: path.join(__dirname, "dist"),
    rollupOptions: {
      external: [/node_modules/, "@vc-shell/framework", "vue", "vue-router"],
    },
  },
  plugins: [vue()],
};
