import type { Component } from "vue";
import { createKeyedBackendRegistry } from "@core/utilities";

export type PopupPreset = "warning" | "error" | "info";

const registry = createKeyedBackendRegistry<PopupPreset, Component>();

export function registerPopupPreset(preset: PopupPreset, component: Component): void {
  registry.register(preset, component);
}

export function getPopupPreset(preset: PopupPreset): Component | undefined {
  return registry.get(preset);
}

/** @internal Test teardown only */
export function _resetPopupPresets(): void {
  registry.reset();
}
