import { Ref, ref } from "vue";

export interface GlobalSearchState {
  isSearchVisible: Ref<Record<string, boolean>>;
  searchQuery: Ref<Record<string, string>>;
  toggleSearch: (bladeId: string) => void;
  setSearchQuery: (bladeId: string, query: string) => void;
  closeSearch: (bladeId: string) => void;
}

export function createGlobalSearchService() {
  const isSearchVisible = ref<Record<string, boolean>>({});
  const searchQuery = ref<Record<string, string>>({});

  const toggleSearch = (bladeId: string) => {
    isSearchVisible.value[bladeId] = !isSearchVisible.value[bladeId];
  };

  const setSearchQuery = (bladeId: string, query: string) => {
    searchQuery.value[bladeId] = query;
  };

  const closeSearch = (bladeId: string) => {
    isSearchVisible.value[bladeId] = false;
  };

  const state: GlobalSearchState = {
    isSearchVisible,
    searchQuery,
    toggleSearch,
    setSearchQuery,
    closeSearch,
  };

  return state;
}
