<template>
  <VcWidget
    v-loading:500="shipmentsLoading"
    :value="count"
    :title="$t('ORDERS.PAGES.DETAILS.WIDGETS.SHIPPING')"
    icon="fas fa-truck"
    @click="clickHandler"
  ></VcWidget>
</template>

<script lang="ts" setup>
import { UnwrapNestedRefs, onMounted, ref } from "vue";
import { useOrder } from "../../../composables/useOrder";
import { useApiClient, useAsync, useBladeNavigation } from "@vc-shell/framework";
import {
  ISearchShipmentsQuery,
  SearchShipmentsQuery,
  VcmpSellerOrdersClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";

interface Props {
  modelValue: UnwrapNestedRefs<ReturnType<typeof useOrder>>;
}

const props = defineProps<Props>();

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

const widgetOpened = ref(false);
const count = ref(0);

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

const { loading: shipmentsLoading, action: getCount } = useAsync<ISearchShipmentsQuery, number | undefined>(
  async (query) => {
    return await (await getApiClient()).searchShipments(new SearchShipmentsQuery(query)).then((res) => res.totalCount);
  },
);

async function populateCounter() {
  count.value =
    (await getCount({
      take: 0,
      orderId: props.modelValue?.item?.id,
    })) ?? 0;
}

onMounted(async () => {
  if (props.modelValue?.item?.id) {
    await populateCounter();
  }
});

defineExpose({
  updateActiveWidgetCount: populateCounter,
});
</script>

<style lang="scss" scoped></style>
