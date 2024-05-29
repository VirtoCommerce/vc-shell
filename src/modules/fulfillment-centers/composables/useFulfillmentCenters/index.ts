import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  ListComposableArgs,
  ListBaseBladeScope,
  TOpenBladeArgs,
} from "@vc-shell/framework";
import {
  FulfillmentCenter,
  ISearchFulfillmentCentersQuery,
  SearchFulfillmentCentersQuery,
  VcmpSellerCatalogClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

export interface FulfillmentCentersScope extends ListBaseBladeScope<FulfillmentCenter> {}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useFulfillmentCenters = (args?: ListComposableArgs) => {
  const factory = useListFactory<FulfillmentCenter[], ISearchFulfillmentCentersQuery>({
    load: async (query) => {
      const sellerId = await GetSellerId();
      const command = new SearchFulfillmentCentersQuery({ ...(query || {}), sellerId: sellerId });

      return (await getApiClient()).searchFulfillmentCenters(command);
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();
  const route = useRoute();

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("FulfillmentCenterDetails"),
      ...args,
    });
  }

  const scope = ref<ListBaseBladeScope>({
    openDetailsBlade,
  });

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    loading,
    items,
    query,
    pagination,
    scope: computed(() => scope.value),
  };
};
