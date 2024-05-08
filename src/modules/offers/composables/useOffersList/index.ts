import {
  useApiClient,
  useBladeNavigation,
  UseList,
  DynamicBladeList,
  useListFactory,
  ListBaseBladeScope,
  TOpenBladeArgs,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  SearchOffersQuery,
  Offer,
  ISearchOffersQuery,
  BulkOffersDeleteCommand,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, ref, onBeforeMount } from "vue";
import { useMarketplaceSettings } from "../../../settings";
import { useRoute } from "vue-router";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OffersListScope extends ListBaseBladeScope {}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

export const useOffersList = (args: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: InstanceType<typeof DynamicBladeList>["$props"] & { options: { sellerProduct: any } };
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}): UseList<Offer[], ISearchOffersQuery, OffersListScope> => {
  const factory = useListFactory<Offer[], ISearchOffersQuery>({
    load: async (query) => {
      const sellerId = await GetSellerId();
      const offersQuery = new SearchOffersQuery({ ...(query || {}), sellerId: sellerId });
      return (await getApiClient()).searchOffers(offersQuery);
    },
    remove: async (query, customQuery) => {
      const command = new BulkOffersDeleteCommand({
        query: new SearchOffersQuery(query),
        offerIds: customQuery.ids ?? [],
        all: customQuery.allSelected,
      });

      if (customQuery.allSelected) {
        command.offerIds = undefined;
      }
      return (await getApiClient()).bulkDeleteOffers(command);
    },
  });

  const { load, remove, items, query, loading, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();
  const { settingUseDefaultOffer, loadSettings } = useMarketplaceSettings();
  const route = useRoute();

  async function openDetailsBlade(data?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("Offer"),
      options: {
        sellerProduct: args.props?.options?.sellerProduct,
      },
      ...data,
    });
  }

  function needShowIsDefault(): boolean {
    return settingUseDefaultOffer.value;
  }

  const scope = ref<OffersListScope>({
    openDetailsBlade,
    needShowIsDefault,
  });

  onBeforeMount(async () => {
    if (
      args &&
      args.props &&
      "options" in args.props &&
      args.props.options &&
      "sellerProduct" in args.props.options &&
      args.props.options?.sellerProduct
    )
      query.value.sellerProductId = args.props.options?.sellerProduct["id"];
    await loadSettings();
  });

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    remove,
    items,
    query,
    loading,
    pagination,
    scope: computed(() => scope.value),
  };
};
