<template>
  <div class="tw-flex">
    <VcStatus v-bind="statusStyle(context.item.status as string)">
      {{ context.item.status }}
    </VcStatus>
  </div>
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
    variant: "info" | "warning" | "danger" | "success" | "light-danger" | "info-dark" | "primary";
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
      result.outline = true;
      result.variant = "warning";
      break;
    case "Pending":
      result.outline = false;
      result.variant = "warning";
      break;
    case "Confirmed":
      result.outline = true;
      result.variant = "success";
      break;
    case "Packaged":
      result.outline = true;
      result.variant = "primary";
      break;
    case "Cancelled":
      result.outline = true;
      result.variant = "danger";
      break;
    case "Shipped":
      result.outline = false;
      result.variant = "success";
  }
  return result;
};
</script>

<style lang="scss" scoped></style>
