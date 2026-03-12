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
  const totalCount = ref(0);
  const loading = ref(false);
  const searchLoading = ref(false);
  const filterString = ref<string | undefined>();
  const resolvedDefaults = ref<T[]>([]) as Ref<T[]>;
  const defaultOptionLoading = ref(false);
  const resolveCache = new Map<string, T>();
  let isLoaded = false;

  // --- Debounce state ---
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  // --- Computed ---
  const displayItems = computed<T[]>(() => {
    return searchResults.value ?? cachedItems.value;
  });

  const hasMore = computed(() => {
    return cachedItems.value.length < totalCount.value;
  });

  // --- Helper: populate resolveCache from items ---
  function populateResolveCache(items: T[]) {
    for (const item of items) {
      const key = String(opts.getOptionValue.value(item));
      resolveCache.set(key, item);
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
        cachedItems.value = (data?.results as T[]) ?? [];
        totalCount.value = data?.totalCount ?? 0;
        populateResolveCache(cachedItems.value);
        isLoaded = true;
      } catch (e) {
        console.error("useSelectDataSource: error loading options", e);
        cachedItems.value = [];
        totalCount.value = 0;
      } finally {
        loading.value = false;
      }
    } else if (Array.isArray(optionsSource)) {
      cachedItems.value = [...optionsSource] as T[];
      totalCount.value = cachedItems.value.length;
      populateResolveCache(cachedItems.value);
      isLoaded = true;
    }
  }

  function close(): void {
    searchResults.value = null;
    filterString.value = undefined;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
  }

  async function loadMore(): Promise<void> {
    const optionsSource = opts.options();
    if (typeof optionsSource !== "function" || loading.value) return;

    try {
      loading.value = true;
      const data = await optionsSource(filterString.value, cachedItems.value.length);
      const existingIds = new Set(cachedItems.value.map((item) => String(opts.getOptionValue.value(item))));
      const newItems = ((data?.results as T[]) ?? []).filter(
        (item) => !existingIds.has(String(opts.getOptionValue.value(item))),
      );
      cachedItems.value = [...cachedItems.value, ...newItems];
      totalCount.value = data?.totalCount ?? totalCount.value;
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
      try {
        searchLoading.value = true;
        const data = await optionsSource(keyword);
        searchResults.value = (data?.results as T[]) ?? [];
        totalCount.value = data?.totalCount ?? 0;
        populateResolveCache(searchResults.value);
      } catch (e) {
        console.error("useSelectDataSource: error searching", e);
        searchResults.value = [];
      } finally {
        searchLoading.value = false;
      }
    } else {
      // Client-side filter
      searchResults.value = cachedItems.value.filter((item) => {
        const label = opts.getOptionLabel.value(item);
        return String(label).toLowerCase().includes(keyword.toLowerCase());
      });
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
    searchResults.value = null;
    filterString.value = undefined;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
    // Restore totalCount from cached data
    totalCount.value = cachedItems.value.length;
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
    }

    const resolved = ids.map((id) => resolveCache.get(String(id))).filter(Boolean) as T[];
    resolvedDefaults.value = resolved;
    return resolved;
  }

  async function refresh(): Promise<void> {
    cachedItems.value = [];
    searchResults.value = null;
    totalCount.value = 0;
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
      searchResults.value = null;
      totalCount.value = 0;
      resolveCache.clear();
      isLoaded = false;

      // Reload if component is visible (static array case)
      const optionsSource = opts.options();
      if (opts.isSelectVisible.value && Array.isArray(optionsSource)) {
        cachedItems.value = [...optionsSource] as T[];
        totalCount.value = cachedItems.value.length;
        populateResolveCache(cachedItems.value);
        isLoaded = true;
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
