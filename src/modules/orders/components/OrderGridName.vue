<template>
  <div class="tw-flex tw-flex-col tw-truncate">
    <div class="tw-truncate">{{ context.item.sku }}</div>
    <VcHint class="tw-mt-1 tw-truncate">{{ context.item.name }}</VcHint>
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
