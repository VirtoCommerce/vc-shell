/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref, computed, ref } from "vue";
import { CustomQuery, UseList } from "../types";
import { useAsync, useLoading } from "../../../../../core/composables";

interface ISearchResult<T> {
  totalCount?: number;
  results?: T;
}

export interface UseListFactoryParams<Items extends Record<string, any>[], Query extends IQuery> {
  load?: (query: Query, ...args: any[]) => Promise<ISearchResult<Items>> | ISearchResult<Items>;
  remove?: (query: Query, customQuery: CustomQuery, ...args: any[]) => Promise<void> | void;
}

export interface IQuery {
  [x: string]: any;
  take?: number;
  sort?: string;
  skip?: number;
  keyword?: string;
}

export interface IUseListOptions extends Pick<IQuery, "sort"> {
  pageSize?: number;
}

export const useListFactory = <Items extends Record<string, any>[], Query extends IQuery>(
  factoryParams: UseListFactoryParams<Items, Query>,
) => {
  return function useList(options?: IUseListOptions): UseList<Items, Query> {
    const pageSize = options?.pageSize || 20;
    const searchResult = ref<ISearchResult<Items>>();
    const searchQuery = ref({
      take: pageSize,
      sort: options?.sort,
    }) as Ref<Query>;

    const { loading: itemsLoading, action: load } = useAsync<Query>(async (query, ...rest) => {
      searchQuery.value = { ...searchQuery.value, ...query };
      searchResult.value = await factoryParams.load?.(query as Query, ...rest);
    });

    const { loading: itemsDelete, action: remove } = useAsync<CustomQuery>(async (customQuery, ...rest) => {
      await factoryParams.remove?.(searchQuery.value, customQuery as CustomQuery, ...rest);
    });

    const loading = useLoading(itemsLoading, itemsDelete);

    const pagination = computed(() => ({
      currentPage: (searchQuery.value?.skip || 0) / Math.max(1, searchQuery?.value.take || 20) + 1,
      totalCount: searchResult.value?.totalCount || 0,
      pageSize: pageSize,
      get pages() {
        return Math.ceil(this.totalCount / this.pageSize);
      },
    }));

    return {
      items: computed(() => searchResult.value?.results as Items),
      query: searchQuery,
      loading,
      pagination,
      load,
      remove,
    };
  };
};
