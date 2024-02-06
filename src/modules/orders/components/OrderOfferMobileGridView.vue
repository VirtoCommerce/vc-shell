<template>
  <div class="tw-py-3 tw-px-4">
    <div class="tw-w-full tw-flex tw-justify-evenly">
      <VcImage
        class="tw-shrink-0"
        aspect="1x1"
        size="s"
        :bordered="true"
        :src="context.item.imageUrl"
      ></VcImage>
      <div class="tw-grow tw-basis-0 tw-ml-3">
        <div class="tw-font-bold tw-text-lg">
          {{ context.item.name }}
        </div>
        <VcHint class="tw-mt-1">
          {{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.SKU") }}:
          {{ context.item.sku }}
        </VcHint>
      </div>
    </div>
    <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.QUANTITY") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.quantity }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.UNIT_PRICE") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.price && context.item.price.toFixed(2) }}
        </div>
      </div>
      <div class="tw-truncate tw-grow-[2] tw-basis-0">
        <VcHint>{{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.TOTAL") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.extendedPrice && context.item.extendedPrice.toFixed(2) }}
        </div>
      </div>
      <div
        v-if="context.item.feeDetails?.length"
        class="tw-truncate tw-grow-[2] tw-basis-0"
      >
        <VcHint>{{ $t("ORDERS.PAGES.EDIT.ITEMS_LIST.COMMISSION") }}</VcHint>

        <div class="tw-mt-1 tw-truncate">
          <div class="tw-truncate">
            {{ context.item.feeDetails[0].description }}
            <br /><span class="tw-truncate">
              {{ context.item.feeDetails[0].amount && context.item.feeDetails[0].amount.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { OrderLineItem } from "@vcmp-vendor-portal/api/orders";

export interface Props {
  context: {
    item: OrderLineItem;
  };
}

defineProps<Props>();
</script>

<style lang="scss" scoped></style>
