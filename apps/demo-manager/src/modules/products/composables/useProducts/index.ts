import { Ref, ref, computed, reactive } from "vue";
import { mockedProducts } from "./mock";
import { IProduct } from "../../types";
import { useLogger, useUser } from "@virtoshell/core";

import {
  VcmpSellerCatalogClient,
  ISellerProduct,
  ISearchProductsQuery,
  SearchProductsQuery,
  SearchProductsResult,
} from "../../../../api_client";

interface IUseProducts {
  searchQuery: Ref<ISearchProductsQuery>;
  products: Ref<ISellerProduct[]>;
  totalCount: Ref<number>;
  pages: Ref<number>;
  loading: Ref<boolean>;
  currentPage: Ref<number>;
  loadProducts: (query: ISearchProductsQuery) => void;
}

interface IUseProductOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseProductOptions): IUseProducts => {
  const logger = useLogger();

  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchProductsQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<SearchProductsResult>();
  const loading = ref<boolean>(false);

  async function loadProducts(query: ISearchProductsQuery) {
    logger.info(
      `Load products page ${query?.skip || 1} sort by ${
        query?.sort || "default"
      }`
    );

    searchQuery.value = { ...searchQuery.value, ...query };
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();

    client.setAuthToken(await getAccessToken());

    try {
      loading.value = true;
      searchResult.value = await client.searchProducts({
        ...searchQuery.value,
      } as SearchProductsQuery);
      // currentPage.value = (searchQuery.value.skip / Math.max(1, pageSize)) || 1;
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    products: computed(() => searchResult.value?.results),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    currentPage: computed(
      () => searchQuery.value.skip / Math.max(1, pageSize) || 1
    ),
    loading,
    searchQuery,
    loadProducts,
  };
};
