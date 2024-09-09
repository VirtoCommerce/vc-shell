<template>
  <div></div>
  <div class="tw-flex tw-flex-row">
    <component
      :is="context.header"
      class="tw-flex-auto"
    />
    <div class="tw-flex tw-flex-row tw-gap-2 tw-py-4 tw-pr-4">
      <VcTooltip placement="bottom">
        <VcButton
          class="products-header__button"
          icon="fas fa-list"
          icon-size="l"
          text
          :selected="!unref(bladeContext.scope?.isCatalogView)"
          :disabled="!unref(bladeContext.scope?.isCatalogView)"
          @click="bladeContext.scope?.setView(false)"
        ></VcButton>
        <template #tooltip>Products View</template>
      </VcTooltip>
      <VcTooltip placement="bottom">
        <VcButton
          class="products-header__button"
          icon="fas fa-stream"
          icon-size="l"
          text
          :selected="unref(bladeContext.scope?.isCatalogView)"
          :disabled="unref(bladeContext.scope?.isCatalogView)"
          @click="bladeContext.scope?.setView(true)"
        ></VcButton>
        <template #tooltip>Category View</template>
      </VcTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Component, unref } from "vue";
import { ListBladeContext } from "@vc-shell/framework";
import { ISearchProductsQuery, SellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ListEntryBase } from "@vcmp-vendor-portal/api/catalog";
import { type ProductListScope } from "../composables";

export interface Props {
  context: {
    header: Component;
  };
  bladeContext: ListBladeContext<SellerProduct[] | ListEntryBase[], ISearchProductsQuery, ProductListScope>;
}

defineProps<Props>();
</script>

<style lang="scss">
.products-header__button {
  width: 38px;
  height: 38px;

  &:disabled {
    .vc-icon {
      color: #d2d4d7;
    }
  }
}
</style>
