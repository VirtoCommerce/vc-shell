import { useLogger, useUser } from "@vc-shell/core";
import {
  IFulfillmentCenter,
  FulfillmentCenter,
  ISearchFulfillmentCentersQuery,
  SearchFulfillmentCentersQuery,
  SearchFulfillmentCentersResult,
  UpdateFulfillmentCenterCommand,
  VcmpSellerCatalogClient,
} from "../../../../api_client/marketplacevendor";
import { computed, Ref, ref, watch } from "vue";
import { cloneDeep as _cloneDeep, isEqual } from "lodash-es";

interface IUseFulfillmentCenters {
  readonly loading: Ref<boolean>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  readonly modified: Ref<boolean>;
  currentPage: Ref<number>;
  readonly fulfillmentCentersList: Ref<FulfillmentCenter[]>;
  fulfillmentCenterDetails: Ref<FulfillmentCenter>;
  fulfillmentCenterDetailsCopy: Ref<FulfillmentCenter>;
  searchQuery: Ref<ISearchFulfillmentCentersQuery>;
  searchFulfillmentCenters: (query: ISearchFulfillmentCentersQuery) => void;
  getFulfillmentCenter: (id: string) => void;
  updateFulfillmentCenter: (details: IFulfillmentCenter) => void;
  deleteFulfillmentCenter: (args: { id: string }) => void;
  resetEntries: () => void;
  handleFulfillmentCenterItem: (fulfillmentCenter: IFulfillmentCenter) => void;
}

interface IUseFulfillmentCentersOptions {
  pageSize?: number;
  sort?: string;
}

export default (
  options?: IUseFulfillmentCentersOptions
): IUseFulfillmentCenters => {
  const loading = ref(false);
  const logger = useLogger();
  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchFulfillmentCentersQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<SearchFulfillmentCentersResult>();
  const fulfillmentCenterDetails = ref(new FulfillmentCenter());
  let fulfillmentCenterDetailsCopy: FulfillmentCenter;
  const modified = ref(false);

  watch(
    () => fulfillmentCenterDetails,
    (state) => {
      modified.value = !isEqual(fulfillmentCenterDetailsCopy, state.value);
    },
    { deep: true }
  );

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerCatalogClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function searchFulfillmentCenters(
    query: ISearchFulfillmentCentersQuery
  ) {
    const client = await getApiClient();

    searchQuery.value = { ...searchQuery.value, ...query };

    const command = new SearchFulfillmentCentersQuery(searchQuery.value);

    try {
      loading.value = true;
      searchResult.value = await client.searchFulfillmentCenters(command);
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function getFulfillmentCenter(id: string) {
    const client = await getApiClient();
    try {
      loading.value = true;
      fulfillmentCenterDetails.value = await client.getFulfillmentCenterById(
        id
      );
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function updateFulfillmentCenter(details: IFulfillmentCenter) {
    const client = await getApiClient();

    const command = new UpdateFulfillmentCenterCommand({
      fulfillmentCenter: new FulfillmentCenter(details as IFulfillmentCenter),
    });

    try {
      loading.value = true;
      await client.updateFulfillmentCenter(command);
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
    resetEntries();
  }

  async function deleteFulfillmentCenter(args: { id: string }) {
    const client = await getApiClient();

    try {
      loading.value = true;
      await client.deleteFulfillmentCenter([args.id]);
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function resetEntries() {
    fulfillmentCenterDetails.value = Object.assign(
      {},
      fulfillmentCenterDetailsCopy
    );
  }

  async function handleFulfillmentCenterItem(
    fulfillmentCenter: IFulfillmentCenter
  ) {
    fulfillmentCenterDetails.value = Object.assign(
      {},
      new FulfillmentCenter(fulfillmentCenter as IFulfillmentCenter)
    );
    fulfillmentCenterDetailsCopy = _cloneDeep(fulfillmentCenterDetails.value);
  }

  return {
    loading: computed(() => loading.value),
    totalCount: computed(() => searchResult.value?.totalCount),
    pages: computed(() => Math.ceil(searchResult.value?.totalCount / pageSize)),
    modified: computed(() => modified.value),
    currentPage: computed(
      () => (searchQuery.value?.skip || 0) / Math.max(1, pageSize) + 1
    ),
    fulfillmentCentersList: computed(() => searchResult.value?.results),
    fulfillmentCenterDetails,
    fulfillmentCenterDetailsCopy: computed(() => fulfillmentCenterDetailsCopy),
    searchQuery,
    searchFulfillmentCenters,
    getFulfillmentCenter,
    updateFulfillmentCenter,
    deleteFulfillmentCenter,
    resetEntries,
    handleFulfillmentCenterItem,
  };
};
