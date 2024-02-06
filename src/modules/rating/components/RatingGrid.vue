<template>
  <VcRating :model-value="context?.item?.rating ?? 0"></VcRating>
</template>

<script lang="ts" setup>
import { CustomerReview } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: CustomerReview;
  };
}

defineProps<Props>();
</script>

<style lang="scss" scoped></style>
