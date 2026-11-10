import { computed, nextTick, onScopeDispose, ref, watch } from "vue";
import type { BarField } from "../lib/fields";

export interface UseBarMenusOptions {
  fields: () => BarField[];
  /** Pinned and set fields. */
  visibleFields: () => BarField[];
  /** A narrow bar shows set fields only. */
  narrow: () => boolean;
  isSet: (id: string) => boolean;
  /** Sets a toggle picked in "+ Filter". */
  setToggle: (id: string) => void;
  /** Where focus goes when the menu's anchor is gone: the field's pill or the row. */
  focusFallback: (id: string | undefined) => HTMLElement | null | undefined;
}

/**
 * The row's pills and its one menu host: a pill's editor or the "+ Filter" list,
 * which turns into the picked field's editor.
 */
export function useBarMenus(o: UseBarMenusOptions) {
  const openId = ref<string>();
  const anchor = ref<HTMLElement | null>(null);
  const addOpen = ref(false);
  // the editor came from "+ Filter", so its field may be missing from the row
  const fromAdd = ref(false);

  const openField = computed(() => o.fields().find((f) => f.id === openId.value && f.kind !== "toggle"));
  // The field being edited keeps its pill, so emptying it does not pull the editor's anchor away
  const rowFields = computed(() =>
    o.fields().filter((f) => f.id === openId.value || (o.narrow() ? o.isSet(f.id) : o.visibleFields().includes(f))),
  );
  const addable = computed(() => o.fields().filter((f) => !rowFields.value.includes(f)));
  // "+ Filter" anchors the editor it opened, so it stays while that field joins the row
  const canAdd = computed(() => addable.value.length > 0 || (fromAdd.value && !!openField.value));
  const hostOpen = computed(() => addOpen.value || !!openField.value);

  function openEditor(id: string, el: HTMLElement) {
    if (openId.value === id && !fromAdd.value) return closeEditor();
    addOpen.value = false;
    fromAdd.value = false;
    anchor.value = el;
    openId.value = id;
  }

  function closeEditor(restoreFocus = false, id = openId.value) {
    const el = anchor.value;
    openId.value = undefined;
    addOpen.value = false;
    fromAdd.value = false;
    if (!restoreFocus) return;
    // "+ Filter" unmounts once nothing is left to add
    nextTick(() => {
      const target = el?.isConnected ? el : o.focusFallback(id);
      (target?.matches("button") ? target : target?.querySelector("button"))?.focus();
    });
  }

  function toggleAdd(el: HTMLElement) {
    if (addOpen.value || fromAdd.value) return closeEditor();
    closeEditor();
    anchor.value = el;
    addOpen.value = true;
  }

  function pickAdd(f: BarField) {
    if (f.kind === "toggle") {
      o.setToggle(f.id);
      return closeEditor(true, f.id);
    }
    addOpen.value = false;
    fromAdd.value = true;
    openId.value = f.id;
  }

  // Turning narrow drops empty pinned pills, and with them the editor of one
  watch(o.narrow, (narrow) => {
    const id = openId.value;
    if (narrow && id && !fromAdd.value && !o.isSet(id)) closeEditor();
  });

  // The popover's own outside-click is off: a teleported date menu or select list counts as outside it
  function onOutsidePointerDown(e: PointerEvent) {
    const target = e.target as Element | null;
    if (target?.closest?.(".vc-popover, .vc-sidebar, .vc-search-bar__pill, [class*='dp__'], .vc-select__dropdown"))
      return;
    closeEditor();
  }
  watch(hostOpen, (open) => {
    if (open) document.addEventListener("pointerdown", onOutsidePointerDown);
    else document.removeEventListener("pointerdown", onOutsidePointerDown);
  });
  onScopeDispose(() => document.removeEventListener("pointerdown", onOutsidePointerDown));

  return {
    openId,
    anchor,
    addOpen,
    rowFields,
    openField,
    addable,
    canAdd,
    hostOpen,
    openEditor,
    closeEditor,
    toggleAdd,
    pickAdd,
  };
}
