// Host-side: declare extension points in pages that accept plugins
export { defineExtensionPoint } from "@core/plugins/extension-points/defineExtensionPoint";
export type { DefineExtensionPointReturn } from "@core/plugins/extension-points/defineExtensionPoint";

// Plugin-side: register components into extension points
export { useExtensionPoint } from "@core/plugins/extension-points/useExtensionPoint";

// Render component
export { default as ExtensionPoint } from "@core/plugins/extension-points/ExtensionPoint.vue";

// Types
export type { ExtensionComponent, ExtensionPointOptions } from "@core/plugins/extension-points/types";

/**
 * Typed map of framework-owned extension point names.
 * Use these constants instead of raw strings for IDE autocomplete and typo safety.
 *
 * App-level extension point names (e.g., "seller:commissions") are the app's
 * responsibility to enumerate.
 */
export const ExtensionPoints = {
  /** Login page - slot after the sign-in form */
  AUTH_AFTER_FORM: "auth:after-form",
} as const;

/** Union type of all framework-owned extension point name values. */
export type ExtensionPointName = (typeof ExtensionPoints)[keyof typeof ExtensionPoints];
