import { inject, provide, getCurrentScope, onScopeDispose } from "vue";
import { GlobalSearchKey } from "@framework/injection-keys";
import { GlobalSearchState, createGlobalSearchService } from "@core/services/global-search-service";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-global-search");

export function provideGlobalSearch(): GlobalSearchState {
  const existingState = inject(GlobalSearchKey, null);
  if (existingState) {
    return existingState;
  }

  const state = createGlobalSearchService();
  provide(GlobalSearchKey, state);

  if (getCurrentScope()) {
    onScopeDispose(() => {
      state.isSearchVisible.value = {};
      state.searchQuery.value = {};
    });
  }

  return state;
}

export function useGlobalSearch(): GlobalSearchState {
  const state = inject<GlobalSearchState>(GlobalSearchKey);

  if (!state) {
    logger.error("Global search service not found");
    throw new InjectionError("GlobalSearchService");
  }

  return state;
}
