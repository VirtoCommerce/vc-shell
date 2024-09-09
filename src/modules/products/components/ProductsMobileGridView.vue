<template>
  <div class="tw-p-3 tw-flex tw-flex-nowrap">
    <ProductImage :context="context" />
    <div class="tw-grow tw-basis-0 tw-ml-3 tw-truncate">
      <div class="tw-font-bold tw-text-lg tw-truncate">
        {{ context.item.name }}
      </div>

      <template v-if="context.item.type !== 'category'">
        <VcHint class="tw-mt-1">{{ context.item.path }}</VcHint>

        <div class="tw-mt-2 tw-mb-3">
          <MpProductStatus
            class="tw-mt-3"
            :context="context"
          />
        </div>

        <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
          <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
            <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.EAN_GTIN") }}</VcHint>
            <div class="tw-truncate tw-mt-1">
              {{ context.item.productData && context.item.productData.gtin }}
            </div>
          </div>
          <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
            <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
            <div class="tw-truncate tw-mt-1">
              {{ context.item.createdDate && moment(context.item.createdDate).fromNow() }}
            </div>
          </div>
          <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
            <div class="tw-flex tw-flex-col tw-items-center">
              <VcHint>{{ $t("PRODUCTS.PAGES.LIST.MOBILE.PUBLISHED") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                <VcStatusIcon :status="context.item && context.item.isPublished"></VcStatusIcon>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ISellerProduct } from "@vcmp-vendor-portal/api/marketplacevendor";
import moment from "moment";
import MpProductStatus from "./MpProductStatus.vue";
import ProductImage from "./ProductImage.vue";
import { IListEntryBase } from "@vcmp-vendor-portal/api/catalog";

export interface Props {
  context: {
    item: ISellerProduct & IListEntryBase;
  };
}

defineProps<Props>();
</script>
