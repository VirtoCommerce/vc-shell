<template>
  <div class="tw-flex tw-items-center tw-py-2 tw-truncate">
    <VcImage
      class="tw-shrink-0"
      size="xs"
      :src="context.opt.imgSrc"
      :bordered="true"
      background="contain"
    ></VcImage>
    <div class="tw-grow tw-basis-0 tw-ml-4 tw-truncate">
      <div class="tw-truncate">
        {{ context.opt.name }}
      </div>
      <VcHint class="tw-truncate tw-mt-1">
        {{ $t("OFFERS.PAGES.DETAILS.FIELDS.CODE") }}:
        {{ context.opt.gtin }}
      </VcHint>
      <div
        v-if="context.opt.sellerProductId && slotName === 'selected-item'"
        class="vc-link tw-mt-1"
        @click.stop="showProductDetails(context.opt.sellerProductId)"
      >
        {{ $t("OFFERS.PAGES.DETAILS.MORE_INFO") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";

defineProps<{
  context: {
    opt: { imgSrc: string; name: string; gtin: string; sellerProductId: string };
  };
  slotName: string;
}>();

const { openBlade, resolveBladeByName } = useBladeNavigation();

async function showProductDetails(id: string) {
  openBlade({
    blade: resolveBladeByName("Product"),
    param: id,
  });
}
</script>
