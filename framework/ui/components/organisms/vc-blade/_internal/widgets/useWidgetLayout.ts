import { computed, readonly, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { IWidget } from "@core/services/widget-service";

export const WIDGET_STRIP_MAX = 5;

export interface IWidgetLayoutState {
  strip: string[];
  overflow: string[];
}

export function widgetLayoutStorageKey(bladeName: string): string {
  return `VC_BLADE_WIDGETS_${bladeName.toUpperCase()}`;
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

const layoutSerializer = {
  read(raw: string): IWidgetLayoutState | null {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && isStringArray(parsed.strip) && isStringArray(parsed.overflow)) {
        return { strip: parsed.strip, overflow: parsed.overflow };
      }
    } catch {
      // invalid JSON
    }
    return null;
  },
  write(value: IWidgetLayoutState | null): string {
    return value ? JSON.stringify({ strip: value.strip, overflow: value.overflow }) : "";
  },
};

export function computeWidgetLayout(
  renderedIds: string[],
  saved: IWidgetLayoutState | null,
  max: number = WIDGET_STRIP_MAX,
): IWidgetLayoutState {
  if (!saved) return { strip: renderedIds.slice(0, max), overflow: renderedIds.slice(max) };

  const rendered = new Set(renderedIds);
  const pick = (ids: string[]) => [...new Set(ids)].filter((id) => rendered.has(id));

  const savedStrip = pick(saved.strip);
  const savedOverflow = pick(saved.overflow).filter((id) => !savedStrip.includes(id));
  const known = new Set([...saved.strip, ...saved.overflow]);
  const unknown = renderedIds.filter((id) => !known.has(id));

  // A strip the user customized is theirs: a strip widget that is hidden or not loaded yet leaves
  // its slot empty, and widgets registered later wait in the overflow
  return {
    strip: savedStrip.slice(0, max),
    overflow: [...savedStrip.slice(max), ...savedOverflow, ...unknown],
  };
}

export function useWidgetLayout(bladeName: MaybeRefOrGetter<string>, widgets: MaybeRefOrGetter<IWidget[]>) {
  // The key is read once: a blade keeps its name for its lifetime.
  const saved = useLocalStorage<IWidgetLayoutState | null>(widgetLayoutStorageKey(toValue(bladeName)), null, {
    serializer: layoutSerializer,
    writeDefaults: false,
    onError: () => {},
  });

  const renderedIds = computed(() => toValue(widgets).map((w) => w.id));
  const layout = computed(() => computeWidgetLayout(renderedIds.value, saved.value));

  const editing = ref(false);
  const draft = ref<IWidgetLayoutState>({ strip: [], overflow: [] });

  const current = computed(() => (editing.value ? draft.value : layout.value));
  const resolve = (ids: string[]): IWidget[] => {
    const byId = new Map(toValue(widgets).map((w) => [w.id, w]));
    return ids.flatMap((id) => byId.get(id) ?? []);
  };

  const strip = computed(() => resolve(current.value.strip));
  const overflow = computed(() => resolve(current.value.overflow));
  // Edits take positions in the lists as shown; the draft can also hold ids that stopped rendering
  // during the edit, so positions are mapped onto it by id
  const shownIds = (list: keyof IWidgetLayoutState) => (list === "strip" ? strip : overflow).value.map((w) => w.id);
  const canAddToStrip = computed(() => shownIds("strip").length < WIDGET_STRIP_MAX);

  function draftIndex(list: keyof IWidgetLayoutState, shownIndex: number) {
    const anchor = shownIds(list)[shownIndex];
    return anchor === undefined ? draft.value[list].length : draft.value[list].indexOf(anchor);
  }

  function startEdit() {
    draft.value = { strip: [...layout.value.strip], overflow: [...layout.value.overflow] };
    editing.value = true;
  }

  function move(id: string, to: "strip" | "overflow", index?: number) {
    if (!editing.value) return;
    const from = to === "strip" ? "overflow" : "strip";
    if (!draft.value[from].includes(id)) return;
    if (to === "strip" && !canAddToStrip.value) return;
    const at = draftIndex(to, index ?? Infinity);
    draft.value[from] = draft.value[from].filter((x) => x !== id);
    draft.value[to].splice(at, 0, id);
  }

  const moveToStrip = (id: string, index?: number) => move(id, "strip", index);
  const moveToOverflow = (id: string, index?: number) => move(id, "overflow", index);

  function reorder(list: "strip" | "overflow", from: number, to: number) {
    if (!editing.value) return;
    const shown = shownIds(list);
    if (from < 0 || from >= shown.length || to < 0 || to >= shown.length || from === to) return;
    const target = draft.value[list];
    target.splice(target.indexOf(shown[from]), 1);
    // Moving down lands after the widget now at `to`, moving up lands before it
    target.splice(target.indexOf(shown[to]) + (to > from ? 1 : 0), 0, shown[from]);
  }

  // A widget not rendered now (hidden on this record, or gone during the edit) keeps its old place,
  // and moves to the overflow only when the edited strip is full
  function commit() {
    if (!editing.value) return;
    const present = new Set(renderedIds.value);
    const next: IWidgetLayoutState = {
      strip: draft.value.strip.filter((id) => present.has(id)),
      overflow: draft.value.overflow.filter((id) => present.has(id)),
    };
    const placed = new Set([...next.strip, ...next.overflow]);
    const sources = [draft.value, saved.value ?? { strip: [], overflow: [] }];
    // The draft first: a widget moved during the edit and then gone keeps the draft's choice
    for (const source of sources) {
      for (const list of ["strip", "overflow"] as const) {
        source[list].forEach((id, index) => {
          if (placed.has(id)) return;
          placed.add(id);
          const target = list === "strip" && next.strip.length < WIDGET_STRIP_MAX ? next.strip : next.overflow;
          target.splice(Math.min(index, target.length), 0, id);
        });
      }
    }
    saved.value = next;
    editing.value = false;
  }

  /** Leaves edit mode without saving the draft */
  function cancel() {
    editing.value = false;
  }

  function reset() {
    saved.value = null;
    editing.value = false;
  }

  return {
    strip,
    overflow,
    editing: readonly(editing) as Readonly<Ref<boolean>>,
    draft: readonly(draft) as Readonly<Ref<IWidgetLayoutState>>,
    canAddToStrip: canAddToStrip as ComputedRef<boolean>,
    startEdit,
    moveToStrip,
    moveToOverflow,
    reorder,
    commit,
    cancel,
    reset,
  };
}
