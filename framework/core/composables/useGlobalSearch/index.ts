import { ref, inject, provide, Ref } from "vue";
import { GlobalSearchKey } from "../../../injection-keys";

export interface GlobalSearchState {
  isSearchVisible: Ref<Record<string, boolean>>;
  searchQuery: Ref<Record<string, string>>;
  toggleSearch: (bladeId: string) => void;
  setSearchQuery: (bladeId: string, query: string) => void;
}

export function createGlobalSearch() {
  const isSearchVisible = ref<Record<string, boolean>>({});
  const searchQuery = ref<Record<string, string>>({});

  const toggleSearch = (bladeId: string) => {
    isSearchVisible.value[bladeId] = !isSearchVisible.value[bladeId];
  };

  const setSearchQuery = (bladeId: string, query: string) => {
    searchQuery.value[bladeId] = query;
  };

  const state: GlobalSearchState = {
    isSearchVisible,
    searchQuery,
    toggleSearch,
    setSearchQuery,
  };

  provide(GlobalSearchKey, state);
  return state;
}

export function useGlobalSearch() {
  const state = inject<GlobalSearchState>(GlobalSearchKey);

  if (!state) {
    throw new Error("useGlobalSearch must be used within a component that has called createGlobalSearch");
  }

  return state;
}
