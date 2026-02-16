import { ref, watch, onBeforeUnmount, type Ref } from "vue";

export interface UseScrollArrowsOptions {
  /** Pixels per animation frame (~60fps). Default: 2 */
  speed?: number;
}

export function useScrollArrows(
  viewportRef: Ref<HTMLElement | null>,
  options: UseScrollArrowsOptions = {},
) {
  const { speed = 2 } = options;

  const canScrollUp = ref(false);
  const canScrollDown = ref(false);
  let scrollAnimationId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function updateScrollState() {
    const el = viewportRef.value;
    if (!el) {
      canScrollUp.value = false;
      canScrollDown.value = false;
      return;
    }
    canScrollUp.value = el.scrollTop > 0;
    canScrollDown.value = Math.ceil(el.scrollTop) < el.scrollHeight - el.clientHeight;
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

  // Observe size changes so arrows update when the viewport is resized
  watch(
    viewportRef,
    (el, _oldEl, onCleanup) => {
      resizeObserver?.disconnect();
      resizeObserver = null;

      if (!el) {
        canScrollUp.value = false;
        canScrollDown.value = false;
        return;
      }

      resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);

      onCleanup(() => {
        resizeObserver?.disconnect();
        resizeObserver = null;
      });
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopScroll();
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  return {
    canScrollUp,
    canScrollDown,
    startScroll,
    stopScroll,
    updateScrollState,
  };
}
