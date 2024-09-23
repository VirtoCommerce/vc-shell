<template>
  <div
    v-if="context.item.feeDetails?.length"
    class="tw-flex tw-flex-col"
  >
    <div>{{ context.item.feeDetails[0].description }}</div>
    <div>
      <span>{{ Math.trunc(Number(context.item.feeDetails[0].amount)) }}</span
      ><span class="tw-text-[color:var(--order-grid-fee-color)] tw-text-xs"
        >.{{ `${(Number(context.item.feeDetails[0].amount) * 100) % 100}`.padEnd(2, "0").slice(0, 2) }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { CustomerOrder } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: CustomerOrder;
  };
}

defineProps<Props>();
</script>

<style lang="scss">
:root {
  --order-grid-fee-color: var(--neutrals-400);
}
</style>
