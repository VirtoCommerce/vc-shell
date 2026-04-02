import type { Component } from "vue";

export type PopupPreset = "warning" | "error" | "info";

const presetComponents = new Map<PopupPreset, Component>();

export function registerPopupPreset(preset: PopupPreset, component: Component): void {
  presetComponents.set(preset, component);
}

export function getPopupPreset(preset: PopupPreset): Component | undefined {
  return presetComponents.get(preset);
}

/** @internal Test teardown only */
export function _resetPopupPresets(): void {
  presetComponents.clear();
}
