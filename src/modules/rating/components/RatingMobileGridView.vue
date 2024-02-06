<template>
  <div class="tw-p-3">
    <div class="tw-w-full tw-flex tw-justify-evenly">
      <div class="tw-grow tw-basis-0">
        <div class="tw-font-bold tw-text-lg">
          {{ context.item.title }}
        </div>
      </div>
      <div>
        <Status :review-status="context.item.reviewStatus"></Status>
      </div>
    </div>
    <div>
      <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("RATING.PAGES.LIST.TABLE.HEADER.RATING") }}</VcHint>
          <VcRating :model-value="context.item.rating ?? 0"></VcRating>
        </div>
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("RATING.PAGES.LIST.TABLE.HEADER.CREATEDDATE") }}</VcHint>
          <div class="tw-truncate tw-mt-1">
            {{ context.item.createdDate && moment(context.item.createdDate).fromNow() }}
          </div>
        </div>
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("RATING.PAGES.LIST.TABLE.HEADER.CREATEDBY") }}</VcHint>
          <div class="tw-truncate tw-mt-1">
            {{ context.item.createdBy }}
          </div>
        </div>
      </div>
      <div class="tw-mt-3 tw-w-full">
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("RATING.PAGES.LIST.TABLE.HEADER.REVIEW") }}</VcHint>
          <div class="tw-truncate tw-mt-1">{{ context.item.review }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CustomerReview } from "@vcmp-vendor-portal/api/marketplacevendor";
import moment from "moment";

export interface Props {
  context: {
    item: CustomerReview;
  };
}

defineProps<Props>();
</script>
