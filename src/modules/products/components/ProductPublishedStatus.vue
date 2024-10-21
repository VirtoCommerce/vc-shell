<template>
  <div class="tw-flex tw-gap-2 tw-w-full tw-grow tw-basis-0">
    <VcStatus
      v-if="context?.item?.isPublished"
      :outline="false"
      variant="success"
      >{{ $t("PRODUCTS.STATUSES.PUBLISHED") }}</VcStatus
    >
    <MpProductStatus
      :context="context"
      class="tw-w-full tw-overflow-hidden"
      :class="{ 'tw-max-w-[50%] tw-ml-auto': !context?.item?.isPublished }"
    />
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
