import { nextTick, ref, watch, type Ref } from "vue";

export interface UseChipOverflowOptions {
  /** Hidden layer with every chip (`[data-chip]`) and a copy of the Filters button (`[data-fixed]`) */
  measure: Ref<HTMLElement | undefined>;
  /** Width of the row */
  width: Ref<number>;
  enabled: () => boolean;
  /** Changes whenever the chips' text may change, so they are measured again */
  keys: () => string;
}

const GAP = 6;
const DIVIDER = 5; // 1px line + 2px margins
const PLUS = 40 + GAP;
const SEARCH_MIN = 200;
const SEARCH_SHARE = 0.22;

const widthOf = (el: Element) => el.getBoundingClientRect().width;

/** How many chips fit next to the search; the rest go to "+N" */
export function useChipOverflow(o: UseChipOverflowOptions): { visibleCount: Ref<number> } {
  const visibleCount = ref(Infinity);

  function compute(): void {
    const layer = o.measure.value;
    if (!o.enabled() || !layer || !Number.isFinite(o.width.value)) {
      visibleCount.value = Infinity;
      return;
    }
    const chips = [...layer.querySelectorAll("[data-chip]")].map(widthOf);
    const fixed = [...layer.querySelectorAll("[data-fixed]")].reduce((sum, el) => sum + widthOf(el) + GAP, 0);
    const w = o.width.value;
    // search, divider and the gaps around it, then the Filters button with its gap
    const available = w - Math.max(SEARCH_MIN, w * SEARCH_SHARE) - GAP - DIVIDER - GAP - fixed;
    const fit = (room: number) => {
      let used = 0;
      let n = 0;
      for (const c of chips) {
        used += c + (n ? GAP : 0);
        if (used > room) break;
        n++;
      }
      return n;
    };
    const all = fit(available);
    visibleCount.value = all === chips.length ? all : fit(available - PLUS);
  }

  // the layer re-renders on a key change, so measure after it
  watch([o.width, o.measure, () => o.keys(), () => o.enabled()], () => void nextTick(compute), { immediate: true });

  return { visibleCount };
}
