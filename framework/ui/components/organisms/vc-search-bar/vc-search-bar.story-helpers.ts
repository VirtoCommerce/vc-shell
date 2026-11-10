import { onBeforeUnmount, onMounted, ref } from "vue";
import type { Decorator } from "@storybook/vue3-vite";

// Story-only helpers, never imported by the component

/** Room under the bar, so its popovers and sheets fit in the canvas */
export const minHeight =
  (px: number): Decorator =>
  (story) => ({
    components: { story },
    template: `<div style="min-height: ${px}px"><story /></div>`,
  });

const SCROLLER = ".vc-search-bar__filters--scroll";
// below this a press is still a click
const DRAG_PX = 4;

/**
 * Storybook cannot turn on touch emulation, so on the phone stories a mouse drag on the filters row
 * scrolls it sideways, as a swipe would.
 */
export const mouseSwipe: Decorator = (story) => ({
  components: { story },
  setup() {
    const root = ref<HTMLElement>();
    let drag: { el: HTMLElement; x: number; left: number; moved: boolean } | undefined;
    let swallowClick = false;

    function down(e: PointerEvent) {
      const el =
        e.pointerType === "mouse" && e.button === 0 ? (e.target as Element).closest<HTMLElement>(SCROLLER) : null;
      drag = el ? { el, x: e.clientX, left: el.scrollLeft, moved: false } : undefined;
    }
    function move(e: PointerEvent) {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < DRAG_PX) return;
      drag.moved = true;
      drag.el.style.userSelect = "none";
      drag.el.scrollLeft = drag.left - dx;
    }
    function up() {
      if (drag?.moved) {
        drag.el.style.userSelect = "";
        swallowClick = true;
        // released outside a pill there is no click to swallow, and the next real one must go through
        setTimeout(() => (swallowClick = false));
      }
      drag = undefined;
    }
    // the drag must not also click the pill it started on
    function click(e: MouseEvent) {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    }
    onMounted(() => {
      root.value?.addEventListener("pointerdown", down);
      root.value?.addEventListener("click", click, true);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    });
    return { root };
  },
  template: '<div ref="root"><story /></div>',
});
