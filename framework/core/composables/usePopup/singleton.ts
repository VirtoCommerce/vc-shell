import type { PopupPlugin } from "@core/composables/usePopup/types";
import { createBackendRegistry } from "@core/utilities";

// `popupPluginInstance` is a live ESM binding read directly by usePopup and
// re-exported by the shell popup plugin, so it must stay a module-scoped
// variable. The registry is the source of truth; onChange mirrors it onto the
// exported binding so existing importers are unchanged.
export let popupPluginInstance: PopupPlugin | undefined;

const registry = createBackendRegistry<PopupPlugin>((impl) => {
  popupPluginInstance = impl ?? undefined;
});

export function setPopupPluginInstance(instance: PopupPlugin): void {
  registry.register(instance);
}

/** @internal Test teardown only */
export function _resetPopupSingleton(): void {
  registry.reset();
}
