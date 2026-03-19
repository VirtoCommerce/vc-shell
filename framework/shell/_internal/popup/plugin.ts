import { App, shallowReactive, DefineComponent } from "vue";
import { PopupPlugin, UsePopupProps, UsePopupInternal } from "@shell/_internal/popup/types";
import { PopupPluginKey } from "@shell/_internal/popup/keys";

export let popupPluginInstance: PopupPlugin;

export const VcPopupHandler = {
  install(app: App) {
    const popups = shallowReactive<(UsePopupProps<DefineComponent> & UsePopupInternal)[]>([]);

    const popupPlugin: PopupPlugin = {
      popups,
    };

    app.config.globalProperties.$popupPlugin = popupPlugin;
    app.provide(PopupPluginKey, popupPlugin);
    popupPluginInstance = popupPlugin;
  },
};
