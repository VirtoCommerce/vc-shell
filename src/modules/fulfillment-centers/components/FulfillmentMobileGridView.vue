<template>
  <div class="tw-border-b tw-border-solid tw-border-b-[--base-border-color] tw-py-3 tw-px-4">
    <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
      <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
        <VcHint>{{ $t("FULFILLMENT_CENTERS.PAGES.LIST.TABLE.HEADER.NAME") }}</VcHint>
        <div class="tw-truncate tw-mt-1">
          {{ context.item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FulfillmentCenter } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: FulfillmentCenter;
  };
}

defineProps<Props>();
</script>
