import { onBeforeUnmount, ref, watch, type Ref } from "vue";
import type { SearchBarState } from "../types";

export interface UseSearchInputOptions {
  state: Ref<SearchBarState>;
  setSearch(v: string): void;
  /** Controlled search text from the parent, if any */
  search: () => string | undefined;
  debounce: () => number;
  /** Every keystroke */
  onInput(v: string): void;
  /** The debounced search */
  onSearch(v: string): void;
}

/** The search input is immediate; the state follows after a pause */
export function useSearchInput(o: UseSearchInputOptions) {
  const searchText = ref(o.state.value.search);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function cancel(): void {
    if (timer) clearTimeout(timer);
    timer = undefined;
  }

  function input(v: string): void {
    searchText.value = v;
    o.onInput(v);
    cancel();
    timer = setTimeout(() => {
      timer = undefined;
      if (v !== o.state.value.search) o.setSearch(v);
      o.onSearch(v);
    }, o.debounce());
  }

  watch(
    () => o.state.value.search,
    (s) => {
      if (timer === undefined && s !== searchText.value) searchText.value = s;
    },
  );

  // A parent rewrite mid-pause drops the pending text; an echo of the typed text keeps the pause running
  watch(o.search, (s) => {
    if (s === undefined || s === searchText.value) return;
    cancel();
    searchText.value = s;
  });

  /** Ends a running pause for a filter commit: returns the typed text the commit must carry, and fires `search` */
  function takePending(): string | undefined {
    if (timer === undefined) return undefined;
    cancel();
    o.onSearch(searchText.value);
    return searchText.value;
  }

  function clear(): void {
    cancel();
    const hadSearch = !!searchText.value || !!o.state.value.search;
    searchText.value = "";
    if (hadSearch) {
      o.onInput("");
      o.onSearch("");
    }
  }

  onBeforeUnmount(cancel);

  return { searchText, input, clear, takePending };
}
