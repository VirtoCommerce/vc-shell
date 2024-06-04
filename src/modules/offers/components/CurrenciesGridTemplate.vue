<template>
  <div>
    <VcSelect
      v-if="!bladeContext.scope.disabled"
      :options="bladeContext.scope.currencies"
      option-value="value"
      option-label="title"
      :model-value="context.item.currency"
      :clearable="false"
      @update:model-value="updateModel"
    ></VcSelect>
    <div v-else>{{ context.item.currency }}</div>
  </div>
</template>

<script lang="ts" setup>
import { OfferPrice, OfferPriceList } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ITableColumns } from "@vc-shell/framework";
import { SpecialPricesDetailsScope } from "../composables/useSpecialPriceDetails";
import { UnwrapNestedRefs } from "vue";

export interface Props {
  context: {
    item: OfferPrice;
    cell: ITableColumns;
  };
  bladeContext: {
    item: OfferPriceList;
    scope: UnwrapNestedRefs<SpecialPricesDetailsScope>;
  };
  index: number;
  onEditComplete: (data: unknown) => void;
}

const props = defineProps<Props>();

function updateModel(value: unknown) {
  props.onEditComplete(value);
}
</script>

<style lang="scss" scoped></style>
