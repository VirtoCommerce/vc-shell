<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="columns"
      :items="items"
      :pages="pages"
      :current-page="currentPage"
      :total-count="totalCount"
      :selected-item-id="selectedItemId"
      :search-value="searchValue"
      :search-placeholder="$t('ENTITIES.PAGES.LIST.SEARCH.PLACEHOLDER')"
      state-key="ENTITY_LIST_REORDERABLE"
      :empty="empty"
      :notfound="notfound"
      :reorderable="isReorderMode"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchList"
      @scroll:ptr="reload"
      @row:reorder="onRowReorder"
    >
      <!-- Order/Position column -->
      <template #item_order="itemData">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon
            v-if="isReorderMode"
            icon="fas fa-grip-vertical"
            class="tw-text-gray-400 tw-cursor-move"
          />
          <span class="tw-text-sm tw-text-gray-600">
            {{ itemData.item.order }}
          </span>
        </div>
      </template>

      <!-- Status badge custom column -->
      <template #item_status="itemData">
        <VcStatus
          :variant="itemData.item.status === 'active' ? 'success' : 'danger'"
          :outline="false"
        >
          {{ itemData.item.status }}
        </VcStatus>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, markRaw } from "vue";
import { IBladeToolbar, IParentCallArgs, ITableColumns, useBladeNavigation, useFunctions, usePopup } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
// TODO: Update import path for your entity's composable
import { default as useEntityList } from "../composables/useEntityList";
// TODO: Update import for your entity's details blade file name
import EntityDetails from "./entity-details.vue";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

defineOptions({
  name: "EntityList",
  url: "/entities",
  isWorkspace: true,
  menuItem: {
    title: "ENTITIES.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();
const { openBlade } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });
const { debounce } = useFunctions();
const { showConfirmation, showError } = usePopup();
const {
  getEntities,
  updateEntitiesOrder,
  searchQuery,
  loading,
  items,
  currentPage,
  pages,
  totalCount
} = useEntityList();

const selectedItemId = ref();
const searchValue = ref<string>();
const isReorderMode = ref(false);
const originalOrder = ref<string[]>([]);
const title = computed(() => t("ENTITIES.PAGES.LIST.TITLE"));

const empty = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.ADD")),
  clickHandler: onAddEntity,
};

const notfound = {
  icon: "material-search",
  text: computed(() => t("ENTITIES.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("ENTITIES.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchValue.value = "";
    await getEntities({ ...searchQuery.value, keyword: "", skip: 0 });
  },
};

const bladeToolbar = computed<IBladeToolbar[]>(() => {
  const baseToolbar: IBladeToolbar[] = [
    {
      id: "refresh",
      title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.REFRESH")),
      icon: "material-refresh",
      async clickHandler() {
        await reload();
      },
      isVisible: computed(() => !isReorderMode.value),
    },
    {
      id: "add",
      title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.ADD")),
      icon: "material-add",
      clickHandler: onAddEntity,
      isVisible: computed(() => !isReorderMode.value),
    },
    {
      id: "reorder",
      title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.REORDER")),
      icon: "fas fa-sort",
      async clickHandler() {
        enableReorderMode();
      },
      isVisible: computed(() => !isReorderMode.value && items.value.length > 0),
    },
  ];

  const reorderToolbar: IBladeToolbar[] = [
    {
      id: "save-order",
      title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.SAVE_ORDER")),
      icon: "material-save",
      async clickHandler() {
        await saveOrder();
      },
      isVisible: computed(() => isReorderMode.value),
    },
    {
      id: "cancel-order",
      title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.CANCEL")),
      icon: "material-close",
      async clickHandler() {
        await cancelReorderMode();
      },
      isVisible: computed(() => isReorderMode.value),
    },
  ];

  return [...baseToolbar, ...reorderToolbar];
});

const columns = ref<ITableColumns[]>([
  {
    id: "order",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.ORDER")),
    width: 80,
    alwaysVisible: true,
  },
  {
    id: "name",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.NAME")),
    alwaysVisible: true,
  },
  {
    id: "email",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.EMAIL")),
    alwaysVisible: true,
  },
  {
    id: "status",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.STATUS")),
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.CREATED")),
    type: "date-ago",
  },
]);

watch(
  () => props.param,
  () => {
    selectedItemId.value = props.param;
  },
  { immediate: true },
);

onMounted(async () => {
  await reload();
});

const reload = async () => {
  await getEntities({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value?.take ?? 20),
    sort: "order:ASC", // Always sort by order for reorderable lists
  });
};

const onPaginationClick = async (page: number) => {
  await getEntities({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value?.take ?? 20),
    sort: "order:ASC",
  });
};

const onItemClick = (item: { id?: string }) => {
  // Don't allow item click in reorder mode
  if (isReorderMode.value) return;

  openBlade({
    blade: markRaw(EntityDetails),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

function onAddEntity() {
  openBlade({
    blade: markRaw(EntityDetails),
  });
}

const onSearchList = debounce(async (keyword: string | undefined) => {
  searchValue.value = keyword;
  await getEntities({
    ...searchQuery.value,
    keyword,
    skip: 0,
  });
}, 1000);

/**
 * Enable reorder mode
 * Saves original order for cancel operation
 */
function enableReorderMode() {
  isReorderMode.value = true;
  originalOrder.value = items.value.map((item) => item.id);
}

/**
 * Cancel reorder mode and restore original order
 */
async function cancelReorderMode() {
  if (await showConfirmation(t("ENTITIES.PAGES.LIST.ALERTS.CANCEL_REORDER_CONFIRMATION"))) {
    isReorderMode.value = false;
    // Restore original order
    const restored = originalOrder.value
      .map((id) => items.value.find((item) => item.id === id))
      .filter(Boolean);
    items.value = restored as typeof items.value;
    originalOrder.value = [];
  }
}

/**
 * Handle row reorder event from VcTable
 * Updates local item order immediately for visual feedback
 */
function onRowReorder(event: { oldIndex: number; newIndex: number }) {
  const { oldIndex, newIndex } = event;

  // Reorder items array
  const itemsCopy = [...items.value];
  const [movedItem] = itemsCopy.splice(oldIndex, 1);
  itemsCopy.splice(newIndex, 0, movedItem);

  // Update order property for all items
  itemsCopy.forEach((item, index) => {
    item.order = index + 1;
  });

  items.value = itemsCopy;
}

/**
 * Save the new order to the server
 */
async function saveOrder() {
  try {
    loading.value = true;

    // Prepare order update payload
    const orderUpdates = items.value.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    // TODO: Update with your actual API call
    await updateEntitiesOrder(orderUpdates);

    isReorderMode.value = false;
    originalOrder.value = [];

    await reload();
  } catch (error) {
    showError(t("ENTITIES.PAGES.LIST.ALERTS.SAVE_ORDER_ERROR"));
    console.error("Failed to save order:", error);
  } finally {
    loading.value = false;
  }
}

defineExpose({
  reload,
  title,
});
</script>
