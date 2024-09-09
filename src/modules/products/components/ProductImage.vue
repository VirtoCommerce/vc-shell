<template>
  <div class="tw-flex tw-flex-col">
    <template v-if="context.item.type !== 'category'">
      <VcImage
        :bordered="true"
        size="s"
        aspect="1x1"
        :src="context.item.imgSrc"
        background="contain"
      />
    </template>
    <template v-else>
      <VcIcon
        icon="fas fa-folder"
        size="xxl"
        class="tw-text-[#83a3be]"
      ></VcIcon>
    </template>
  </div>
</template>

<script setup lang="ts">
import { IListEntryBase } from "@vcmp-vendor-portal/api/catalog";
import { ISellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";

export interface Props {
  context: {
    item: ISellerProduct & IListEntryBase;
  };
}

defineProps<Props>();
</script>
