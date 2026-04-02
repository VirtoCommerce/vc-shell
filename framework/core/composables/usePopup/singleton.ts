import type { PopupPlugin } from "@core/composables/usePopup/types";

export let popupPluginInstance: PopupPlugin | undefined;

export function setPopupPluginInstance(instance: PopupPlugin): void {
  popupPluginInstance = instance;
}

/** @internal Test teardown only */
export function _resetPopupSingleton(): void {
  popupPluginInstance = undefined;
}
