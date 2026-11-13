import { computed, ref, shallowRef, watch, type ComputedRef, type Ref } from "vue";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import type { SearchBarState, SearchBarValue, SearchBarView } from "../types";
import type { BarField } from "../lib/fields";
import { acceptValue, cloneValue, isEmptyValue } from "../lib/values";
import { SYSTEM_VIEW_ID, isViewModified, type BarView } from "../lib/views";
import { readViews, writeViews, type StoredView } from "../lib/storage";

export interface UseViewsOptions {
  /** Namespace of the stored views and of the `<key>_view` URL entry; without it views live in memory */
  storageKey: () => string | undefined;
  moduleViews: () => SearchBarView[];
  fields: () => BarField[];
  state: Ref<SearchBarState>;
  /** Replaces the values, keeps the search */
  apply: (values: Record<string, SearchBarValue>) => void;
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

const newId = () => `view-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function useViews(o: UseViewsOptions): ViewsApi {
  const key = () => o.storageKey() || undefined;
  // User views and module view overrides; without a key they live in memory
  const stored = shallowRef<StoredView[]>([]);
  let loaded: StoredView[] = [];
  watch(
    key,
    (k) => {
      loaded = k ? readViews(k) : [];
      stored.value = loaded;
    },
    { immediate: true },
  );
  watch(
    stored,
    (list) => {
      const k = key();
      if (k && list !== loaded) writeViews(k, list);
    },
    { flush: "sync" },
  );
  const store = (v: StoredView) =>
    (stored.value = stored.value.some((x) => x.id === v.id)
      ? stored.value.map((x) => (x.id === v.id ? v : x))
      : [...stored.value, v]);

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

  const applyValues = (values: Record<string, SearchBarValue>) => o.apply(cloneValue(values));

  // Values read from storage (user views, module overrides): only known fields, through the field's check
  function viewValues(view: BarView): Record<string, SearchBarValue> {
    if (!stored.value.some((v) => v.id === view.id)) return view.values;
    const byId = new Map(o.fields().map((f) => [f.id, f]));
    const out: Record<string, SearchBarValue> = {};
    for (const [id, raw] of Object.entries(view.values)) {
      const field = byId.get(id);
      const value = field && acceptValue(field, raw);
      if (value !== undefined) out[id] = value;
    }
    return out;
  }

  // Empty values are not stored: they equal absent ones
  const currentValues = () =>
    Object.fromEntries(Object.entries(cloneValue(o.state.value.values)).filter(([, v]) => !isEmptyValue(v)));

  function select(id: string): void {
    const view = find(id);
    if (!view) return;
    currentId.value = id;
    applyValues(viewValues(view));
  }

  function userView(id: string): StoredView | undefined {
    return stored.value.find((v) => v.id === id && v.scope === "user" && find(id)?.scope === "user");
  }

  const isEmptyState = () => Object.values(o.state.value.values).every(isEmptyValue);
  const hasValues = (v: BarView) => !Object.values(v.values).every(isEmptyValue);

  // Initial view: the URL's (an id not registered yet shows as system until it arrives, filters
  // from the URL stay); else the module default, applied only when the bar starts with no values; else system
  const k = urlKey();
  const url = k ? o.queryState!.read(k) : {};
  let written = url.view;
  const fallback = moduleViews.value.find((v) => v.default);
  if (url.view) {
    currentId.value = url.view;
    // A link that names only the view (a dashboard's `orders_view=overdue`) opens it with its values;
    // a view not registered yet applies when it arrives, unless something was set meanwhile
    if (!url.filters && isEmptyState()) {
      const linked = url.view;
      const applyLinked = (view: BarView | undefined) => {
        if (view && hasValues(view) && currentId.value === linked && isEmptyState()) applyValues(viewValues(view));
      };
      const view = find(linked);
      if (view) applyLinked(view);
      else {
        const stop = watch(
          () => find(linked),
          (v) => {
            if (!v) return;
            stop();
            applyLinked(v);
          },
        );
      }
    }
  } else if (fallback && !url.filters && isEmptyState()) {
    // values the bar starts with (v-model or URL) win; the system view then reads modified
    currentId.value = fallback.id;
    applyValues(viewValues(fallback));
  }

  // A view whose last value was removed ends on the system view, as Clear all does: the URL then never
  // holds a view with no filters, which a reload would read as "open the view with its values"
  watch(isEmptyState, (empty) => {
    if (empty && current.value.scope !== "system" && hasValues(current.value)) currentId.value = SYSTEM_VIEW_ID;
  });

  watch(
    () => [currentId.value, !!find(currentId.value)] as const,
    ([id, found]) => {
      const target = urlKey();
      // An unresolved id stays in the URL: its registration may still arrive
      if (!target || !found || id === written) return;
      written = id;
      o.queryState!.write(target, { view: id });
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
      store({ id: view.id, name: view.name, values: currentValues(), scope: view.scope });
    },
    saveAs(name) {
      const id = newId();
      store({ id, name: name.trim(), values: currentValues(), scope: "user" });
      currentId.value = id;
    },
    revert: () => applyValues(viewValues(current.value)),
    rename(id, name) {
      const view = userView(id);
      if (!view) return;
      store({ ...view, name: name.trim() });
    },
    remove(id) {
      if (!userView(id)) return;
      stored.value = stored.value.filter((v) => v.id !== id);
      if (currentId.value === id) select(SYSTEM_VIEW_ID);
    },
    clearToSystem: () => select(SYSTEM_VIEW_ID),
  };
}
