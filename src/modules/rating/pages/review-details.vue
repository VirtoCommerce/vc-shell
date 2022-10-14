<template>
  <VcBlade
    :title="title"
    width="30%"
    v-loading="false"
    :expanded="expanded"
    :closable="closable"
    @close="$emit('page:close')"
  >
    <template v-slot:actions>
      <Status :review-status="customerReview.reviewStatus"></Status>
    </template>
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol size="2">
            <div class="p-3">
              <VcLabel class="mb-2">
                {{ $t("RATING.PAGES.REVIEW_DETAILS.FORM.CREATEDBY.LABEL") }}
              </VcLabel>
              {{ customerReview.createdBy }}
            </div>
          </VcCol>
          <VcCol size="3">
            <div class="p-3">
              <VcLabel class="mb-2">
                {{ $t("RATING.PAGES.REVIEW_DETAILS.FORM.CREATEDDATE.LABEL") }}
              </VcLabel>
              {{ createdDate }}
            </div>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <div class="p-3">
              <VcLabel class="mb-2">
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
              class="p-3"
              :label="$t('RATING.PAGES.REVIEW_DETAILS.FORM.RATING.LABEL')"
              :placeholder="
                $t('RATING.PAGES.REVIEW_DETAILS.FORM.RATING.PLACEHOLDER')
              "
              :rating="customerReview.rating"
            >
            </VcRating>
          </VcCol>
        </VcRow>
        <VcRow>
          <VcCol>
            <VcTextarea
              class="p-3"
              :label="$t('RATING.PAGES.REVIEW_DETAILS.FORM.REVIEW.LABEL')"
              :placeholder="
                $t('RATING.PAGES.REVIEW_DETAILS.FORM.REVIEW.PLACEHOLDER')
              "
              name="name"
              disabled
              v-model="customerReview.review"
            >
            </VcTextarea>
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { useI18n } from "@vc-shell/core";
import {
  VcBlade,
  VcCol,
  VcContainer,
  VcForm,
  VcLabel,
  VcTextarea,
  VcRating,
  VcRow,
  IPage,
} from "@vc-shell/ui";
import moment from "moment";
import { computed, onMounted } from "vue";
import { CustomerReview } from "../../../api_client/marketplacevendor";
import { Status } from "../components";
import { useReviews } from "../composables";

// Page

export interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options: {
    review?: CustomerReview;
  };
}

export interface Emits {
  (event: "page:close"): void;
  (event: "page:open", page: IPage): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  options: () => ({}),
});

defineEmits<Emits>();

onMounted(async () => {
  if (props.param && props.options.review) {
    handleCustomerReviewItem(props.options.review);
  } else {
    handleCustomerReviewItem(customerReview.value);
  }
});

const { t } = useI18n();
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
