/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncAction, useAsync, useLoading } from "../../../../../core/composables";
import { ComputedRef, computed, ref } from "vue";

interface ISearchResult<T> {
  totalCount?: number;
  results?: T;
}

export interface UseDynamicPropertiesFactoryParams<Query, DictionaryItems> {
  searchDictionaryItems: (args: Query) => Promise<ISearchResult<DictionaryItems>>;
}

export interface UseDynamicProperties<Query, DictionaryItems> {
  searchDictionaryItems: AsyncAction<Query, any>;
  loading: ComputedRef<boolean>;
  dictionaryItems: ComputedRef<DictionaryItems>;
}

export function useDynamicPropertiesFactory<Query, DictionaryItems>(
  factoryParams: UseDynamicPropertiesFactoryParams<Query, DictionaryItems>
) {
  return function useDynamicProperties(): UseDynamicProperties<Query, DictionaryItems> {
    const searchResult = ref<ISearchResult<DictionaryItems>>();

    const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<Query, any>(async (args) => {
      searchResult.value = await factoryParams.searchDictionaryItems(args);
    });

    const loading = useLoading(dictionaryItemsLoading);

    return {
      loading,
      searchDictionaryItems,
      dictionaryItems: computed(() => searchResult.value?.results),
    };
  };
}
