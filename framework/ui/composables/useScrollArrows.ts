import { ref, onBeforeUnmount, type Ref } from "vue";
import { useResizeObserver } from "@vueuse/core";

export interface UseScrollArrowsOptions {
  /** Pixels per animation frame (~60fps). Default: 2 */
  speed?: number;
}

/**
 * Whether a scroll container has reached its end. Under a fractional zoom an exact comparison
 * never sees it: scrollHeight and clientHeight are rounded to whole CSS pixels, and the scroll
 * position stops on a whole device pixel, which is more than one CSS pixel when zoomed out
 * (1.49 at 67%). The slack covers both — a pixel for the rounding, a device pixel for the stop.
 */
export function isScrolledToEnd(el: HTMLElement): boolean {
  const devicePixel = 1 / (window.devicePixelRatio || 1);
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 1 - devicePixel;
}

export function useScrollArrows(viewportRef: Ref<HTMLElement | null>, options: UseScrollArrowsOptions = {}) {
  const { speed = 2 } = options;

  const canScrollUp = ref(false);
  const canScrollDown = ref(false);
  let scrollAnimationId: number | null = null;

  function updateScrollState() {
    const el = viewportRef.value;
    if (!el) {
      canScrollUp.value = false;
      canScrollDown.value = false;
      return;
    }
    canScrollUp.value = el.scrollTop > 0;
    canScrollDown.value = !isScrolledToEnd(el);
  }

  function startScroll(direction: "up" | "down") {
    stopScroll();
    const el = viewportRef.value;
    if (!el) return;

    function tick() {
      if (!el) return;
      el.scrollTop += direction === "up" ? -speed : speed;
      updateScrollState();
      scrollAnimationId = requestAnimationFrame(tick);
    }
    scrollAnimationId = requestAnimationFrame(tick);
  }

  function stopScroll() {
    if (scrollAnimationId !== null) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
  }

  useResizeObserver(viewportRef, updateScrollState);

  onBeforeUnmount(() => {
    stopScroll();
  });

  return {
    canScrollUp,
    canScrollDown,
    startScroll,
    stopScroll,
    updateScrollState,
  };
}
