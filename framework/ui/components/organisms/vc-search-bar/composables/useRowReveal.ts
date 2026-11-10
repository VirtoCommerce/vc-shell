import { computed, nextTick, onScopeDispose, ref, watch, type Ref } from "vue";

export const OPEN_DELAY = 400;
export const CLOSE_DELAY = 150;

// room for the shadow so the end frame does not cut it
const SHADOW = 24;
const UNFOLD = { ms: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" };
const FOLD = { ms: 140, easing: "cubic-bezier(0.4, 0, 1, 1)" };

export interface UseRowRevealOptions {
  row: Ref<HTMLElement | undefined>;
  /** Desktop only. */
  enabled: () => boolean;
  /** A popover of the row is open, or the preset name field. */
  keepOpen: () => boolean;
  /** True for focus inside the search. */
  ignoreFocus: (target: Element) => boolean;
}

export function useRowReveal(o: UseRowRevealOptions) {
  const clipped = ref(false);
  const unfolded = ref(false);
  const hovered = ref(false);
  const focused = ref(false);

  const wanted = computed(() => o.enabled() && clipped.value && (hovered.value || focused.value || o.keepOpen()));

  function measure() {
    const el = o.row.value;
    if (!el || unfolded.value) return;
    clipped.value = el.scrollWidth > el.clientWidth + 1;
  }

  // removing the focused control (Clear all, a pill's x) fires no focusout, so the row would stay unfolded
  function onMutate() {
    if (focused.value && !o.row.value?.contains(document.activeElement)) focused.value = false;
    measure();
  }

  let observer: ResizeObserver | undefined;
  // the clipped row keeps its box, so new pills, longer text or a preset tray change only what is inside it
  let mutations: MutationObserver | undefined;
  watch(
    o.row,
    (el) => {
      observer?.disconnect();
      mutations?.disconnect();
      observer = mutations = undefined;
      if (!el) return;
      measure();
      if (typeof MutationObserver !== "undefined") {
        mutations = new MutationObserver(onMutate);
        mutations.observe(el, { childList: true, subtree: true, characterData: true });
      }
      if (typeof ResizeObserver === "undefined") return;
      observer = new ResizeObserver(measure);
      observer.observe(el);
    },
    { immediate: true },
  );

  let timer: ReturnType<typeof setTimeout> | undefined;
  let anim: Animation | undefined;
  onScopeDispose(() => {
    observer?.disconnect();
    mutations?.disconnect();
    document.removeEventListener("pointermove", onOutsideMove);
    clearTimeout(timer);
    anim?.cancel();
  });

  function onPointerEnter() {
    clearTimeout(timer);
    document.addEventListener("pointermove", onOutsideMove);
    if (hovered.value) return;
    measure();
    timer = setTimeout(() => (hovered.value = true), OPEN_DELAY);
  }

  function onPointerLeave() {
    document.removeEventListener("pointermove", onOutsideMove);
    clearTimeout(timer);
    timer = setTimeout(() => (hovered.value = false), CLOSE_DELAY);
  }

  // Chrome sends no pointerleave once the control under the pointer is removed (Clear all)
  function onOutsideMove(e: Event) {
    if (!(e.target instanceof Node && o.row.value?.contains(e.target))) onPointerLeave();
  }

  function onFocusIn(e: FocusEvent) {
    if (e.target instanceof Element && o.ignoreFocus(e.target)) return;
    measure();
    focused.value = true;
  }

  function onFocusOut(e: FocusEvent) {
    const next = e.relatedTarget;
    // focus in the search does not unfold the row, so moving there folds it
    if (next instanceof Element && o.ignoreFocus(next)) return void (focused.value = false);
    if (next instanceof Node && o.row.value?.contains(next)) return;
    focused.value = false;
  }

  const reduceMotion = () =>
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The floating row is revealed top-down with clip-path, so nothing below reflows.
  function clipTo(el: HTMLElement, from: number, to: number, { ms, easing }: typeof UNFOLD) {
    const inset = (h: number) => `inset(-${SHADOW}px -${SHADOW}px ${h}px -${SHADOW}px round 6px)`;
    anim?.cancel();
    anim = el.animate([{ clipPath: inset(from) }, { clipPath: inset(to) }], { duration: ms, easing });
    return anim.finished.catch(() => undefined);
  }

  let foldedHeight = 0;
  watch(
    wanted,
    async (open) => {
      const el = o.row.value;
      if (!el || typeof el.animate !== "function" || reduceMotion()) {
        unfolded.value = open;
        return;
      }
      if (open) {
        foldedHeight = el.offsetHeight;
        unfolded.value = true;
        await nextTick();
        const hidden = Math.max(0, el.offsetHeight - foldedHeight);
        await clipTo(el, hidden, -SHADOW, UNFOLD);
      } else {
        const hidden = Math.max(0, el.offsetHeight - foldedHeight);
        await clipTo(el, -SHADOW, hidden, FOLD);
        if (!wanted.value) {
          unfolded.value = false;
          measure();
        }
      }
    },
    { flush: "sync" },
  );

  return { clipped, unfolded, onPointerEnter, onPointerLeave, onFocusIn, onFocusOut };
}
