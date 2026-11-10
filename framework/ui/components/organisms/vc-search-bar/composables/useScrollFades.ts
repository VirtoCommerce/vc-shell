import { onScopeDispose, ref, watch, type Ref } from "vue";

/** Edge fades of a horizontal scroller: a side fades while there is more to scroll that way. */
export function useScrollFades(el: Ref<HTMLElement | undefined>) {
  const fadeL = ref(false);
  const fadeR = ref(false);

  function update() {
    const e = el.value;
    if (!e) return;
    fadeL.value = e.scrollLeft > 2;
    fadeR.value = e.scrollLeft + e.clientWidth < e.scrollWidth - 2;
  }

  let observer: ResizeObserver | undefined;
  watch(
    el,
    (e) => {
      observer?.disconnect();
      observer = undefined;
      if (!e || typeof ResizeObserver === "undefined") return;
      // the scroller resizes with the bar, its content with the pills
      observer = new ResizeObserver(update);
      observer.observe(e);
      for (const child of e.children) observer.observe(child);
      update();
    },
    { immediate: true, flush: "post" },
  );
  onScopeDispose(() => observer?.disconnect());

  return { fadeL, fadeR, update };
}
