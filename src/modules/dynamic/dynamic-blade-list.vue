<template>
  <VcBlade
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="list.settings.toolbar"
    :title="list.settings.titleTemplate"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      v-bind="tableScope"
      state-key="123"
      :items="bladeData"
      multiselect
      :sort="sort"
      @item-click="onItemClick"
    >
    </VcTable>
  </VcBlade>
</template>
<script setup lang="ts">
import { markRaw, onMounted, ref, watch } from "vue";
import list from "./list.json";
import { ITableColumns, useBladeNavigation, useUser } from "@vc-shell/framework";
import form from "./dynamic-blade-form.vue";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:children"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

defineOptions({
  url: list.settings.url as `/${string}`,
});

const { openBlade } = useBladeNavigation();
defineEmits<Emits>();
const { getAccessToken } = useUser();

const loading = ref(false);
const selectedItemId = ref();
const sort = ref("createdDate:DESC");
const pageSize = 20;
const searchQuery = ref({
  take: pageSize,
  sort: sort,
  // keyword: options?.keyword,
});

const bladeData = ref([]);

onMounted(async () => {
  await loadData({ sort: sort.value });
});

watch(sort, async (value) => {
  await loadData({ ...searchQuery.value, sort: value });
});

watch(
  () => props.param,
  () => {
    selectedItemId.value = props.param;
  },
  { immediate: true }
);
const tableData = list.content.find((type) => type.type === "grid");
const tableScope = {
  columns: tableData?.columns as ITableColumns[],
};

async function loadData(query) {
  searchQuery.value = { ...searchQuery.value, ...query };

  try {
    loading.value = true;
    const token = await getAccessToken();
    const url_ = list.settings.endpoint + "/search";

    const options_: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
        Accept: "text/plain",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...query,
      }),
    };

    const res = await fetch(url_, options_);

    res.text().then((response) => {
      bladeData.value = JSON.parse(response).results ?? {};
    });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    loading.value = false;
  }
}

const onItemClick = (item: { id: string }) => {
  openBlade({
    blade: markRaw(form),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};
</script>
