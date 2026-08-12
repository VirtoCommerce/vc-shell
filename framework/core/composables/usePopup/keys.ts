import type { InjectionKey } from "vue";
import type { PopupPlugin, PopupInstanceContext } from "@core/composables/usePopup/types";

export const PopupPluginKey: InjectionKey<PopupPlugin> = Symbol("PopupPlugin");

/** Provided per rendered popup so the dialog can drive its own close sequence. */
export const PopupInstanceKey: InjectionKey<PopupInstanceContext> = Symbol("PopupInstance");
