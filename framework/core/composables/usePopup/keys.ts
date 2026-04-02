import type { InjectionKey } from "vue";
import type { PopupPlugin } from "@core/composables/usePopup/types";

export const PopupPluginKey: InjectionKey<PopupPlugin> = Symbol("PopupPlugin");
