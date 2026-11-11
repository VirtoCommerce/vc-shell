import { h, inject, onScopeDispose, ref, watch, type Ref } from "vue";
import { useEventListener } from "@vueuse/core";
import { BladeTitleAddonKey } from "@framework/injection-keys";
import { BladeStackKey } from "@core/blade-navigation/types";
import { isTextInputFocused } from "@core/composables/useKeyboardShortcuts";
import ViewSelector from "../components/ViewSelector.vue";
import type { ViewsApi } from "./useViews";

export interface UseBarViewSelectorOptions {
  /** Off: nothing to filter, or a phone */
  enabled: () => boolean;
  views: ViewsApi;
  counts: () => Record<string, number> | undefined;
  disabled: () => boolean;
}

/** Puts the view selector into the enclosing blade's title addon slot; `inHeader` is false without a blade or when another bar holds it */
export function useBarViewSelector(o: UseBarViewSelectorOptions): { inHeader: Ref<boolean> } {
  const registry = inject(BladeTitleAddonKey, null);
  const inHeader = ref(false);
  let unregister: (() => void) | null = null;

  const render = () => h(ViewSelector, { views: o.views, counts: o.counts(), disabled: o.disabled() });

  function release() {
    unregister?.();
    unregister = null;
    inHeader.value = false;
  }

  watch(
    () => !!registry && o.enabled(),
    (on) => {
      release();
      if (!on) return;
      unregister = registry!.register(render);
      inHeader.value = !!unregister;
    },
    { immediate: true },
  );
  onScopeDispose(release);

  return { inHeader };
}

/** `/` outside a text field focuses the search, only in the active blade (or anywhere outside blades) */
export function useSlashFocus(o: { enabled: () => boolean; bladeId: () => string | undefined; focus: () => void }) {
  const stack = inject(BladeStackKey, undefined);
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || !o.enabled()) return;
    if (isTextInputFocused()) return;
    const id = o.bladeId();
    if (id && stack && stack.activeBlade.value?.id !== id) return;
    // claimed, so a second bar on the page leaves it
    e.preventDefault();
    o.focus();
  });
}
