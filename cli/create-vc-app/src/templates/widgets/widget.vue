<template>
  <VcWidget
    v-loading:500="loading"
    :value="count"
    :title="$t('{{MODULE_NAME_UPPERCASE}}.WIDGETS.{{WIDGET_NAME_UPPERCASE}}.TITLE')"
    icon="{{WIDGET_ICON}}"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, useApiClient, useAsync, useBladeNavigation } from "@vc-shell/framework";
import { inject, onMounted, ref, toRef, Ref, watch } from "vue";
import { useRoute } from "vue-router";

// TODO: Replace with your actual API client imports and types
// Example: import { {{ParentEntity}}sClient, I{{ParentEntity}} } from "@your-app/api/{{parentEntityCamel}}s";

interface I{{ParentEntity}} {
  id?: string;
  name?: string;
  [key: string]: any;
}

interface Props {
  item: I{{ParentEntity}};
}

const props = defineProps<Props>();
const route = useRoute();

// TODO: Initialize your API client here
// const { getApiClient } = useApiClient(YourApiClient);
// const client = getApiClient();

const { openBlade, resolveBladeByName } = useBladeNavigation();

const widgetOpened = ref(false);
const count = ref(0);

const item = toRef(props, "item");

/**
 * Handles widget click
 * TODO: Implement your click behavior here
 */
function clickHandler() {
  // Option 1: Open a related blade (uncomment and adjust blade name)
  // if (!widgetOpened.value) {
  //   openBlade({
  //     blade: resolveBladeByName("YourBladeName"),
  //     param: item.value?.id,
  //     options: {
  //       {{parentEntityCamel}}: item.value,
  //     },
  //     onOpen() {
  //       widgetOpened.value = true;
  //     },
  //     onClose() {
  //       widgetOpened.value = false;
  //     },
  //   });
  // }
  
  // Option 2: Show notification (temporary placeholder)
  console.log("Widget clicked", item.value);
}

/**
 * Fetches count of related entities
 * TODO: Implement your API call here
 */
const { loading, action: getCount } = useAsync<any, number | undefined>(async (query) => {
  // TODO: Replace with your actual API call
  // return (await client).searchYourEntities(query).then((res) => res.totalCount);
  return 0; // Placeholder
});

/**
 * Updates the widget counter
 */
async function populateCounter() {
  count.value =
    (await getCount({
      take: 0,
      {{parentEntityCamel}}Id: item.value?.id,
    })) ?? 0;
}

onMounted(async () => {
  if (item.value?.id) {
    await populateCounter();
  }
});

watch(
  () => item.value?.id,
  async (newVal) => {
    if (newVal) {
      await populateCounter();
    }
  },
  { deep: true },
);

/**
 * Exposes method for parent blade to update widget count
 */
defineExpose({
  updateActiveWidgetCount: populateCounter,
});
</script>
