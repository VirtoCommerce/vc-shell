import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from "vue";

export const NARROW_WIDTH = 640;

export interface UseBarLayoutOptions {
  /** The bar root, measured with ResizeObserver. */
  el: Ref<HTMLElement | undefined>;
  isMobile: Ref<boolean>;
  collapseSearch: () => boolean | undefined;
  /** Fields, presets or builder/advanced present. */
  hasExtras: () => boolean;
}

export function useBarLayout(o: UseBarLayoutOptions): {
  narrow: ComputedRef<boolean>;
  searchCollapsed: ComputedRef<boolean>;
} {
  // Before the first measurement the bar counts as wide.
  const width = ref(Infinity);

  let observer: ResizeObserver | undefined;

  watch(
    o.el,
    (el) => {
      observer?.disconnect();
      observer = undefined;
      if (!el || typeof ResizeObserver === "undefined") return;
      observer = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (entry) width.value = entry.contentRect.width;
      });
      observer.observe(el);
    },
    { immediate: true },
  );

  onScopeDispose(() => observer?.disconnect());

  const narrow = computed(() => o.isMobile.value || width.value < NARROW_WIDTH);

  const searchCollapsed = computed(() => {
    const forced = o.collapseSearch();
    if (forced !== undefined) return forced;
    return narrow.value && o.hasExtras();
  });

  return { narrow, searchCollapsed };
}
