import { inject, provide } from "vue";
import { GlobalSearchKey } from "../../../injection-keys";
import { GlobalSearchState, createGlobalSearchService } from "../../services/global-search-service";
import { createLogger, InjectionError } from "../../utilities";

const logger = createLogger("use-global-search");

export function provideGlobalSearch(): GlobalSearchState {
  const existingState = inject(GlobalSearchKey, null);
  if (existingState) {
    return existingState;
  }

  const state = createGlobalSearchService();
  provide(GlobalSearchKey, state);
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
