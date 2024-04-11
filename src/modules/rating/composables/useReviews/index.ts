import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  DynamicBladeList,
  ListBaseBladeScope,
} from "@vc-shell/framework";
import {
  CustomerReview,
  ISearchCustomerReviewsQuery,
  SearchCustomerReviewsQuery,
  SearchSellerUsersQuery,
  VcmpSellerRatingAndReviewsClient,
  VcmpSellerSecurityClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const { getApiClient } = useApiClient(VcmpSellerRatingAndReviewsClient);

export const useReviews = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}) => {
  const factory = useListFactory<CustomerReview[], ISearchCustomerReviewsQuery>({
    load: async (query) => {
      const sellerId = await GetSellerId();
      const command = new SearchCustomerReviewsQuery({ ...(query || {}), sellerId: sellerId });

      return (await getApiClient()).searchCustomerReviews(command);
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();
  const route = useRoute();

  async function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
      blade: resolveBladeByName("ReviewDetails"),
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
