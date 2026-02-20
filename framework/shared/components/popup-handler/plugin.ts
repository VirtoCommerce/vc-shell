import { App, shallowReactive, DefineComponent } from "vue";
import * as components from "@shared/components/popup-handler/components";
import { PopupPlugin, UsePopupProps, UsePopupInternal } from "@shared/components/popup-handler/types";
import { PopupPluginKey } from "@shared/components/popup-handler/keys";
import { createModule } from "@core/plugins";

export let popupPluginInstance: PopupPlugin;

export const VcPopupHandler = {
  install(app: App) {
    // Register components
    createModule(components).install(app);

    // Plugin
    const popups = shallowReactive<(UsePopupProps<DefineComponent> & UsePopupInternal)[]>([]);

    const popupPlugin: PopupPlugin = {
      popups,
    };

    app.config.globalProperties.$popupPlugin = popupPlugin;
    app.provide(PopupPluginKey, popupPlugin);
    popupPluginInstance = popupPlugin;
  },
};
