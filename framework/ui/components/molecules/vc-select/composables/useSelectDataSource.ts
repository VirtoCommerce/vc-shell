import { ref, computed, type Ref, type ComputedRef, watch } from "vue";
import { isEqual } from "lodash-es";

interface UseSelectDataSourceOptions<T> {
  options: () => ((...args: any[]) => Promise<any>) | T[];
  getOptionValue: ComputedRef<(opt: T) => any>;
  getOptionLabel: ComputedRef<(opt: T) => any>;
  isSelectVisible: Ref<boolean>;
  debounce: () => number | string;
  emit: {
    search: (val: string) => void;
  };
}

export function useSelectDataSource<T>(opts: UseSelectDataSourceOptions<T>) {
  // --- Internal state ---
  const cachedItems = ref<T[]>([]) as Ref<T[]>;
  const searchResults = ref<T[] | null>(null) as Ref<T[] | null>;
  const browseTotal = ref(0);
  const searchTotal = ref(0);
  const browseExhausted = ref(false);
  const searchExhausted = ref(false);
  const loading = ref(false);
  const searchLoading = ref(false);
  const filterString = ref<string | undefined>();
  const resolvedDefaults = ref<T[]>([]) as Ref<T[]>;
  const defaultOptionLoading = ref(false);
  const resolveCache = new Map<string, T>();
  let isLoaded = false;

  // How many items the loader has returned so far, per stream. Paging offsets
  // advance by this, never by the deduplicated collection length: a page made
  // entirely of duplicates must still move the cursor forward.
  let browseOffset = 0;
  let searchOffset = 0;
  // Discriminates search responses so a slow earlier keystroke cannot overwrite
  // the result of a later one.
  let searchSeq = 0;

  // --- Debounce state ---
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  // --- Computed ---
  const displayItems = computed<T[]>(() => {
    return searchResults.value ?? cachedItems.value;
  });

  // Each stream is measured against its own total. While a search is active the
  // rendered collection is searchResults, so browse state must not gate it.
  const hasMore = computed(() => {
    if (searchResults.value !== null) {
      return !searchExhausted.value && searchResults.value.length < searchTotal.value;
    }
    return !browseExhausted.value && cachedItems.value.length < browseTotal.value;
  });

  // --- Helper: populate resolveCache from items ---
  function populateResolveCache(items: T[]) {
    for (const item of items) {
      const key = String(opts.getOptionValue.value(item));
      resolveCache.set(key, item);
    }
  }

  // --- Helper: drop the search stream, leaving the browse stream intact ---
  function resetSearchState(): void {
    searchResults.value = null;
    // The bump below orphans any in-flight search, so its finally block will not
    // clear this — dropping the stream has to release the flag itself.
    searchLoading.value = false;
    filterString.value = undefined;
    searchTotal.value = 0;
    searchOffset = 0;
    searchExhausted.value = false;
    searchSeq++;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
  }

  // --- Actions ---

  async function open(): Promise<void> {
    if (isLoaded) {
      return; // use cache — even if result was empty
    }

    const optionsSource = opts.options();

    if (typeof optionsSource === "function") {
      try {
        loading.value = true;
        const data = await optionsSource(undefined, 0);
        const results = (data?.results as T[]) ?? [];
        cachedItems.value = results;
        browseTotal.value = data?.totalCount ?? 0;
        browseOffset = results.length;
        browseExhausted.value = results.length === 0 || browseOffset >= browseTotal.value;
        populateResolveCache(cachedItems.value);
        isLoaded = true;
      } catch (e) {
        console.error("useSelectDataSource: error loading options", e);
        cachedItems.value = [];
        browseTotal.value = 0;
        browseOffset = 0;
        browseExhausted.value = true;
      } finally {
        loading.value = false;
      }
    } else if (Array.isArray(optionsSource)) {
      cachedItems.value = [...optionsSource] as T[];
      browseTotal.value = cachedItems.value.length;
      browseOffset = cachedItems.value.length;
      // A static array is fully in memory — there is never a next page.
      browseExhausted.value = true;
      populateResolveCache(cachedItems.value);
      isLoaded = true;
    }
  }

  function close(): void {
    resetSearchState();
  }

  async function loadMore(): Promise<void> {
    const optionsSource = opts.options();
    if (typeof optionsSource !== "function" || loading.value || !hasMore.value) return;

    const isSearch = searchResults.value !== null;
    const seq = searchSeq;
    // The collection this page is being fetched for. executeSearch() replaces it
    // wholesale, and it bumps searchSeq synchronously on entry — so a loadMore()
    // that starts after that bump carries a seq that still matches. Identity is
    // what separates them: a page requested at the previous keyword's offset must
    // not be appended to a newer keyword's first page.
    const stream = searchResults.value;

    try {
      loading.value = true;
      const data = await optionsSource(filterString.value, isSearch ? searchOffset : browseOffset);

      // The search was cleared or replaced while this page was in flight.
      if (isSearch && (searchResults.value !== stream || seq !== searchSeq)) return;

      const results = (data?.results as T[]) ?? [];

      if (isSearch) searchOffset += results.length;
      else browseOffset += results.length;

      if (results.length === 0) {
        // The source has nothing left, whatever totalCount claims.
        if (isSearch) searchExhausted.value = true;
        else browseExhausted.value = true;
        return;
      }

      const target = isSearch ? (searchResults.value as T[]) : cachedItems.value;
      const existingIds = new Set(target.map((item) => String(opts.getOptionValue.value(item))));
      const newItems = results.filter((item) => !existingIds.has(String(opts.getOptionValue.value(item))));

      if (isSearch) {
        searchResults.value = [...target, ...newItems];
        searchTotal.value = data?.totalCount ?? searchTotal.value;
        if (searchOffset >= searchTotal.value) searchExhausted.value = true;
      } else {
        cachedItems.value = [...target, ...newItems];
        browseTotal.value = data?.totalCount ?? browseTotal.value;
        if (browseOffset >= browseTotal.value) browseExhausted.value = true;
      }
      populateResolveCache(newItems);
    } catch (e) {
      console.error("useSelectDataSource: error loading more", e);
    } finally {
      loading.value = false;
    }
  }

  // --- Search ---

  async function executeSearch(keyword: string): Promise<void> {
    filterString.value = keyword;
    const optionsSource = opts.options();

    if (typeof optionsSource === "function") {
      const seq = ++searchSeq;
      try {
        searchLoading.value = true;
        const data = await optionsSource(keyword);
        // A newer keystroke already owns the search stream.
        if (seq !== searchSeq) return;
        const results = (data?.results as T[]) ?? [];
        searchResults.value = results;
        searchTotal.value = data?.totalCount ?? 0;
        searchOffset = results.length;
        searchExhausted.value = results.length === 0 || searchOffset >= searchTotal.value;
        populateResolveCache(results);
      } catch (e) {
        if (seq !== searchSeq) return;
        console.error("useSelectDataSource: error searching", e);
        searchResults.value = [];
        searchTotal.value = 0;
        searchOffset = 0;
        searchExhausted.value = true;
      } finally {
        if (seq === searchSeq) searchLoading.value = false;
      }
    } else {
      // Client-side filter — the whole set is already in memory, so it is complete.
      const filtered = cachedItems.value.filter((item) => {
        const label = opts.getOptionLabel.value(item);
        return String(label).toLowerCase().includes(keyword.toLowerCase());
      });
      searchResults.value = filtered;
      searchTotal.value = filtered.length;
      searchOffset = filtered.length;
      searchExhausted.value = true;
    }
  }

  function onInput(event: Event): void {
    if (!event?.target) return;
    const value = (event.target as HTMLInputElement).value;

    const debounceMs = Number(opts.debounce());
    if (debounceTimer) clearTimeout(debounceTimer);

    if (debounceMs > 0) {
      debounceTimer = setTimeout(() => {
        opts.emit.search(value);
        executeSearch(value);
      }, debounceMs);
    } else {
      opts.emit.search(value);
      executeSearch(value);
    }
  }

  function clearSearch(): void {
    resetSearchState();
  }

  // --- Resolve ---

  async function resolve(ids: string[]): Promise<T[]> {
    if (ids.length === 0) return [];

    const uncachedIds = ids.filter((id) => !resolveCache.has(String(id)));

    // Check cachedItems for any uncached ids
    const stillMissing = uncachedIds.filter((id) => {
      const found = cachedItems.value.find((item) => isEqual(opts.getOptionValue.value(item), id));
      if (found) {
        resolveCache.set(String(id), found);
        return false;
      }
      return true;
    });

    // Only fetch truly missing from API
    const optionsSource = opts.options();
    if (stillMissing.length > 0 && typeof optionsSource === "function") {
      try {
        defaultOptionLoading.value = true;
        const data = await optionsSource(undefined, undefined, stillMissing);
        if (data?.results) {
          populateResolveCache(data.results as T[]);
        }
      } catch (e) {
        console.error("useSelectDataSource: error resolving", e);
      } finally {
        defaultOptionLoading.value = false;
      }

      // Fallback: if the ids-based call didn't return the needed items
      // (API may not support the ids parameter), load first page
      const stillNotFound = stillMissing.filter((id) => !resolveCache.has(String(id)));
      if (stillNotFound.length > 0 && !isLoaded) {
        await open();
      }
    } else if (stillMissing.length > 0 && Array.isArray(optionsSource)) {
      // Static array: search directly in the provided options
      for (const item of optionsSource as T[]) {
        const key = String(opts.getOptionValue.value(item));
        if (stillMissing.includes(key)) {
          resolveCache.set(key, item);
        }
      }
    }

    const resolved = ids.map((id) => resolveCache.get(String(id))).filter(Boolean) as T[];
    resolvedDefaults.value = resolved;
    return resolved;
  }

  async function refresh(): Promise<void> {
    cachedItems.value = [];
    browseTotal.value = 0;
    browseOffset = 0;
    browseExhausted.value = false;
    resetSearchState();
    resolveCache.clear();
    resolvedDefaults.value = [];
    isLoaded = false;
    await open();
  }

  // --- Watch: options prop change → full reset ---
  watch(
    opts.options,
    async () => {
      cachedItems.value = [];
      browseTotal.value = 0;
      browseOffset = 0;
      browseExhausted.value = false;
      resetSearchState();
      resolveCache.clear();
      isLoaded = false;

      // Static array: always populate immediately (data is already in memory)
      const optionsSource = opts.options();
      if (Array.isArray(optionsSource)) {
        cachedItems.value = [...optionsSource] as T[];
        browseTotal.value = cachedItems.value.length;
        browseOffset = cachedItems.value.length;
        browseExhausted.value = true;
        populateResolveCache(cachedItems.value);
        isLoaded = true;

        // Re-resolve defaults from the new options so selected labels display correctly
        if (resolvedDefaults.value.length === 0) {
          const currentDefaults = resolvedDefaults.value;
          const reResolved =
            currentDefaults.length === 0
              ? cachedItems.value.filter((item) => {
                  const key = String(opts.getOptionValue.value(item));
                  return resolveCache.has(key);
                })
              : currentDefaults;
          if (reResolved.length === 0) {
            // resolveCache was just cleared and repopulated — resolvedDefaults
            // will be picked up via displayItems in innerValue computed
          }
        }
      }
    },
    { deep: false },
  );

  return {
    displayItems,
    loading,
    searchLoading,
    hasMore,
    filterString,
    resolvedDefaults,
    defaultOptionLoading,
    cachedItems: cachedItems as Readonly<Ref<T[]>>,

    open,
    close,
    onInput,
    clearSearch,
    loadMore,
    resolve,
    refresh,
  };
}
