<template>
  <VcWidget
    v-loading:500="loading"
    :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.ASSOCIATIONS')"
    icon="fas fa-link"
    :value="count"
    @click="clickHandler"
  ></VcWidget>
</template>

<script lang="ts" setup>
import { UnwrapNestedRefs, onMounted, ref } from "vue";
import { useProductDetails } from "../../../composables/useProductDetails";
import {
  ISearchProductAssociationsQuery,
  SearchProductAssociationsQuery,
  VcmpSellerCatalogClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { useApiClient, useAsync, useBladeNavigation } from "@vc-shell/framework";

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
      blade: resolveBladeByName("Associations"),
      param: props.modelValue?.item?.publishedProductDataId,
      onOpen() {
        widgetOpened.value = true;
      },
      onClose() {
        widgetOpened.value = false;
      },
    });
  }
}

const { loading, action: getCount } = useAsync<ISearchProductAssociationsQuery, number | undefined>(async (query) => {
  return (await client).search(new SearchProductAssociationsQuery(query)).then((res) => res.totalCount);
});

async function populateCounter() {
  console.log("populateCounter");
  if (props.modelValue?.item?.publishedProductDataId) {
    count.value =
      (await getCount({
        take: 0,
        objectIds: [props.modelValue?.item?.publishedProductDataId],
      })) ?? 0;
  }
}

onMounted(async () => {
  console.log("onMounted", props.modelValue?.item);
  if (props.modelValue?.item?.publishedProductDataId) {
    await populateCounter();
  }
});

defineExpose({
  updateActiveWidgetCount: populateCounter,
});
</script>

<style lang="scss" scoped></style>
