import type { InjectionKey } from "vue";
import type { PopupPlugin } from "@shared/components/popup-handler/types";

export const PopupPluginKey: InjectionKey<PopupPlugin> = Symbol("PopupPlugin");
