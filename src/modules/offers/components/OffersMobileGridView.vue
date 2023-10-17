<template>
  <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
    <div class="tw-w-full tw-flex tw-justify-evenly">
      <VcImage
        class="tw-shrink-0"
        aspect="1x1"
        size="s"
        :bordered="true"
        :src="context.item.imgSrc"
      ></VcImage>
      <div class="tw-grow tw-basis-0 tw-ml-3">
        <div class="tw-font-bold tw-text-lg">
          {{ context.item.name }}
        </div>
      </div>
    </div>
    <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
      <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("OFFERS.PAGES.LIST.MOBILE.SKU") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.sku }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("OFFERS.PAGES.LIST.MOBILE.QUANTITY") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.inStockQuantity }}
        </div>
      </div>
    </div>
    <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
      <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("OFFERS.PAGES.LIST.MOBILE.LIST_PRICE") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.listPrice && context.item.listPrice.toFixed(2) }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("OFFERS.PAGES.LIST.MOBILE.SALE_PRICE") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ handleSalePrice(context.item.salePrice) }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("OFFERS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.createdDate && moment(context.item.createdDate).fromNow() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IOffer } from "vc-vendor-portal-api/marketplacevendor";
import moment from "moment";

export interface Props {
  context: {
    item: IOffer & {
      listPrice: number;
      salePrice: number;
    };
  };
}

defineProps<Props>();

function handleSalePrice(price: number | undefined) {
  if (!price) {
    return "N/A";
  } else {
    return price.toFixed(2);
  }
}
</script>
