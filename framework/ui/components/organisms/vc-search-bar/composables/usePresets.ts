import { computed, onScopeDispose, ref, watch, type Ref } from "vue";
import type { SearchBarPreset, SearchBarState } from "../types";
import type { BarField } from "../lib/fields";
import { cloneValue, isEmptyValue } from "../lib/values";
import {
  applyPreset,
  applyPresetSearch,
  isPresetLit,
  litPresetIds,
  removePreset,
  removePresetSearch,
  sameValues,
  suggestPresetName,
} from "../lib/presets";
import { createLocalPresetStore, mergeModulePresets, type PresetStore, type StoredPreset } from "../lib/storage";

export interface PresetAction {
  id: "rename" | "update" | "pin" | "restore" | "remove";
  label: string;
  icon: string;
  run: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}

export interface UsePresetsOptions {
  storageKey: () => string | undefined;
  modulePresets: () => SearchBarPreset[];
  fields: () => BarField[];
  state: Ref<SearchBarState>;
  apply: (s: SearchBarState) => void;
  /** Brings typed text still in the search pause into the state before a click reads it */
  flushSearch?: () => void;
  t: (key: string, named?: Record<string, unknown>) => string;
}

const PREFIX = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.";
const FLASH_MS = 1800;

/** Session-only store for when there is no storageKey */
function createMemoryStore(): PresetStore {
  const list: StoredPreset[] = [];
  return {
    async list() {
      return [...list];
    },
    async save(p) {
      const next = { ...p, updatedAt: new Date().toISOString() };
      const i = list.findIndex((x) => x.id === p.id);
      if (i >= 0) list[i] = next;
      else list.push(next);
    },
    async remove(id) {
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list.splice(i, 1);
    },
  };
}

export function usePresets(opts: UsePresetsOptions) {
  const { state, t } = opts;
  const stored = ref<StoredPreset[]>([]);
  let store: PresetStore = createMemoryStore();
  let ready: Promise<void> = Promise.resolve();
  let version = 0;
  let disposed = false;

  watch(
    opts.storageKey,
    (key) => {
      store = key ? createLocalPresetStore(key) : createMemoryStore();
      const current = store;
      const seen = version;
      ready = current.list().then((l) => {
        // a write that happened meanwhile is newer than this read
        if (store === current && version === seen) stored.value = l;
      });
    },
    { immediate: true },
  );

  const canStore = computed(() => !!opts.storageKey());

  const moduleList = computed(() => {
    const seen = new Set<string>();
    return opts.modulePresets().filter((p) => !seen.has(p.id) && !!seen.add(p.id));
  });
  const merged = computed(() => mergeModulePresets(moduleList.value, stored.value));
  const all = computed(() => merged.value.filter((p) => !p.hidden));
  const hiddenCount = computed(() => merged.value.filter((p) => p.hidden).length);
  const pinned = computed(() => all.value.filter((p) => p.pinned !== false));

  const find = (id: string) => merged.value.find((p) => p.id === id);
  const valuesOf = () => cloneValue(state.value.values);
  const hasValues = computed(() => Object.values(state.value.values).some((v) => !isEmptyValue(v)));
  const matches = (p: SearchBarPreset) =>
    sameValues(opts.fields(), p.values, state.value.values) && (p.search ?? "") === state.value.search;

  // Display only: a chip contained in another lit chip shows unlit. Hidden presets have no chip, so they dim nothing.
  const litIds = computed(() => litPresetIds(opts.fields(), state.value.values, state.value.search, all.value));
  const lit = (id: string) => litIds.value.has(id);

  function click(p: SearchBarPreset) {
    const before = state.value;
    opts.flushSearch?.();
    // The state is a query or field values, never both: a chip click leaves the query
    const { search } = state.value;
    const values = state.value.query ? {} : state.value.values;
    const fields = opts.fields();
    // Toggle on presence, not on the display: a dimmed chip whose values are present removes them
    const next = isPresetLit(fields, values, p, search)
      ? { values: removePreset(fields, values, p), search: removePresetSearch(p, search) }
      : { values: applyPreset(fields, values, p), search: applyPresetSearch(p, search) };
    // Nothing changed (search text from the pause counts as a change): no new state, no new fetch
    if (!before.query && next.search === before.search && sameValues(fields, next.values, before.values)) return;
    opts.apply(next);
  }

  const canSave = computed(() => canStore.value && hasValues.value && !state.value.query && !all.value.some(matches));

  // Highlight
  const flashId = ref<string>();
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  function flash(id: string) {
    if (disposed) return;
    flashId.value = id;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flashId.value = undefined), FLASH_MS);
  }
  onScopeDispose(() => {
    disposed = true;
    if (flashTimer) clearTimeout(flashTimer);
  });

  async function put(p: StoredPreset) {
    version++;
    await store.save(p);
    const next = await store.list();
    stored.value = next;
  }

  // Saving
  const saving = ref(false);
  const draft = ref("");
  function startSave(): string {
    saving.value = true;
    draft.value = suggestPresetName(opts.fields(), state.value.values, t);
    return draft.value;
  }
  function cancelSave() {
    saving.value = false;
  }
  watch(canSave, (v) => {
    if (!v) saving.value = false;
  });
  let committing = false;
  async function commitSave(name: string) {
    const trimmed = name.trim();
    if (committing || !trimmed || !canSave.value) return;
    committing = true;
    try {
      await save(trimmed);
    } finally {
      committing = false;
    }
  }
  async function save(trimmed: string) {
    const id = `user-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const search = state.value.search || undefined;
    await put({ id, name: trimmed, scope: "user", values: valuesOf(), search, pinned: true, updatedAt: "" });
    saving.value = false;
    flash(id);
  }

  // Management
  const edit = (p: StoredPreset, changes: Partial<StoredPreset>): StoredPreset => ({
    ...p,
    ...changes,
    ...(p.scope === "module" ? { edited: true } : {}),
  });

  async function rename(id: string, name: string) {
    const p = find(id);
    const trimmed = name.trim();
    if (p && trimmed && canStore.value) await put(edit(p, { name: trimmed }));
  }
  async function update(id: string) {
    const p = find(id);
    if (!p || !canStore.value || !hasValues.value) return;
    await put(edit(p, { values: valuesOf(), search: state.value.search || undefined }));
    flash(id);
  }
  async function togglePin(id: string) {
    const p = find(id);
    if (p && canStore.value) await put({ ...p, pinned: p.pinned === false });
  }
  async function restoreDefault(id: string) {
    const p = find(id);
    const m = moduleList.value.find((x) => x.id === id);
    if (!p || !m) return;
    await put({ ...m, scope: "module", pinned: p.pinned, hidden: false, edited: false, updatedAt: "" });
  }
  async function remove(id: string) {
    const p = find(id);
    if (!p || p.scope !== "user" || !canStore.value) return;
    version++;
    await store.remove(id);
    stored.value = await store.list();
  }
  async function hide(id: string) {
    const p = find(id);
    if (p && p.scope === "module") await put({ ...p, hidden: true });
  }
  async function showHidden() {
    for (const p of merged.value.filter((x) => x.hidden)) await put({ ...p, hidden: false });
  }

  function actionsFor(p: StoredPreset): PresetAction[] {
    const isModule = p.scope === "module";
    const removeAction: PresetAction = {
      id: "remove",
      label: t(PREFIX + (isModule ? "HIDE" : "DELETE")),
      icon: isModule ? "lucide-eye-off" : "lucide-trash-2",
      danger: true,
      run: () => void (isModule ? hide(p.id) : remove(p.id)),
    };
    if (!canStore.value) return isModule ? [removeAction] : [];

    const unavailable = !hasValues.value ? "UPDATE_NONE" : matches(p) ? "UPDATE_SAME" : undefined;
    const list: PresetAction[] = [
      { id: "rename", label: t(PREFIX + "RENAME"), icon: "lucide-pencil", run: () => undefined },
      {
        id: "update",
        label: t(PREFIX + "UPDATE"),
        icon: "lucide-refresh-cw",
        disabled: !!unavailable,
        title: unavailable ? t(PREFIX + unavailable) : undefined,
        run: () => void update(p.id),
      },
      {
        id: "pin",
        label: t(PREFIX + (p.pinned === false ? "PIN" : "UNPIN")),
        icon: p.pinned === false ? "lucide-pin" : "lucide-pin-off",
        run: () => void togglePin(p.id),
      },
    ];
    if (isModule && p.edited) {
      list.push({
        id: "restore",
        label: t(PREFIX + "RESTORE"),
        icon: "lucide-undo-2",
        run: () => void restoreDefault(p.id),
      });
    }
    list.push(removeAction);
    return list;
  }

  return {
    get ready() {
      return ready;
    },
    all,
    pinned,
    hiddenCount,
    lit,
    click,
    canSave,
    saving,
    draft,
    flashId,
    startSave,
    cancelSave,
    commitSave,
    rename,
    update,
    togglePin,
    restoreDefault,
    remove,
    hide,
    showHidden,
    actionsFor,
    canStore,
  };
}

export type PresetsApi = ReturnType<typeof usePresets>;
