import { computed, ref, shallowRef, watch, type ComputedRef, type Ref } from "vue";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import type { SearchBarState, SearchBarValue, SearchBarView } from "../types";
import type { BarField } from "../lib/fields";
import { cloneValue, isEmptyValue } from "../lib/values";
import { SYSTEM_VIEW_ID, isViewModified, type BarView } from "../lib/views";
import { createLocalViewStore, type StoredView, type ViewStore } from "../lib/storage";

export interface UseViewsOptions {
  /** Namespace of the stored views and of the `<key>_view` URL entry; without it views live in memory */
  storageKey: () => string | undefined;
  moduleViews: () => SearchBarView[];
  fields: () => BarField[];
  state: Ref<SearchBarState>;
  /** Replaces the values, keeps the search */
  apply: (s: SearchBarState) => void;
  /** The blade's URL query service, as useSearchBarState receives it */
  queryState?: ITableQueryStateService;
  t: (k: string) => string;
}

export interface ViewsApi {
  /** System first, then module, then user */
  all: ComputedRef<BarView[]>;
  current: ComputedRef<BarView>;
  modified: ComputedRef<boolean>;
  select(id: string): void;
  /** User view: update. Module view: store an override with its id. System view: no-op */
  saveChanges(): void;
  /** New user view, becomes current */
  saveAs(name: string): void;
  revert(): void;
  /** User views only */
  rename(id: string, name: string): void;
  /** User views only; removing the current one selects the system view */
  remove(id: string): void;
  clearToSystem(): void;
}

const ALL_KEY = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL";

function createMemoryViewStore(): ViewStore {
  let views: StoredView[] = [];
  return {
    list: () => [...views],
    save: (v) => (views = views.some((x) => x.id === v.id) ? views.map((x) => (x.id === v.id ? v : x)) : [...views, v]),
    remove: (id) => (views = views.filter((x) => x.id !== id)),
  };
}

const newId = () => `view-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function useViews(o: UseViewsOptions): ViewsApi {
  const key = () => o.storageKey() || undefined;
  const memory = createMemoryViewStore();
  const store = computed(() => {
    const k = key();
    return k ? createLocalViewStore(k) : memory;
  });
  const stored = shallowRef<StoredView[]>(store.value.list());
  const refresh = () => (stored.value = store.value.list());
  watch(store, refresh);

  const system = computed<BarView>(() => ({ id: SYSTEM_VIEW_ID, name: o.t(ALL_KEY), values: {}, scope: "system" }));

  const moduleViews = computed<BarView[]>(() => {
    const overrides = new Map(stored.value.filter((v) => v.scope === "module").map((v) => [v.id, v.values]));
    const seen = new Set([SYSTEM_VIEW_ID]);
    return o
      .moduleViews()
      .filter((v) => !seen.has(v.id) && !!seen.add(v.id))
      .map((v) => ({ ...v, values: overrides.get(v.id) ?? v.values, scope: "module" }));
  });

  const all = computed<BarView[]>(() => {
    const taken = new Set([SYSTEM_VIEW_ID, ...moduleViews.value.map((v) => v.id)]);
    const users = stored.value.filter((v) => v.scope === "user" && !taken.has(v.id));
    return [system.value, ...moduleViews.value, ...users];
  });

  const find = (id: string) => all.value.find((v) => v.id === id);
  const urlKey = () => (o.queryState ? key() : undefined);

  const currentId = ref(SYSTEM_VIEW_ID);
  const current = computed(() => find(currentId.value) ?? system.value);
  const modified = computed(() => isViewModified(o.fields(), o.state.value.values, current.value));

  const applyValues = (values: Record<string, SearchBarValue>) =>
    o.apply({ search: o.state.value.search, values: cloneValue(values) });

  // Empty values are not stored: they equal absent ones
  const currentValues = () =>
    Object.fromEntries(Object.entries(cloneValue(o.state.value.values)).filter(([, v]) => !isEmptyValue(v)));

  function select(id: string): void {
    const view = find(id);
    if (!view) return;
    currentId.value = id;
    applyValues(view.values);
  }

  function userView(id: string): StoredView | undefined {
    return stored.value.find((v) => v.id === id && v.scope === "user" && find(id)?.scope === "user");
  }

  // Initial view: the URL's (an id not registered yet shows as system until it arrives, filters
  // from the URL stay); else the module default, applied only when the bar starts with no values; else system
  const k = urlKey();
  const url = k ? o.queryState!.read(k) : {};
  let written = url.view;
  const fallback = moduleViews.value.find((v) => v.default);
  if (url.view) {
    currentId.value = url.view;
  } else if (fallback && !url.filters && Object.values(o.state.value.values).every(isEmptyValue)) {
    // values the bar starts with (v-model or URL) win; the system view then reads modified
    currentId.value = fallback.id;
    applyValues(fallback.values);
  }

  // A missing key opens the default view, so with one the system view is written explicitly
  const hasDefault = computed(() => moduleViews.value.some((v) => v.default));

  watch(
    () => [currentId.value, !!find(currentId.value), hasDefault.value] as const,
    ([id, found, withDefault]) => {
      const target = urlKey();
      // An unresolved id stays in the URL: its registration may still arrive
      if (!target || !found) return;
      const view = id === SYSTEM_VIEW_ID && !withDefault ? undefined : id;
      if (view === written) return;
      written = view;
      o.queryState!.write(target, { view });
    },
    { immediate: true },
  );

  return {
    all,
    current,
    modified,
    select,
    saveChanges() {
      const view = current.value;
      if (view.scope === "system") return;
      store.value.save({ id: view.id, name: view.name, values: currentValues(), scope: view.scope });
      refresh();
    },
    saveAs(name) {
      const id = newId();
      store.value.save({ id, name: name.trim(), values: currentValues(), scope: "user" });
      refresh();
      currentId.value = id;
    },
    revert: () => applyValues(current.value.values),
    rename(id, name) {
      const view = userView(id);
      if (!view) return;
      store.value.save({ ...view, name: name.trim() });
      refresh();
    },
    remove(id) {
      if (!userView(id)) return;
      store.value.remove(id);
      refresh();
      if (currentId.value === id) select(SYSTEM_VIEW_ID);
    },
    clearToSystem: () => select(SYSTEM_VIEW_ID),
  };
}
