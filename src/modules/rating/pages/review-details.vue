<template>
  <VcBlade
    v-loading="false"
    :title="title"
    width="30%"
    :expanded="expanded"
    :closable="closable"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <template #actions>
      <Status :review-status="customerReview.reviewStatus"></Status>
    </template>
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol size="2">
            <div class="tw-p-3">
              <VcLabel class="tw-mb-2">
                {{ $t("RATING.PAGES.REVIEW_DETAILS.FORM.CREATEDBY.LABEL") }}
              </VcLabel>
              {{ customerReview.createdBy }}
            </div>
          </VcCol>
          <VcCol size="3">
            <div class="tw-p-3">
              <VcLabel class="tw-mb-2">
                {{ $t("RATING.PAGES.REVIEW_DETAILS.FORM.CREATEDDATE.LABEL") }}
              </VcLabel>
              {{ createdDate }}
            </div>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <div class="tw-p-3">
              <VcLabel class="tw-mb-2">
                {{ $t("RATING.PAGES.REVIEW_DETAILS.FORM.TITLE.LABEL") }}
              </VcLabel>
              <template v-if="customerReview.title">
                {{ customerReview.title }}
              </template>
              <template v-else>
                {{ $t("RATING.PAGES.REVIEW_DETAILS.FORM.TITLE.PLACEHOLDER") }}
              </template>
            </div>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol size="2">
            <VcRating
              v-if="customerReview.rating"
              class="tw-p-3"
              :label="$t('RATING.PAGES.REVIEW_DETAILS.FORM.RATING.LABEL')"
              :placeholder="$t('RATING.PAGES.REVIEW_DETAILS.FORM.RATING.PLACEHOLDER')"
              :rating="customerReview.rating"
            >
            </VcRating>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <VcTextarea
              v-model="customerReview.review"
              class="tw-p-3"
              :label="$t('RATING.PAGES.REVIEW_DETAILS.FORM.REVIEW.LABEL')"
              :placeholder="$t('RATING.PAGES.REVIEW_DETAILS.FORM.REVIEW.PLACEHOLDER')"
              name="name"
              disabled
            >
            </VcTextarea>
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import moment from "moment";
import { computed, onMounted } from "vue";
import { CustomerReview } from "vcmp-vendor-portal-api/marketplacevendor";
import { Status } from "../components";
import { useReviews } from "../composables";
import { useI18n } from "vue-i18n";

// Page

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    review: CustomerReview;
  };
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

onMounted(async () => {
  if (props.param && props.options.review) {
    handleCustomerReviewItem(props.options.review);
  } else {
    handleCustomerReviewItem(customerReview.value);
  }
});

const { t } = useI18n({ useScope: "global" });
const locale = window.navigator.language;

// Data

const { customerReview, handleReview: handleCustomerReviewItem } = useReviews();

// Blade
const title = t("RATING.PAGES.REVIEW_DETAILS.TITLE");

const createdDate = computed(() => {
  const date = new Date(customerReview.value?.createdDate);
  return moment(date).locale(locale).format("L LT");
});
</script>
