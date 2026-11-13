import { computed, onScopeDispose, ref, toRaw, watch, type ComputedRef, type Ref } from "vue";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import type { SearchBarChange, SearchBarField, SearchBarState, SearchBarValue, SearchBarView } from "../types";
import type { BarField } from "../lib/fields";
import { cloneValue, isEmptyValue, toFlatFilters } from "../lib/values";
import { stateToUrl, unknownSegments, urlToState } from "../lib/urlState";
import { resolveSearchBarFields } from "./useSearchBarFields";

export interface UseSearchBarStateOptions {
  fields: () => SearchBarField[];
  target: () => string | undefined;
  /** Namespace of the filters in the URL query (`<key>_filters`) */
  storageKey: () => string | undefined;
  /** The blade's URL query service; without it (or a key) the applied filters are not remembered */
  queryState?: ITableQueryStateService;
  /** The host's state (v-model): its values win over the URL, and a host write changes the state without onChange */
  model: Ref<SearchBarState | undefined>;
  /** Pause between the last keystroke and the search reaching the state */
  debounce?: () => number;
  /** Every keystroke */
  onInput?: (v: string) => void;
  /** The search after its pause, or taken early by a filter commit */
  onSearch?: (v: string) => void;
  onChange: (c: SearchBarChange) => void;
}

export interface UseSearchBarState {
  fields: ComputedRef<BarField[]>;
  externalViews: ComputedRef<SearchBarView[]>;
  state: Ref<SearchBarState>;
  /** Ids of the set fields in the order they were set */
  order: Ref<string[]>;
  /** The text in the input, ahead of `state.search` by the search pause */
  searchText: Ref<string>;
  /** A keystroke: the state follows after the pause */
  input(v: string): void;
  setValue(id: string, v: SearchBarValue): void;
  clearValue(id: string): void;
  /** Replaces the values, keeps the search; URL values still waiting for their fields are dropped */
  applyValues(values: Record<string, SearchBarValue>): void;
}

export function useSearchBarState(opts: UseSearchBarStateOptions): UseSearchBarState {
  const sources = computed(() => resolveSearchBarFields(opts.fields(), opts.target()));
  const fields = computed(() => sources.value.fields);
  const externalViews = computed(() => sources.value.views);

  // The applied filters live in the URL next to the table's sort/search/page; the search words are not part of them
  const urlKey = (): string | undefined => (opts.queryState ? opts.storageKey() || undefined : undefined);
  let written: string | undefined;
  // URL segments of fields not registered yet (async globalFilters, a late external registration):
  // they stay in the URL and apply when their fields arrive
  let unresolved: string[] = [];

  // The model's values win over the URL; a model with no values (only a search) starts from the URL's
  let restored = false;
  function initial(): SearchBarState {
    const m = opts.model.value;
    if (m && Object.values(m.values).some((v) => !isEmptyValue(v))) return clone(m);
    const search = m?.search ?? "";
    const key = urlKey();
    if (!key) return { search, values: {} };
    written = opts.queryState!.read(key).filters ?? "";
    unresolved = unknownSegments(fields.value, written);
    const fromUrl = urlToState(fields.value, written);
    restored = !!fromUrl;
    return { search, values: fromUrl?.values ?? {} };
  }

  const state = ref<SearchBarState>(initial());

  // A field joins the end when it gets a value and leaves when it is cleared
  const order = ref<string[]>([]);
  watch(
    () => state.value.values,
    (values) => {
      const set = Object.keys(values).filter((id) => !isEmptyValue(values[id]));
      const kept = order.value.filter((id) => set.includes(id));
      const added = set.filter((id) => !kept.includes(id));
      if (added.length || kept.length !== order.value.length) order.value = [...kept, ...added];
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

  // The last state handed to the host: its echo through v-model is no host write
  let own: SearchBarState | undefined;
  function report(): void {
    own = clone(state.value);
    opts.model.value = own;
    const s = state.value;
    opts.onChange({ search: s.search, filters: toFlatFilters(fields.value, s.values, new Date()), state: s });
  }

  function commit(next: SearchBarState): void {
    // Raw copies: values spread from the reactive state still hold proxies at depth
    state.value = { search: next.search, values: cloneValue(next.values) };
    persist(state.value);
    report();
  }

  // The input is immediate; the state follows after a pause
  const searchText = ref(state.value.search);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancelPause = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  onScopeDispose(cancelPause);

  function input(v: string): void {
    searchText.value = v;
    opts.onInput?.(v);
    cancelPause();
    timer = setTimeout(() => {
      timer = undefined;
      if (v !== state.value.search) commit({ search: v, values: state.value.values });
      opts.onSearch?.(v);
    }, opts.debounce?.() ?? 0);
  }

  /** The search a filter commit carries: a running pause ends here and its text is searched first */
  function search(): string {
    if (timer === undefined) return state.value.search;
    cancelPause();
    opts.onSearch?.(searchText.value);
    return searchText.value;
  }

  /** The waiting URL values whose fields are registered now; they win over the current ones */
  function takeArrived(): SearchBarState | null {
    if (!unresolved.length) return null;
    const arrived = urlToState(fields.value, unresolved.join(";"));
    unresolved = unknownSegments(fields.value, unresolved.join(";"));
    return arrived;
  }

  // A field that goes away takes its value out of the filter, but its URL segment waits with the
  // unresolved ones, so the value comes back with the field
  let prevFields = fields.value;
  watch(
    () => fields.value.map((f) => f.id),
    (ids) => {
      const known = new Set(ids);
      const entries = Object.entries(state.value.values);
      const dropped = entries.filter(([id]) => !known.has(id));
      const before = prevFields;
      prevFields = fields.value;
      const arrived = takeArrived();
      if (!dropped.length && !arrived) return;
      const left = dropped.map(([id, v]) => stateToUrl(before, { search: "", values: { [id]: v } }));
      unresolved = [...unresolved, ...left.filter(Boolean)];
      const kept = entries.filter(([id]) => known.has(id));
      commit({ search: state.value.search, values: { ...Object.fromEntries(kept), ...arrived?.values } });
    },
    { flush: "sync" },
  );

  // A host write (not the echo of our own report) replaces the state without onChange: the host already
  // knows. It also ends a running pause, its search replacing the typed text
  watch(
    opts.model,
    (m) => {
      if (m === undefined || toRaw(m) === own) return;
      cancelPause();
      searchText.value = m.search;
      if (sameState(m, state.value)) return;
      const known = new Set(fields.value.map((f) => f.id));
      const values = Object.entries(cloneValue(m.values)).filter(([id]) => known.has(id));
      state.value = { search: m.search, values: Object.fromEntries(values) };
      persist(state.value);
    },
    { flush: "sync" },
  );

  // Filters restored from the URL reach the host like a change
  if (restored) report();

  return {
    fields,
    externalViews,
    state,
    order,
    searchText,
    input,
    setValue: (id, v) => commit({ search: search(), values: { ...state.value.values, [id]: v } }),
    clearValue(id) {
      const { [id]: _removed, ...rest } = state.value.values;
      commit({ search: search(), values: rest });
    },
    applyValues(values) {
      unresolved = [];
      commit({ search: search(), values });
    },
  };
}

function clone(s: SearchBarState): SearchBarState {
  return { search: s.search, values: cloneValue(s.values) };
}

function sameState(a: SearchBarState, b: SearchBarState): boolean {
  return JSON.stringify([a.search, a.values]) === JSON.stringify([b.search, b.values]);
}
