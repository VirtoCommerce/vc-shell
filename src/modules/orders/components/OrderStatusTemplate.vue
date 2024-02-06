<template>
  <VcStatus v-bind="statusStyle(context.item.status as string)">
    {{ context.item.status }}
  </VcStatus>
</template>

<script lang="ts" setup>
import { CustomerOrder } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: CustomerOrder;
  };
}

defineProps<Props>();

const statusStyle = (status: string) => {
  const result: {
    outline: boolean;
    variant: "success" | "danger" | "info";
  } = {
    outline: true,
    variant: "info",
  };

  switch (status) {
    case "Published":
      result.outline = false;
      result.variant = "success";
      break;
    case "New":
      result.outline = false;
      result.variant = "success";
      break;
    case "Cancelled":
      result.outline = true;
      result.variant = "danger";
      break;
    case "Shipped":
      result.outline = true;
      result.variant = "success";
  }
  return result;
};
</script>

<style lang="scss" scoped></style>
