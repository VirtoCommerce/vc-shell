import { useAsync, useApiClient } from "@vc-shell/framework";
import { VcmpSellerRatingAndReviewsClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ref, Ref } from "vue";
import { useRoute } from "vue-router";

interface IUseRating {
  readonly loading: Ref<boolean>;
  readonly rating: Ref<number>;
  readonly reviewCount: Ref<number>;
  getRating: () => Promise<void>;
}

const { getApiClient } = useApiClient(VcmpSellerRatingAndReviewsClient);

export const useRating = (): IUseRating => {
  const rating = ref() as Ref<number>;
  const reviewCount = ref<number>() as Ref<number>;
  const route = useRoute();

  const { loading, action: getRating } = useAsync(async () => {
    const sellerId = await GetSellerId();
    const currentSellerRating = sellerId
      ? await (await getApiClient()).getSellerRatingById(sellerId)
      : await (await getApiClient()).getCurrentSellerRating();
    rating.value = currentSellerRating?.rating ?? 0;
    reviewCount.value = currentSellerRating?.reviewCount ?? 0;
  });

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    loading,
    rating,
    reviewCount,
    getRating,
  };
};
