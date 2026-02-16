// Host-side: declare extension points in pages that accept plugins
export { defineExtensionPoint } from "./defineExtensionPoint";

// Plugin-side: register components into extension points
export { useExtensionPoint } from "./useExtensionPoint";

// Render component
export { default as ExtensionPoint } from "./ExtensionPoint.vue";

// Types
export type { ExtensionComponent, ExtensionPointOptions } from "./types";
