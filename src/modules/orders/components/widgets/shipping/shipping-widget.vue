<template>
  <VcWidget
    :value="count"
    :title="$t('ORDERS.PAGES.DETAILS.WIDGETS.SHIPPING')"
    icon="fas fa-truck"
    @click="clickHandler"
  ></VcWidget>
</template>

<script lang="ts" setup>
import { UnwrapNestedRefs, computed, ref } from "vue";
import { useOrder } from "../../../composables/useOrder";
import { useBladeNavigation } from "@vc-shell/framework";

interface Props {
  modelValue: UnwrapNestedRefs<ReturnType<typeof useOrder>>;
}

const props = defineProps<Props>();

const { openBlade, resolveBladeByName } = useBladeNavigation();

const widgetOpened = ref(false);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("Shipping"),
      options: {
        items: props.modelValue?.item?.items,
        orderId: props.modelValue?.item?.id,
        shipments: props.modelValue?.item?.shipments,
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

const count = computed(() => props.modelValue?.item?.shipments?.length ?? 0);
</script>

<style lang="scss" scoped></style>
