import { ComputedRef } from "vue";
import { AsyncAction, useAsync, useLoading } from "../../../../../core/composables";

export interface UseMultilanguageFactoryParams {
  getAvailableLanguages: () => Promise<string[]>;
}

export interface UseMultilanguage {
  loading: ComputedRef<boolean>;
  getLanguages: AsyncAction<void, string[]>;
}

export function useMultilanguageFactory(factoryParams: UseMultilanguageFactoryParams) {
  return function useMultilanguage(): UseMultilanguage {
    const { loading: languagesLoading, action: getLanguages } = useAsync<void, string[]>(async () => {
      return factoryParams.getAvailableLanguages();
    });

    const loading = useLoading(languagesLoading);

    return {
      loading,
      getLanguages,
    };
  };
}
