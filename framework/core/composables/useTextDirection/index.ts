import { computed, readonly, ref, type ComputedRef, type Ref } from "vue";

export type TextDirection = "ltr" | "rtl";

export interface UseTextDirectionReturn {
  /** The page's reading direction, from `<html dir>`. Follows changes of the attribute. */
  dir: Readonly<Ref<TextDirection>>;
  /** `true` for a right-to-left page (Arabic, Hebrew, Persian, Urdu). */
  isRtl: ComputedRef<boolean>;
}

const dir = ref<TextDirection>("ltr");
let observer: MutationObserver | undefined;

function read(): TextDirection {
  return document.documentElement.getAttribute("dir")?.toLowerCase() === "rtl" ? "rtl" : "ltr";
}

function watchDocument() {
  if (observer || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  dir.value = read();
  observer = new MutationObserver(() => {
    dir.value = read();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
}

/**
 * The page's reading direction for the few places that place things from script (floating panels, swipe gestures,
 * drawers). Styles don't need it: vc-shell's CSS uses logical properties and follows `<html dir>` by itself.
 *
 * The language switch sets the direction with `<html lang>`; an app that sets `dir` itself can still do so after it.
 */
export function useTextDirection(): UseTextDirectionReturn {
  watchDocument();
  return {
    dir: readonly(dir),
    isRtl: computed(() => dir.value === "rtl"),
  };
}

/** Whether an element lays out right to left: its computed direction, so a `dir` set on a container counts too. */
export function isRtlElement(el: Element | null | undefined): boolean {
  if (!el || typeof getComputedStyle === "undefined") return read() === "rtl";
  return getComputedStyle(el).direction === "rtl";
}
