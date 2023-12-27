import {
  useApiClient,
  useBladeNavigation,
  UseList,
  DynamicBladeList,
  useListFactory,
  ListBaseBladeScope,
} from "@vc-shell/framework";
import {
  VcmpSellerCatalogClient,
  SearchOffersQuery,
  Offer,
  ISearchOffersQuery,
  BulkOffersDeleteCommand,
} from "@vc-app/api";
import { Ref, computed, onBeforeMount, ref, watch } from "vue";

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
    load: async (query) => (await getApiClient()).searchOffers(new SearchOffersQuery(query)),
    remove: async (query, customQuery) => {
      const command = new BulkOffersDeleteCommand({
        query: new SearchOffersQuery(query),
        offerIds: customQuery.ids,
        all: customQuery.allSelected,
      });

      if (customQuery.allSelected) {
        command.offerIds = null;
      }
      return (await getApiClient()).bulkDeleteOffers(command);
    },
  });

  const { load, remove, items, query, loading, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(data?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
      blade: resolveBladeByName("Offer"),
      options: {
        sellerProduct: args.props?.options?.sellerProduct,
      },
      ...data,
    });
  }

  const scope = ref<OffersListScope>({
    openDetailsBlade,
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
  });

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
