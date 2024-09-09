<template>
  <div class="tw-flex tw-flex-col">
    <div class="tw-truncate">
      {{ context.item.name }}
    </div>
    <VcHint
      v-if="context.item.type !== 'category'"
      class="tw-truncate tw-mt-1"
    >
      {{ context.item.path }}
    </VcHint>
  </div>
</template>

<script setup lang="ts">
import { ListEntryBase } from "@vcmp-vendor-portal/api/catalog";
import { ISellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: ISellerProduct & ListEntryBase;
  };
}

defineProps<Props>();
</script>
