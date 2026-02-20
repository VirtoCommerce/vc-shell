/**
 * Advanced configuration for vue-component-meta
 * This file is used to configure docgen in Storybook
 */
import { fileURLToPath } from "node:url";

const tsconfigPath = fileURLToPath(new URL("./tsconfig.json", import.meta.url));

export default {
  // We specify that we are using the vue-component-meta plugin
  plugin: "vue-component-meta",

  // We specify the path to the tsconfig file for correct operation
  tsconfig: tsconfigPath,

  // We configure the error catching to prevent hangs
  safe: true,

  // Additional settings for vue-component-meta
  skipDemoshiki: true,

  // We add an error handler
  onError: (err) => {
    console.warn("vue-component-meta error:", err.message);
    // We return an empty object instead of crashing
    return {};
  },
};
