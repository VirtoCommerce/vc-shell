import {
  useApiClient,
  useBladeNavigation,
  useListFactory,
  ListComposableArgs,
  ListBaseBladeScope,
  TOpenBladeArgs,
  UseList,
} from "@vc-shell/framework";
import {
  CustomerReview,
  ISearchCustomerReviewsQuery,
  SearchCustomerReviewsQuery,
  VcmpSellerRatingAndReviewsClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

export interface ReviewsListScope extends ListBaseBladeScope<CustomerReview> {}

const { getApiClient } = useApiClient(VcmpSellerRatingAndReviewsClient);

export const useReviews = (
  args: ListComposableArgs,
): UseList<CustomerReview[], ISearchCustomerReviewsQuery, ReviewsListScope> => {
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

  async function openDetailsBlade(args?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("ReviewDetails"),
      ...args,
    });
  }

  const scope = ref<ReviewsListScope>({
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
