import {
  useApiClient,
  useDetailsFactory,
  DynamicBladeForm,
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

export interface ReviewDetailsScope extends DetailsBaseBladeScope {
  createdDate: ComputedRef<string>;
  title: ComputedRef<string>;
  // disableReviewTextarea: boolean;
}

const { getApiClient } = useApiClient(VcmpSellerRatingAndReviewsClient);

export const useReview = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<SellerUser, ReviewDetailsScope> => {
  const factory = useDetailsFactory({
    load: async (item) => {
      if (item?.id) {
        const command = new SearchCustomerReviewsQuery({ objectIds: [item.id] });

        return (await getApiClient())
          .searchCustomerReviews(command)
          .then((res) => res.results?.find((x) => x.id === item.id));
      }
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();
  const { currentLocale } = useLanguages();
  const { t } = useI18n({ useScope: "global" });

  const scope = ref<ReviewDetailsScope>({
    createdDate: computed(() => {
      const date = new Date(item.value?.createdDate ?? "");
      return moment(date).locale(currentLocale.value).format("L LT");
    }),
    title: computed(() => item.value?.title ?? t("RATING.PAGES.DETAILS.FORM.TITLE.PLACEHOLDER")),
    disableReviewTextarea: true,
  });

  return {
    load,
    saveChanges,
    remove,
    loading,
    item,
    validationState,
    scope: computed(() => scope.value),
    bladeTitle: computed(() => t("RATING.PAGES.DETAILS.TITLE") as string),
  };
};
