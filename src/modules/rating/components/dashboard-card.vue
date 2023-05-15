<template>
  <VcCard
    v-if="$isDesktop.value"
    :header="$t('RATING.DASHBOARD_CARD.TITLE')"
    icon="fas fa-star"
  >
    <template v-slot:actions>
      <div class="tw-flex tw-items-center">
        <div class="vc-card__title">
          <Rating
            class="tw-mr-5"
            :variant="'star-and-text'"
          ></Rating>
        </div>
        <vc-button
          small
          outline
          @click="openAllReviews()"
          >{{ $t("RATING.DASHBOARD_CARD.ALL_REVIEWS") }}</vc-button
        >
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
    class="tw-mb-4"
    :header="$t('RATING.DASHBOARD_CARD.TITLE')"
    icon="fas fa-star"
    @click="openAllReviews()"
  >
    <div class="tw-h-px tw-bg-[#e3e7ec]"></div>
    <div class="tw-my-4 dashboard-counters__value">
      <Rating :variant="'text'"></Rating>
    </div>
  </VcCard>
</template>

<script lang="ts" setup>
import { IBladeEvent, VcButton, VcCard } from "@vc-shell/framework";
import { CustomerReview } from "../../../api_client/marketplacevendor";
import { Rating, ReviewTable } from "../components";
import { ReviewList } from "../pages";
import { markRaw } from "vue";

// Component

export interface Props {
  openPage: (page: IBladeEvent) => void;
}

const props = defineProps<Props>();

// Card

const openAllReviews = () => {
  props.openPage({
    blade: ReviewList,
  });
};

const onItemClick = (item: CustomerReview, onSelect: () => void, onDeselect: () => void) => {
  props.openPage({
    blade: markRaw(ReviewList),
    param: item.id,
    options: {
      review: item,
    },
    onOpen: onSelect,
    onClose: onDeselect,
  });
};
</script>
