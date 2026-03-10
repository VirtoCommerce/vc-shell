import { ComputedRef, Ref, computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";
import { MockedItem, MockedQuery, loadMockItemsList, removeMockItem } from "../../sample-data";

export interface useClassicAppList {
  data: ComputedRef<MockedItem[] | undefined>;
  loading: Ref<boolean>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  searchQuery: Ref<SearchQuery>;
  currentPage: ComputedRef<number>;
  getItems: (query: MockedQuery) => Promise<void>;
  removeItems: (args: { ids: string[] }) => void;
}
interface SearchQuery {
  take?: number;
  skip?: number;
  sort?: string;
  keyword?: string;
}
interface SearchResult {
  results: MockedItem[];
  totalCount: number;
}

export type { MockedItem };

export default (options?: { pageSize?: number, sort?: string }): useClassicAppList => {
  const pageSize = options?.pageSize || 20;
  const searchResult = ref<SearchResult>();
  const searchQuery = ref<SearchQuery>({
    take: pageSize,
    skip: 0,
    sort: options?.sort || "createdDate:DESC",
  });

  const { loading: itemLoading, action: getItems } = useAsync<MockedQuery>(async (query) => {
    searchQuery.value = { ...searchQuery.value, ...query };
    if (query) searchResult.value = await loadMockItemsList(searchQuery.value);
  });

  const { loading: removeLoading, action: removeItems } = useAsync<{ ids: string[] }>(async (args) => {
    if (args) {
      for (const id of args.ids) {
        await removeMockItem({ id });
      }
    }
  });

  const loading = useLoading(itemLoading, removeLoading);

  return {
    data: computed(() => searchResult.value?.results),
    loading: computed(() => loading.value),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 1) / pageSize)),
    currentPage: computed(() => Math.ceil((searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1)),
    searchQuery,
    getItems,
    removeItems,
  };
};
