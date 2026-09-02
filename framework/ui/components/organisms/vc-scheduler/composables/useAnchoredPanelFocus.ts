import { nextTick, watch, type Ref } from "vue";

/**
 * Moves focus into an anchored panel when it opens, and back to the opener when
 * it closes.
 *
 * The panel is teleported to the end of the document, so without this a keyboard
 * user who opens it has to Tab through the rest of the page to reach its
 * contents, and on close is left wherever the removed node used to be.
 *
 * Shared rather than written per popover: the "did focus leave on its own?"
 * check below has to run at a specific moment, and a second hand-written copy is
 * where that detail gets lost (VCST-5802).
 *
 * @param isOpen      the panel's open state
 * @param panelRef    the panel's own root, used to tell whether focus is inside it
 * @param firstTarget what should receive focus on open; may not exist yet, so it
 *                    is resolved after the DOM is patched
 */
export function useAnchoredPanelFocus(
  isOpen: Ref<boolean> | (() => boolean),
  panelRef: Ref<HTMLElement | null>,
  firstTarget: () => HTMLElement | null | undefined,
): void {
  let opener: HTMLElement | null = null;

  watch(
    typeof isOpen === "function" ? isOpen : () => isOpen.value,
    (open) => {
      if (open) {
        opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        nextTick(() => firstTarget()?.focus());
        return;
      }

      // Checked before the DOM patch, while the panel still exists: only reclaim
      // focus if it is inside the panel being removed. If the user clicked
      // elsewhere, focus is where they put it.
      const active = document.activeElement;
      const focusIsInPanel = !!panelRef.value && active instanceof Node && panelRef.value.contains(active);
      const target = opener;
      opener = null;
      if (!focusIsInPanel) return;

      nextTick(() => {
        if (target?.isConnected) target.focus();
      });
    },
    // Mounting with the panel already open is how these are usually rendered.
    { immediate: true },
  );
}
