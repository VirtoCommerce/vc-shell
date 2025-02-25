import { ref, inject, provide, Ref } from "vue";

const GLOBAL_SEARCH_KEY = Symbol("globalSearch");

export interface GlobalSearchState {
  isSearchVisible: Ref<Record<string, boolean>>;
  searchQuery: Ref<Record<string, string>>;
  toggleSearch: (bladeId: number) => void;
  setSearchQuery: (bladeId: number, query: string) => void;
}

export function createGlobalSearch() {
  const isSearchVisible = ref<Record<string, boolean>>({});
  const searchQuery = ref<Record<string, string>>({});

  const toggleSearch = (bladeId: number) => {
    isSearchVisible.value[bladeId] = !isSearchVisible.value[bladeId];
    console.log("toggleSearch", bladeId, isSearchVisible.value[bladeId]);
  };

  const setSearchQuery = (bladeId: number, query: string) => {
    searchQuery.value[bladeId] = query;
  };

  const state: GlobalSearchState = {
    isSearchVisible,
    searchQuery,
    toggleSearch,
    setSearchQuery,
  };

  provide(GLOBAL_SEARCH_KEY, state);
  return state;
}

export function useGlobalSearch() {
  const state = inject<GlobalSearchState>(GLOBAL_SEARCH_KEY);

  if (!state) {
    throw new Error("useGlobalSearch must be used within a component that has called createGlobalSearch");
  }

  return state;
}
