import { Ref, ref, computed } from "vue";
import { useLogger, useUser } from "@virtoshell/core";

import {
  VcmpSellerCatalogClient,
  ISellerProduct,
  ISearchProductsQuery,
  SearchProductsQuery,
  SearchProductsResult,
  SellerProductStatus,
} from "../../../../api_client";
import {
  ExportClient,
  ExportDataQuery,
  ExportDataRequest,
  PlatformExportPushNotification,
} from "@virtoshell/api-client";

interface IUseProducts {
  readonly products: Ref<ISellerProduct[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  searchQuery: Ref<ISearchProductsQuery>;
  currentPage: Ref<number>;
  loadProducts: (query: ISearchProductsQuery) => void;
  SellerProductStatus: typeof SellerProductStatus;
  exportCategories: () => void;
}

interface IUseProductOptions {
  pageSize?: number;
  sort?: string;
  keyword?: string;
}

export default (options?: IUseProductOptions): IUseProducts => {
  const logger = useLogger();

  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchProductsQuery>({
    take: pageSize,
    sort: options?.sort,
    keyword: options?.keyword,
  });
  const searchResult = ref<SearchProductsResult>();
  const loading = ref(false);

  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function loadProducts(query: ISearchProductsQuery) {
    logger.info(
      `Load products page ${query?.skip || 1} sort by ${
        query?.sort || "default"
      }`
    );

    searchQuery.value = { ...searchQuery.value, ...query };
    const client = await getApiClient();
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

  async function exportCategories(): Promise<PlatformExportPushNotification> {
    const { getAccessToken } = useUser();
    const client = new ExportClient();
    client.setAuthToken(await getAccessToken());

    const command = new ExportDataRequest({
      exportTypeName:
        "VirtoCommerce.MarketplaceVendorModule.Data.ExportImport.ExportableCategory",
      dataQuery: new ExportDataQuery({
        exportTypeName: "CategoryExportDataQuery",
      }),
      providerName: "CsvExportProvider",
    });

    try {
      loading.value = true;
      return await client.runExport(command);
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
      () => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1
    ),
    loading: computed(() => loading.value),
    searchQuery,
    loadProducts,
    exportCategories,
    SellerProductStatus,
  };
};
