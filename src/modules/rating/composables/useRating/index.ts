import { VcmpSellerRatingAndReviewsClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ref, Ref } from "vue";

interface IUseRating {
  readonly loading: Ref<boolean>;
  readonly rating: Ref<number>;
  readonly reviewCount: Ref<number>;
  getRating: () => void;
}

export default (): IUseRating => {
  const loading = ref(false);
  const rating = ref() as Ref<number>;
  const reviewCount = ref<number>() as Ref<number>;

  async function getApiClient() {
    const client = new VcmpSellerRatingAndReviewsClient();
    return client;
  }

  async function getRating() {
    const client = await getApiClient();

    try {
      loading.value = true;
      const currentSellerRating = await client.getCurrentSellerRating();
      rating.value = currentSellerRating?.rating ?? 0;
      reviewCount.value = currentSellerRating?.reviewCount ?? 0;
    } catch (e) {
      console.error(e);
      throw e;
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
