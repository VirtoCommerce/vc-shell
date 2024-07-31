<template>
  <VcWidget
    :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.ASSOCIATIONS')"
    icon="fas fa-link"
    :value="count"
    @click="clickHandler"
  ></VcWidget>
</template>

<script lang="ts" setup>
import { UnwrapNestedRefs, computed, ref } from "vue";
import { useProductDetails } from "../../../composables/useProductDetails";
import { useBladeNavigation } from "@vc-shell/framework";

interface Props {
  modelValue: UnwrapNestedRefs<ReturnType<typeof useProductDetails>>;
}

const props = defineProps<Props>();

const { openBlade, resolveBladeByName } = useBladeNavigation();

const widgetOpened = ref(false);
const modelValue = ref(props.modelValue);
const count = computed(() => modelValue.value?.item?.productData?.associations?.length || 0);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("Associations"),
      param: props.modelValue?.item?.stagedProductDataId,
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
