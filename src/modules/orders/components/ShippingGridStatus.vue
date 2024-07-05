<template>
  <div>
    <VcStatus
      v-for="(value, i) in statuses"
      v-bind="statusStyles[value]"
      :key="`${value}_${i}`"
      :class="[$attrs.class, { 'tw-mr-1': i < statuses.length - 1 }]"
      >{{ $t(`SHIPPING.STATUSES.${camelToSnake(value).toUpperCase()}`) }}</VcStatus
    >
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";
import { camelToSnake } from "@vc-shell/framework";
import { IOrderShipment } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: IOrderShipment;
  };
}

const props = withDefaults(defineProps<Props>(), {
  context: () => ({
    item: {
      status: "",
    },
  }),
});

const { context } = toRefs(props);

const itemStatus = computed(() => context.value?.item?.status);

const statusStyles: Record<string, Record<string, unknown>> = {
  Cancelled: {
    outline: true,
    variant: "warning",
  },
  New: {
    outline: true,
    variant: "info-dark",
  },
  PickPack: {
    outline: true,
    variant: "info",
  },
  ReadyToSend: {
    outline: false,
    variant: "danger",
  },
  Send: {
    outline: true,
    variant: "success",
  },
};

const statuses = computed(() =>
  itemStatus.value?.split(",").map((item) => {
    return item.trim();
  }),
) as unknown as (keyof typeof statusStyles)[];
</script>
