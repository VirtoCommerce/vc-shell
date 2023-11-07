<template>
  <VcWidget
    v-loading="loading"
    v-bind="props"
    :value="count"
    :title="$t('PRODUCTS.PAGES.DETAILS.WIDGETS.VIDEOS')"
    icon="fas fa-film"
    @click="clickHandler"
  ></VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, useApiClient, useAsync, useBladeNavigation } from "@vc-shell/framework";
import { UnwrapNestedRefs, onMounted, ref } from "vue";
import {
  VcmpSellerCatalogClient,
  ISearchVideosQuery,
  SearchVideosQuery,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { watchDebounced } from "@vueuse/core";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      blade: resolveBladeByName("Videos"),
      options: {
        catalogProduct: props.modelValue?.item,
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

const { loading, action: getCount } = useAsync<ISearchVideosQuery, number | undefined>(async (query) => {
  return (await client).searchVideos(new SearchVideosQuery(query)).then((res) => res.totalCount);
});

watchDebounced(
  () => props.modelValue?.item,
  async () => {
    await populateCounter();
  },
  { debounce: 500, maxWait: 1000 }
);

async function populateCounter() {
  count.value = await getCount({
    take: 0,
    ownerIds: [props.modelValue?.item?.stagedProductDataId],
  });
}

onMounted(async () => {
  if (props.modelValue?.item?.id) {
    await populateCounter();
  }
});
</script>
