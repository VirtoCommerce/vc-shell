<template>
  <div class="tw-flex tw-gap-2">
    <VcStatus
      v-if="context?.item?.isPublished"
      :outline="false"
      variant="success"
      >{{ $t("PRODUCTS.STATUSES.PUBLISHED") }}</VcStatus
    >
    <MpProductStatus :context="context" />
  </div>
</template>

<script lang="ts" setup>
import { ISellerProduct, SellerProductStatus2 } from "@vcmp-vendor-portal/api/marketplacevendor";
import MpProductStatus from "./MpProductStatus.vue";

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
</script>
