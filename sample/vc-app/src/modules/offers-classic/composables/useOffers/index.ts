import { Ref, ref, computed } from "vue";
import { useUser } from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  IOffer,
  ISearchOffersQuery,
  SearchOffersQuery,
  SearchOffersResult,
  IBulkOffersDeleteCommand,
  BulkOffersDeleteCommand,
} from "../../../../api_client/marketplacevendor";

interface IUseOffers {
  readonly offers: Ref<IOffer[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly loading: Ref<boolean>;
  readonly currentPage: Ref<number>;
  searchQuery: Ref<ISearchOffersQuery>;
  searchOffers: (query: ISearchOffersQuery) => Promise<SearchOffersResult>;
  loadOffers: (query: ISearchOffersQuery) => void;
  deleteOffers: (allSelected: boolean, offerIds: string[]) => void;
}

interface IUseOffersOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseOffersOptions): IUseOffers => {
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchOffersQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<SearchOffersResult>();
  const loading = ref<boolean>(false);

  async function getApiClient(): Promise<VcmpSellerCatalogClient> {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function searchOffers(query: ISearchOffersQuery): Promise<SearchOffersResult> {
    const client = await getApiClient();
    try {
      loading.value = true;
      return await client.searchOffers(query as SearchOffersQuery);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadOffers(query: ISearchOffersQuery) {
    console.info(`Load offers page ${query?.skip || 1} sort by ${query?.sort || "default"}`);

    searchQuery.value = { ...searchQuery.value, ...query };
    try {
      loading.value = true;
      searchResult.value = await searchOffers({
        ...searchQuery.value,
      } as SearchOffersQuery);
      // currentPage.value = (searchQuery.value.skip / Math.max(1, pageSize)) || 1;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteOffers(allSelected: boolean, offerIds: string[]) {
    console.info(`Delete offers`);

    const client = await getApiClient();
    const command = new BulkOffersDeleteCommand({
      query: new SearchOffersQuery(searchQuery.value),
      offerIds: offerIds,
      all: allSelected,
    });
    if (allSelected) {
      command.offerIds = null;
    }

    try {
      loading.value = true;
      await client.bulkDeleteOffers(command);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    offers: computed(() => searchResult.value?.results),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    currentPage: computed(() => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1),
    loading: computed(() => loading.value),
    searchQuery,
    loadOffers,
    deleteOffers,
    searchOffers,
  };
};
