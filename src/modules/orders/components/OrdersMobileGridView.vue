<template>
  <div class="tw-p-3">
    <div class="tw-w-full tw-flex tw-justify-evenly">
      <div class="tw-grow tw-basis-0">
        <div class="tw-font-bold tw-text-lg">
          {{ context.item.number }}
        </div>
        <VcHint class="tw-mt-1">{{ context.item.customerName }}</VcHint>
      </div>
      <div>
        <VcStatus v-bind="statusStyle(context.item.status as string)">
          {{ context.item.status }}
        </VcStatus>
      </div>
    </div>
    <div>
      <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL") }}</VcHint>
          <div class="tw-truncate tw-mt-1">{{ context.item.total }} {{ context.item.currency }}</div>
        </div>
        <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
          <VcHint>{{ $t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED") }}</VcHint>
          <div class="tw-truncate tw-mt-1">
            {{ context.item.createdDate && moment(context.item.createdDate).fromNow() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CustomerOrder } from "@vcmp-vendor-portal/api/orders";
import moment from "moment";

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
