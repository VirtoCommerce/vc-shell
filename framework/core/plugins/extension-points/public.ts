// @vc-shell/framework/extensions — Public API for the Extension Points system
// Only symbols intended for external consumers are exported here.

// Host-side: declare extension points in pages that accept plugins
export { defineExtensionPoint } from "@core/plugins/extension-points/defineExtensionPoint";
export type { DefineExtensionPointReturn } from "@core/plugins/extension-points/defineExtensionPoint";

// Plugin-side: register components into extension points
export { useExtensionPoint } from "@core/plugins/extension-points/useExtensionPoint";

// Render component
export { default as ExtensionPoint } from "@core/plugins/extension-points/ExtensionPoint.vue";

// Constants
export { ExtensionPoints } from "@core/plugins/extension-points/index";

// Types
export type { ExtensionComponent, ExtensionPointOptions } from "@core/plugins/extension-points/types";
export type { ExtensionPointName } from "@core/plugins/extension-points/index";
