import { App, shallowReactive, DefineComponent } from "vue";
import type { PopupPlugin, UsePopupProps, UsePopupInternal } from "@core/composables/usePopup/types";
import { PopupPluginKey } from "@core/composables/usePopup/keys";
import { setPopupPluginInstance } from "@core/composables/usePopup/singleton";
import { registerPopupPresets } from "@shell/_internal/popup/register-presets";

// Re-export for backward compatibility
export { popupPluginInstance } from "@core/composables/usePopup/singleton";

export const VcPopupHandler = {
  install(app: App) {
    const popups = shallowReactive<(UsePopupProps<DefineComponent> & UsePopupInternal)[]>([]);

    const popupPlugin: PopupPlugin = {
      popups,
    };

    app.config.globalProperties.$popupPlugin = popupPlugin;
    app.provide(PopupPluginKey, popupPlugin);
    setPopupPluginInstance(popupPlugin);
    registerPopupPresets();
  },
};
