import { registerPopupPreset } from "@core/composables/usePopup/preset-registry";
import vcPopupWarning from "@shell/_internal/popup/common/vc-popup-warning.vue";
import vcPopupError from "@shell/_internal/popup/common/vc-popup-error.vue";
import vcPopupInfo from "@shell/_internal/popup/common/vc-popup-info.vue";

/**
 * Registers shell popup preset components (warning, error, info) with the core popup registry.
 * Called once during framework plugin install.
 */
export function registerPopupPresets(): void {
  registerPopupPreset("warning", vcPopupWarning);
  registerPopupPreset("error", vcPopupError);
  registerPopupPreset("info", vcPopupInfo);
}
