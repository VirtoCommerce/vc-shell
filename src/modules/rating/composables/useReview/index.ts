import {
  useApiClient,
  useDetailsFactory,
  DetailsComposableArgs,
  DetailsBaseBladeScope,
  UseDetails,
  useLanguages,
} from "@vc-shell/framework";
import {
  SearchCustomerReviewsQuery,
  SellerUser,
  VcmpSellerRatingAndReviewsClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import moment from "moment";
import { ComputedRef, Ref, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

export interface ReviewDetailsScope extends DetailsBaseBladeScope {
  createdDate: ComputedRef<string>;
  title: ComputedRef<string>;
  // disableReviewTextarea: boolean;
}

const { getApiClient } = useApiClient(VcmpSellerRatingAndReviewsClient);

export const useReview = (args: DetailsComposableArgs): UseDetails<SellerUser, ReviewDetailsScope> => {
  const factory = useDetailsFactory({
    load: async (item) => {
      if (item?.id) {
        const sellerId = await GetSellerId();
        const command = new SearchCustomerReviewsQuery({ sellerId: sellerId, objectIds: [item.id] });

        return (await getApiClient())
          .searchCustomerReviews(command)
          .then((res) => res.results?.find((x) => x.id === item.id));
      }
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();
  const { currentLocale } = useLanguages();
  const { t } = useI18n({ useScope: "global" });
  const route = useRoute();

  const scope: ReviewDetailsScope = {
    createdDate: computed(() => {
      const date = new Date(item.value?.createdDate ?? "");
      return moment(date).locale(currentLocale.value).format("L LT");
    }),
    title: computed(() => item.value?.title ?? t("RATING.PAGES.DETAILS.FORM.TITLE.PLACEHOLDER")),
    disableReviewTextarea: true,
  };

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    scope,
    bladeTitle: computed(() => t("RATING.PAGES.DETAILS.TITLE") as string),
  };
};
