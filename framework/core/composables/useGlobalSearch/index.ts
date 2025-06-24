import { inject, provide } from "vue";
import { GlobalSearchKey } from "../../../injection-keys";
import { GlobalSearchState, createGlobalSearchService } from "../../services/global-search-service";

export function provideGlobalSearch() {
  const state = createGlobalSearchService();
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
