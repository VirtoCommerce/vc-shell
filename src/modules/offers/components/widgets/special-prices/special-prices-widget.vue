<template>
  <VcWidget
    value="11"
    icon="fas fa-tags"
    :title="$t('SPECIAL_PRICES.PAGES.DETAILS.WIDGETS.SPECIAL_PRICES')"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script lang="ts" setup>
import { VcWidget, useBladeNavigation, usePopup, useAssets, useUser } from "@vc-shell/framework";
import { useSpecialPriceDetails } from "../../../composables";
import { UnwrapNestedRefs, ref } from "vue";

const props = defineProps<{
  // TODO Add to documentation
  modelValue: UnwrapNestedRefs<ReturnType<typeof useSpecialPriceDetails>>;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", context: UnwrapNestedRefs<ReturnType<typeof useSpecialPriceDetails>>): void;
}>();

const { openBlade, resolveBladeByName } = useBladeNavigation();
const widgetOpened = ref(false);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("SpecialPricesList"),
      options: {
        priceLists: props.modelValue?.item?.priceLists,
      },
      onOpen() {
        widgetOpened.value = true;
      },
      onClose() {
        widgetOpened.value = false;
      },
    });
  }
}
</script>

<style lang="scss" scoped></style>
