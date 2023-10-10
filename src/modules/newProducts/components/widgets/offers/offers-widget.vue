<template>
  <VcWidget
    v-loading="loading"
    v-bind="props"
    :value="count"
    title="Offers"
    icon="fas fa-tags"
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
} from "./../../../../../api_client/marketplacevendor";

interface Props {
  modelValue: UnwrapNestedRefs<{ [x: string]: any; id?: string }>;
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
      blade: resolveBladeByName("OffersJ"),
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

onMounted(async () => {
  if (props.modelValue?.item?.id) {
    count.value = await getCount({
      take: 0,
      sellerProductId: props.modelValue?.item?.id,
    });
  }
});
</script>
