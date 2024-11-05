<template>
  <VcWidget
    v-if="modelValue.item?.id"
    v-loading:500="loading"
    :value="count"
    :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.OFFERS')"
    icon="fas fa-shapes"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, useApiClient, useAsync, useBladeNavigation } from "@vc-shell/framework";
import { UnwrapNestedRefs, inject, onMounted, ref, toRef, Ref } from "vue";
import {
  VcmpSellerCatalogClient,
  ISearchOffersQuery,
  SearchOffersQuery,
  ISeller,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { useProductDetails } from "../../../composables/useProductDetails";
import { useRoute } from "vue-router";

interface Props {
  modelValue: UnwrapNestedRefs<ReturnType<typeof useProductDetails>>;
}

const props = defineProps<Props>();
const route = useRoute();

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);
const client = getApiClient();
const currentSeller = inject("currentSeller", toRef({ id: route?.params?.sellerId })) as Ref<ISeller>;

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
  const sellerId = currentSeller?.value?.id;
  const searchQuery = new SearchOffersQuery(query);
  if (sellerId && sellerId != "") {
    searchQuery.sellerId = sellerId;
  }
  return (await client).searchOffers(searchQuery).then((res) => res.totalCount);
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
