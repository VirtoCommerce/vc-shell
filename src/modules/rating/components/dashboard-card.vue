<template>
  <VcCard
    v-if="$isDesktop.value"
    :header="$t('RATING.DASHBOARD_CARD.TITLE')"
    icon="fas fa-star"
  >
    <template #actions>
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
      :page-size="2"
      @item-click="onItemClick"
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
import { VcButton, VcCard, useBladeNavigation } from "@vc-shell/framework";
import { CustomerReview } from "@vcmp-vendor-portal/api/marketplacevendor";
import { Rating, ReviewTable } from "../components";
import { ReviewList } from "../pages";

// Component

const { openBlade, resolveBladeByName } = useBladeNavigation();

// Card

const openAllReviews = () => {
  openBlade(
    {
      blade: ReviewList,
    },
    true,
  );
};

const onItemClick = async (item: CustomerReview) => {
  await openBlade(
    {
      blade: resolveBladeByName("Reviews"),
      param: item.id,
      options: {
        review: item,
      },
    },
    true,
  );
};
</script>
