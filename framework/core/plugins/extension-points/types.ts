import type { Component } from "vue";

export interface ExtensionComponent {
  /** Unique identifier — used for replacement and removal */
  id: string;
  /** Vue component to render */
  component: Component;
  /** Props passed to the component via v-bind */
  props?: Record<string, unknown>;
  /** Sort order (lower = rendered first). Default: 0 */
  priority?: number;
  /** Arbitrary metadata for filtering (e.g. { type: "action" }) */
  meta?: Record<string, unknown>;
}

export interface ExtensionPointOptions {
  /** Human-readable description for dev tools and documentation */
  description?: string;
}

export interface ExtensionPointState {
  /** Whether a host has declared this point via defineExtensionPoint */
  declared: boolean;
  /** Options provided at declaration */
  options: ExtensionPointOptions;
  /** Registered components */
  components: ExtensionComponent[];
}
