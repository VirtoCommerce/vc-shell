<template>
  <div>
    <VcStatus
      v-for="(value, i) in statuses"
      :key="`${value}_${i}`"
      outline
      variant="info"
      :class="[$attrs.class, { 'tw-mr-1': i < statuses.length - 1 }]"
      >{{ $t(`SHIPPING.STATUSES.${value.replace(/ /g, "_").toUpperCase()}`) }}</VcStatus
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

const statuses = computed(() =>
  itemStatus.value?.split(",").map((item) => {
    return item.trim();
  }),
) as unknown as string[];
</script>
