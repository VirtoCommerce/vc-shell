import type { InjectionKey } from "vue";
import type { PopupPlugin } from "@shell/_internal/popup/types";

export const PopupPluginKey: InjectionKey<PopupPlugin> = Symbol("PopupPlugin");
