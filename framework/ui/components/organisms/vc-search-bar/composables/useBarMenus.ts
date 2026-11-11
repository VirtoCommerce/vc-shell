import { computed, nextTick, onScopeDispose, ref, watch } from "vue";
import type { BarField } from "../lib/fields";

/** "filters": every field (the Filters button); "overflow": the fields hidden behind "+N" */
export type BarList = "filters" | "overflow";

export interface UseBarMenusOptions {
  fields: () => BarField[];
}

/** The bar's one menu host: a chip's editor, the Filters panel or the "+N" accordion */
export function useBarMenus(o: UseBarMenusOptions) {
  const openId = ref<string>();
  const anchor = ref<HTMLElement | null>(null);
  const list = ref<BarList>();

  const openField = computed(() => o.fields().find((f) => f.id === openId.value && f.kind !== "toggle"));
  const hostOpen = computed(() => !!list.value || !!openField.value);

  function closeEditor(restoreFocus = false) {
    const el = anchor.value;
    openId.value = undefined;
    list.value = undefined;
    if (!restoreFocus) return;
    nextTick(() => {
      if (!el?.isConnected) return;
      (el.matches("button") ? el : el.querySelector("button"))?.focus();
    });
  }

  function openEditor(id: string, el: HTMLElement) {
    if (openId.value === id && anchor.value === el) return closeEditor();
    list.value = undefined;
    anchor.value = el;
    openId.value = id;
  }

  function openList(kind: BarList, el: HTMLElement) {
    if (anchor.value === el && hostOpen.value) return closeEditor();
    openId.value = undefined;
    anchor.value = el;
    list.value = kind;
  }

  // The popover's own outside-click is off: a teleported date menu or select list counts as outside it
  function onOutsidePointerDown(e: PointerEvent) {
    const target = e.target as Element | null;
    if (
      target?.closest?.(
        ".vc-popover, .vc-sidebar, .vc-search-bar__chip, .vc-search-bar__more, .vc-search-bar__filters-btn, [class*='dp__'], .vc-select__dropdown",
      )
    )
      return;
    closeEditor();
  }
  watch(hostOpen, (open) => {
    if (open) document.addEventListener("pointerdown", onOutsidePointerDown);
    else document.removeEventListener("pointerdown", onOutsidePointerDown);
  });
  onScopeDispose(() => document.removeEventListener("pointerdown", onOutsidePointerDown));

  return { openId, anchor, list, openField, hostOpen, openEditor, openList, closeEditor };
}
