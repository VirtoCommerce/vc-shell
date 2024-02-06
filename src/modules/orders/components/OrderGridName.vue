<template>
  <div class="tw-flex tw-flex-col">
    <div>{{ context.item.name }}</div>
    <VcHint class="tw-mt-1">{{ $t("ORDERS.PAGES.DETAILS.FORM.ITEMS_LIST.SKU") }}: {{ context.item.sku }}</VcHint>
  </div>
</template>

<script setup lang="ts">
import { Offer } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: Offer;
  };
}

defineProps<Props>();
</script>
