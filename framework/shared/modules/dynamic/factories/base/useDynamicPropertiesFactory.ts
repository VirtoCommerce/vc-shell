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
  searchDictionaryItems: AsyncAction<Query, DictionaryItems>;
  loading: ComputedRef<boolean>;
}

export function useDynamicPropertiesFactory<Query, DictionaryItems>(
  factoryParams: UseDynamicPropertiesFactoryParams<Query, DictionaryItems>
) {
  return function useDynamicProperties(): UseDynamicProperties<Query, DictionaryItems> {
    const { loading: dictionaryItemsLoading, action: searchDictionaryItems } = useAsync<Query, DictionaryItems>(
      async (args) => {
        return (await factoryParams.searchDictionaryItems(args)).results;
      }
    );

    const loading = useLoading(dictionaryItemsLoading);

    return {
      loading,
      searchDictionaryItems,
    };
  };
}
