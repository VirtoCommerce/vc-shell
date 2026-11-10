import { nextTick, watch, type Ref } from "vue";
import type { PresetsApi } from "./usePresets";

/**
 * Saving moves focus into the name field; when it ends, focus goes back to what opened it, or to the new preset.
 * The preset is looked up in this bar (or its phone sheet), never in another bar on the page.
 */
export function useSaveFocus(presets: PresetsApi, root: Ref<HTMLElement | undefined>) {
  let opener: Element | null = null;
  let scope: ParentNode | undefined;
  watch(
    () => presets.saving.value,
    (saving) => {
      if (saving) {
        opener = document.activeElement;
        // the phone sheet is teleported out of the bar
        scope = opener?.closest(".vc-sidebar") ?? root.value;
        return;
      }
      const from = opener;
      const within = scope;
      opener = null;
      scope = undefined;
      nextTick(() => {
        const target =
          (from?.isConnected ? from : null) ??
          within?.querySelector(
            // the tray chip, or the row of the phone presets sheet
            `[data-preset-id="${presets.flashId.value}"] :is(.vc-search-bar__preset-main, .vc-search-bar__all-main)`,
          );
        (target as HTMLElement | null)?.focus();
      });
    },
    { flush: "sync" },
  );
}
