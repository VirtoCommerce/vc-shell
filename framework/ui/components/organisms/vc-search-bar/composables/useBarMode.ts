import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from "vue";

export type BarMode = "wide" | "medium" | "narrow";

export const WIDE_MIN = 720;
export const MEDIUM_MIN = 480;

/** Wide shows chips in the row, medium only the Filters button, narrow an icon Filters button */
export function modeForWidth(w: number): BarMode {
  if (w >= WIDE_MIN) return "wide";
  if (w >= MEDIUM_MIN) return "medium";
  return "narrow";
}

/** The width of `el` (content box, ResizeObserver) and its mode; wide until the first measurement */
export function useBarMode(el: Ref<HTMLElement | undefined>): { mode: ComputedRef<BarMode>; width: Ref<number> } {
  const width = ref(Infinity);
  let observer: ResizeObserver | undefined;

  watch(
    el,
    (node) => {
      observer?.disconnect();
      observer = undefined;
      if (!node || typeof ResizeObserver === "undefined") return;
      observer = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (entry) width.value = entry.contentRect.width;
      });
      observer.observe(node);
    },
    { immediate: true },
  );

  onScopeDispose(() => observer?.disconnect());

  return { mode: computed(() => modeForWidth(width.value)), width };
}
