<template>
  <VcCard
    v-if="$isDesktop.value"
    :header="$t('RATING.DASHBOARD_CARD.TITLE')"
    icon="fas fa-star"
  >
    <template v-slot:actions>
      <div class="flex items-center">
        <div class="vc-card__title">
          <Rating class="mr-5" :variant="'star-and-text'"></Rating>
        </div>
        <vc-button small outline @click="openAllReviews()">{{
          $t("RATING.DASHBOARD_CARD.ALL_REVIEWS")
        }}</vc-button>
      </div>
    </template>
    <ReviewTable
      :expanded="false"
      :footer="false"
      :pageSize="2"
      @itemClick="onItemClick"
    ></ReviewTable>
  </VcCard>
  <VcCard
    v-else
    class="mb-4"
    :header="$t('RATING.DASHBOARD_CARD.TITLE')"
    icon="fas fa-star"
    @click="openAllReviews()"
  >
    <div class="h-px bg-[#e3e7ec]"></div>
    <div class="my-4 dashboard-counters__value">
      <Rating :variant="'text'"></Rating>
    </div>
  </VcCard>
</template>

<script lang="ts" setup>
import { IPage, VcButton, VcCard } from "@vc-shell/framework";
import { CustomerReview } from "../../../api_client/marketplacevendor";
import { Rating, ReviewTable } from "../components";
import { ReviewDetails, ReviewList } from "../pages";

// Component

export interface Props {
  openPage: (index: number, page: IPage) => void;
}

const props = defineProps<Props>();

// Card

const openAllReviews = () => {
  props.openPage(0, {
    component: ReviewList,
  });
};

const onItemClick = (
  item: CustomerReview,
  onSelect: () => void,
  onDeselect: () => void
) => {
  props.openPage(0, {
    component: ReviewList,
  });
  props.openPage(1, {
    component: ReviewDetails,
    param: item.id,
    componentOptions: {
      review: item,
    },
    onOpen: onSelect,
    onClose: onDeselect,
  });
};
</script>
