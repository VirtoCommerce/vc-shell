import { computed, ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";

// Replace with the actual search query interface from the API client
interface SearchQuery {
  take?: number;
  skip?: number;
  sort?: string;
  keyword?: string;
}

export default (options?: { pageSize?: number, sort?: string }) => {
  const pageSize = options?.pageSize || 20;
  const searchResult = ref();
  const searchQuery = ref<SearchQuery>({
    take: pageSize,
    skip: 0,
    sort: options?.sort || "createdDate:DESC",
  });

  // Implement your own load function
  const { loading: itemLoading, action: getItems } = useAsync<SearchQuery>(async (payload) => {
    searchQuery.value = { ...searchQuery.value, ...payload };
    searchResult.value = {
      totalCount: 0,
      items: [],
    };
  });

  // Implement your own remove function
  const { loading: removeLoading, action: removeItems } = useAsync<{ ids: string[] }>(async (payload) => {
    return;
  });

  const loading = useLoading(itemLoading, removeLoading);

  return {
    data: computed(() => searchResult.value?.items),
    loading: computed(() => loading.value),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 1) / pageSize)),
    currentPage: computed(() => Math.ceil((searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1)),
    getItems,
    removeItems,
    searchQuery,
  };
};
