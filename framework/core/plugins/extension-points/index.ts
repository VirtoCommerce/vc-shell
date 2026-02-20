// Host-side: declare extension points in pages that accept plugins
export { defineExtensionPoint } from "@core/plugins/extension-points/defineExtensionPoint";

// Plugin-side: register components into extension points
export { useExtensionPoint } from "@core/plugins/extension-points/useExtensionPoint";

// Render component
export { default as ExtensionPoint } from "@core/plugins/extension-points/ExtensionPoint.vue";

// Types
export type { ExtensionComponent, ExtensionPointOptions } from "@core/plugins/extension-points/types";
