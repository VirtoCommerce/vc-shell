<template>
  <VcWidget
    :value="modelValue.item?.priceLists?.length ?? 0"
    icon="fas fa-tags"
    :title="$t('SPECIAL_PRICES.PAGES.DETAILS.WIDGETS.SPECIAL_PRICES')"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script lang="ts" setup>
import { VcWidget, useBladeNavigation } from "@vc-shell/framework";
import { useOfferDetails } from "../../../composables";
import { UnwrapNestedRefs, ref } from "vue";

const props = defineProps<{
  // TODO Add to documentation
  modelValue: UnwrapNestedRefs<ReturnType<typeof useOfferDetails>>;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", context: UnwrapNestedRefs<ReturnType<typeof useOfferDetails>>): void;
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
