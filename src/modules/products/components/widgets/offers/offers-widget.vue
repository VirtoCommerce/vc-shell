<template>
  <VcWidget
    v-loading="loading"
    :value="count"
    :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.OFFERS')"
    icon="fas fa-shapes"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, useApiClient, useAsync, useBladeNavigation } from "@vc-shell/framework";
import { UnwrapNestedRefs, onMounted, ref } from "vue";
import {
  VcmpSellerCatalogClient,
  ISearchOffersQuery,
  SearchOffersQuery,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { useProductDetails } from "../../../composables/useProductDetails";

interface Props {
  modelValue: UnwrapNestedRefs<ReturnType<typeof useProductDetails>>;
}

const props = defineProps<Props>();

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);
const client = getApiClient();

const { openBlade, resolveBladeByName } = useBladeNavigation();

const widgetOpened = ref(false);
const count = ref(0);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("Offers"),
      options: {
        sellerProduct: props.modelValue?.item,
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

const { loading, action: getCount } = useAsync<ISearchOffersQuery, number | undefined>(async (query) => {
  return (await client).searchOffers(new SearchOffersQuery(query)).then((res) => res.totalCount);
});

async function populateCounter() {
  count.value =
    (await getCount({
      take: 0,
      sellerProductId: props.modelValue?.item?.id,
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
