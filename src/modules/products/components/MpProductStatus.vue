<template>
  <div class="tw-flex">
    <VcStatus
      v-for="(value, i) in statuses"
      v-bind="statusStyles[value]"
      :key="`${value}_${i}`"
      :class="[$attrs.class, { 'tw-mr-1': i < statuses.length - 1 }]"
      >{{ $t(`PRODUCTS.STATUSES.${camelToSnake(value).toUpperCase()}`) }}</VcStatus
    >
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";
import { camelToSnake } from "@vc-shell/framework";
import { ISellerProduct, SellerProductStatus2 } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: ISellerProduct;
  };
}

const props = withDefaults(defineProps<Props>(), {
  context: () => ({
    item: {
      status: SellerProductStatus2.None,
    },
  }),
});

const { context } = toRefs(props);

const itemStatus = computed(() => context.value?.item?.status);

const statusStyles: Record<keyof typeof SellerProductStatus2, Record<string, unknown>> = {
  RequiresChanges: {
    outline: true,
    variant: "danger",
  },
  Approved: {
    outline: true,
    variant: "success",
  },
  WaitForApproval: {
    outline: true,
    variant: "success",
  },
  Rejected: {
    outline: false,
    variant: "danger",
  },
  HasStagedChanges: {
    outline: true,
    variant: "warning",
  },
  Published: {
    outline: false,
    variant: "success",
  },
  None: {
    outline: true,
    variant: "info-dark",
  },
};

const statuses = computed(() =>
  itemStatus.value
    ?.split(",")
    .map((item) => {
      return item.trim();
    })
    .filter((x) => x !== "Published"),
) as unknown as (keyof typeof statusStyles)[];
</script>
