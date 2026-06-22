import { ref, watch, inject, type Ref } from "vue";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";

export interface UseTableSearchOptions {
  /** When set, syncs the search keyword to the blade URL query under this key. */
  stateKey?: string;
  /** Initial keyword when nothing is restored from the URL. */
  initial?: string;
}

export interface UseTableSearchReturn {
  /** Search keyword. Bind to `v-model:search-value` on VcDataTable. */
  searchValue: Ref<string | undefined>;
}

/**
 * Owns the list search keyword. With `stateKey`, restores it from the URL on
 * creation and writes it back on change (the query service debounces). Without
 * `stateKey`, it is a plain ref.
 */
export function useTableSearch(options?: UseTableSearchOptions): UseTableSearchReturn {
  const searchValue = ref<string | undefined>(options?.initial);

  const stateKey = options?.stateKey;
  if (stateKey) {
    const service = inject(TableQueryStateKey, undefined);
    if (service) {
      const restored = service.read(stateKey);
      if (restored.search !== undefined) searchValue.value = restored.search;
      watch(searchValue, (value) => service.write(stateKey, { search: value }));
    }
  }

  return { searchValue };
}
