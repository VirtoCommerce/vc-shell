import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import {
  ISearchProductsQuery,
  SearchProductsQuery,
  SearchProductsResult,
  ISellerProduct,
  VcmpSellerCatalogClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { ComputedRef, Ref, computed, ref } from "vue";

const { getApiClient: getProductsClient } = useApiClient(VcmpSellerCatalogClient);

export interface IUseAssociationItems {
  items: ComputedRef<(ISellerProduct & { quantity: number })[]>;
  totalCount: ComputedRef<number | undefined>;
  pages: ComputedRef<number | undefined>;
  currentPage: ComputedRef<number | undefined>;
  loading: Ref<boolean>;
  searchAssociationItems: (query: ISearchProductsQuery) => Promise<void>;
  searchQuery: Ref<ISearchProductsQuery>;
}

export const useAssociationItems = (): IUseAssociationItems => {
  const pageSize = 20;
  const searchQuery = ref<ISearchProductsQuery>({
    take: pageSize,
  });

  const searchResult = ref<SearchProductsResult>();

  const { loading, action: searchAssociationItems } = useAsync<ISearchProductsQuery>(async (query) => {
    const client = await getProductsClient();
    searchQuery.value = { ...searchQuery.value, ...query };
    searchResult.value = await client.searchProducts(
      new SearchProductsQuery({ ...searchQuery.value, isPublished: true }),
    );
  });

  return {
    items: computed(() => searchResult.value?.results?.map((x) => ({ ...x, quantity: 1 })) ?? []),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount ?? 1) / pageSize)),
    currentPage: computed(() => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1),
    loading: useLoading(loading),
    searchAssociationItems,
    searchQuery,
  };
};
