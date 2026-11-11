import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { getExternalSearchFilters } from "@core/services/search-filters-service";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import type { SearchBarChange, SearchBarField, SearchBarState, SearchBarValue, SearchBarView } from "../types";
import { normalizeFields, type BarField } from "../lib/fields";
import { cloneValue, isEmptyValue, toFlatFilters } from "../lib/values";
import { stateToUrl, unknownSegments, urlToState } from "../lib/urlState";
import { stateToPhrase } from "../phrase/convert";

export interface UseSearchBarStateOptions {
  fields: () => SearchBarField[];
  target: () => string | undefined;
  /** Namespace of the filters in the URL query (`<key>_filters`) */
  storageKey: () => string | undefined;
  /** The blade's URL query service; without it (or a key) the applied filters are not remembered */
  queryState?: ITableQueryStateService;
  model: Ref<SearchBarState | undefined>;
  /** Controlled search text: wins over the model and the URL, changes apply without onChange */
  search?: () => string | undefined;
  /** Text typed but still in the search pause; a filter commit takes it so its change carries it */
  takePendingSearch?: () => string | undefined;
  onChange: (c: SearchBarChange) => void;
}

export interface UseSearchBarState {
  fields: ComputedRef<BarField[]>;
  externalViews: ComputedRef<SearchBarView[]>;
  state: Ref<SearchBarState>;
  /** Ids of the set fields in the order they were set */
  order: Ref<string[]>;
  setSearch(v: string): void;
  /** Writes the pending typed text into the state; the filter commit that follows emits it */
  flushSearch(): void;
  setValue(id: string, v: SearchBarValue): void;
  clearValue(id: string): void;
  clearAll(): void;
  applyState(s: SearchBarState): void;
  setQuery(q: string | undefined): void;
}

const emptyState = (): SearchBarState => ({ search: "", values: {} });

export function useSearchBarState(opts: UseSearchBarStateOptions): UseSearchBarState {
  const registrations = computed(() => {
    const target = opts.target();
    return target ? getExternalSearchFilters(target) : [];
  });

  // own fields first, then external by priority; normalizeFields keeps the first on an id clash
  const fields = computed(() => normalizeFields([...opts.fields(), ...registrations.value.flatMap((r) => r.fields)]));
  const externalViews = computed(() => registrations.value.flatMap((r) => r.views ?? []));

  const isNonEmpty = (s: SearchBarState) =>
    !!s.search || !!s.query || Object.values(s.values).some((v) => !isEmptyValue(v));

  // The applied filters live in the URL next to the table's sort/search/page; the search words are not part of them
  const urlKey = (): string | undefined => (opts.queryState ? opts.storageKey() || undefined : undefined);
  let written: string | undefined;
  // URL segments of fields not registered yet (async globalFilters, a late external registration):
  // they stay in the URL and apply when their fields arrive
  let unresolved: string[] = [];

  let restored = false;
  const base = (): SearchBarState => {
    if (opts.model.value !== undefined) return clone(opts.model.value);
    const key = urlKey();
    if (!key) return emptyState();
    written = opts.queryState!.read(key).filters ?? "";
    unresolved = unknownSegments(fields.value, written);
    const fromUrl = urlToState(fields.value, written);
    if (!fromUrl) return emptyState();
    restored = true;
    return fromUrl;
  };
  const initial = (): SearchBarState => {
    const s = base();
    const search = opts.search?.();
    return search === undefined ? s : { ...s, search };
  };

  const state = ref<SearchBarState>(initial());

  // A field joins the end when it gets a value and leaves when it is cleared
  const order = ref<string[]>([]);
  watch(
    () => state.value.values,
    (values) => {
      const set = Object.keys(values).filter((id) => !isEmptyValue(values[id]));
      const kept = order.value.filter((id) => set.includes(id));
      const next = [...kept, ...set.filter((id) => !kept.includes(id))];
      if (next.join("\u0000") !== order.value.join("\u0000")) order.value = next;
    },
    { flush: "sync", immediate: true },
  );

  function persist(s: SearchBarState): void {
    const key = urlKey();
    if (!key) return;
    const filters = [stateToUrl(fields.value, s), ...unresolved].filter(Boolean).join(";");
    if (filters === written) return;
    written = filters;
    opts.queryState!.write(key, { filters });
  }

  function commit(next: SearchBarState): void {
    // Raw copies: values spread from the reactive state still hold proxies at depth
    const normalized: SearchBarState = { search: next.search, values: cloneValue(next.values) };
    if (next.query) normalized.query = next.query;
    if (normalized.query) normalized.values = {};
    state.value = normalized;
    opts.model.value = clone(normalized);
    persist(normalized);
    emit();
  }

  function emit(): void {
    const s = state.value;
    opts.onChange({
      search: s.search,
      filters: s.query ? {} : toFlatFilters(fields.value, s.values, new Date()),
      phrase: s.query ?? stateToPhrase(fields.value, s),
      state: s,
    });
  }

  function flushSearch(): void {
    const pending = opts.takePendingSearch?.();
    if (pending !== undefined && pending !== state.value.search) state.value = { ...state.value, search: pending };
  }
  const withoutQuery = (): SearchBarState => {
    flushSearch();
    return { search: state.value.search, values: state.value.values };
  };

  /** The waiting URL values whose fields are registered now; they win over the current ones */
  function takeArrived(): SearchBarState | null {
    if (!unresolved.length || state.value.query) return null;
    const arrived = urlToState(fields.value, unresolved.join(";"));
    unresolved = unknownSegments(fields.value, unresolved.join(";"));
    return arrived;
  }

  watch(
    () => fields.value.map((f) => f.id),
    (ids) => {
      const known = new Set(ids);
      const kept = Object.entries(state.value.values).filter(([id]) => known.has(id));
      const arrived = takeArrived();
      if (kept.length === Object.keys(state.value.values).length && !arrived) return;
      commit({ ...state.value, values: { ...Object.fromEntries(kept), ...arrived?.values } });
    },
    { flush: "sync" },
  );

  // Controlled model: a parent-driven change replaces the state without onChange (the parent already knows)
  watch(
    opts.model,
    (m) => {
      if (m === undefined || sameState(m, state.value)) return;
      const known = new Set(fields.value.map((f) => f.id));
      const next = clone(m);
      next.values = Object.fromEntries(Object.entries(next.values).filter(([id]) => known.has(id)));
      state.value = next;
      persist(next);
    },
    { flush: "sync" },
  );

  // Controlled search: like a model change, the parent already knows, so no onChange
  watch(
    () => opts.search?.(),
    (search) => {
      if (search === undefined || search === state.value.search) return;
      state.value = { ...state.value, search };
      opts.model.value = clone(state.value);
    },
    { flush: "sync" },
  );

  if (restored && isNonEmpty(state.value)) emit();

  return {
    fields,
    externalViews,
    state,
    order,
    setSearch: (v) => commit({ search: v, values: state.value.values }),
    flushSearch,
    setValue: (id, v) => commit({ ...withoutQuery(), values: { ...state.value.values, [id]: v } }),
    clearValue(id) {
      const { [id]: _removed, ...rest } = state.value.values;
      commit({ ...withoutQuery(), values: rest });
    },
    clearAll() {
      unresolved = [];
      commit(emptyState());
    },
    applyState(s) {
      unresolved = [];
      flushSearch();
      commit({ search: s.search, values: { ...s.values }, ...(s.query ? { query: s.query } : {}) });
    },
    setQuery(q) {
      unresolved = [];
      flushSearch();
      commit({ search: state.value.search, values: {}, ...(q ? { query: q } : {}) });
    },
  };
}

function clone(s: SearchBarState): SearchBarState {
  return { ...s, values: cloneValue(s.values) };
}

function sameState(a: SearchBarState, b: SearchBarState): boolean {
  return (
    JSON.stringify([a.search, a.values, a.query ?? null]) === JSON.stringify([b.search, b.values, b.query ?? null])
  );
}
