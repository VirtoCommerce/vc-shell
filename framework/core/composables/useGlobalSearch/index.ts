import { inject, provide } from "vue";
import { GlobalSearchKey } from "../../../injection-keys";
import { GlobalSearchState, createGlobalSearchService } from "../../services/global-search-service";

export function provideGlobalSearch(): GlobalSearchState {
  const state = createGlobalSearchService();
  provide(GlobalSearchKey, state);
  return state;
}

export function useGlobalSearch(): GlobalSearchState {
  const state = inject<GlobalSearchState>(GlobalSearchKey);

  if (!state) {
    throw new Error("useGlobalSearch must be used within a component that has called provideGlobalSearch");
  }

  return state;
}
