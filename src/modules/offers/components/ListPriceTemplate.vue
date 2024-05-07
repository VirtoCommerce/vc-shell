<template>
  <div>
    {{ highestPrice ? intlMoney(highestPrice) : null }}
  </div>
</template>

<script lang="ts" setup>
import { Offer, OfferPrice } from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed } from "vue";

export interface Props {
  context: {
    item: Offer;
  };
}

const props = defineProps<Props>();
const locale = window.navigator.language;

const highestPrice = computed(() => {
  if (!props.context.item.prices || props.context.item.prices.length === 0) {
    return null;
  }

  return props.context.item.prices.reduce((prev, current) => {
    return prev.listPrice > current.listPrice ? prev : current;
  });
});

function intlMoney(value: OfferPrice | null) {
  if (!value) return null;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency || "USD",
  }).format(value.listPrice);
}
</script>

<style lang="scss" scoped></style>
