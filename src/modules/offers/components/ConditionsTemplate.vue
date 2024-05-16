<template>
  <div>{{ context.item.memberIds?.join(", ") }}</div>
</template>

<script lang="ts" setup>
import { OfferPriceList } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: OfferPriceList;
  };
}

defineProps<Props>();
</script>

<style lang="scss" scoped></style>
