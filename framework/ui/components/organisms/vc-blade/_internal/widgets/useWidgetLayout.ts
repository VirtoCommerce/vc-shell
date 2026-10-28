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
  const rendered = new Set(renderedIds);
  const pick = (ids: string[] | undefined) => [...new Set(ids ?? [])].filter((id) => rendered.has(id));

  const savedStrip = pick(saved?.strip);
  const savedOverflow = pick(saved?.overflow).filter((id) => !savedStrip.includes(id));
  const known = new Set([...(saved?.strip ?? []), ...(saved?.overflow ?? [])]);
  const unknown = renderedIds.filter((id) => !known.has(id));

  const strip = savedStrip.slice(0, max);
  const overflow = savedStrip.slice(max);

  // Saved-overflow ids move up only into slots of saved-strip ids that are not rendered now.
  const freedSlots = Math.min(max, new Set(saved?.strip ?? []).size) - strip.length;
  const fromOverflow = savedOverflow.slice(0, Math.max(0, freedSlots));
  strip.push(...fromOverflow);

  const fromUnknown = unknown.slice(0, Math.max(0, max - strip.length));
  strip.push(...fromUnknown);

  overflow.push(...savedOverflow.slice(fromOverflow.length), ...unknown.slice(fromUnknown.length));
  return { strip, overflow };
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
  const canAddToStrip = computed(() => draft.value.strip.length < WIDGET_STRIP_MAX);

  function startEdit() {
    draft.value = { strip: [...layout.value.strip], overflow: [...layout.value.overflow] };
    editing.value = true;
  }

  function move(id: string, to: "strip" | "overflow", index?: number) {
    if (!editing.value) return;
    const from = to === "strip" ? "overflow" : "strip";
    if (!draft.value[from].includes(id)) return;
    if (to === "strip" && !canAddToStrip.value) return;
    draft.value[from] = draft.value[from].filter((x) => x !== id);
    const target = draft.value[to];
    target.splice(index ?? target.length, 0, id);
  }

  const moveToStrip = (id: string, index?: number) => move(id, "strip", index);
  const moveToOverflow = (id: string, index?: number) => move(id, "overflow", index);

  function reorder(list: "strip" | "overflow", from: number, to: number) {
    if (!editing.value) return;
    const target = draft.value[list];
    if (from < 0 || from >= target.length || to < 0 || to >= target.length) return;
    const [id] = target.splice(from, 1);
    target.splice(to, 0, id);
  }

  function commit() {
    if (!editing.value) return;
    const present = new Set(renderedIds.value);
    const keepStrip = (saved.value?.strip ?? []).filter((id) => !present.has(id));
    const keepOverflow = (saved.value?.overflow ?? []).filter((id) => !present.has(id));
    saved.value = {
      strip: [...draft.value.strip, ...keepStrip],
      overflow: [...draft.value.overflow, ...keepOverflow],
    };
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
    reset,
  };
}
