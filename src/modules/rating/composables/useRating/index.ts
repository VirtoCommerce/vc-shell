import { useLogger, useUser } from "@vc-shell/framework";
import { VcmpSellerRatingAndReviewsClient } from "../../../../api_client/marketplacevendor";
import { ref, Ref } from "vue";

interface IUseRating {
  readonly loading: Ref<boolean>;
  readonly rating: Ref<number>;
  readonly reviewCount: Ref<number>;
  getRating: () => void;
}

export default (): IUseRating => {
  const logger = useLogger();

  const loading = ref(false);
  const rating = ref<number>(undefined);
  const reviewCount = ref<number>(undefined);

  async function getApiClient() {
    const { getAccessToken } = useUser();
    const client = new VcmpSellerRatingAndReviewsClient();
    client.setAuthToken(await getAccessToken());
    return client;
  }

  async function getRating() {
    const client = await getApiClient();

    try {
      loading.value = true;
      const currentSellerRating = await client.getCurrentSellerRating();
      rating.value = currentSellerRating?.rating;
      reviewCount.value = currentSellerRating?.reviewCount;
    } catch (e) {
      logger.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    rating,
    reviewCount,
    getRating,
  };
};
