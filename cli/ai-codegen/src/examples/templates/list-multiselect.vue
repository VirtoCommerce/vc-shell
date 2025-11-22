<template>
  <VcBlade
    :title="bladeTitle"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- @vue-generic {IEntity} -->
    <VcTable
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      multiselect
      :columns="tableColumns"
      :items="items"
      enable-item-actions
      :item-action-builder="actionBuilder"
      :sort="sortExpression"
      :pages="pages"
      :current-page="currentPage"
      :search-value="searchValue"
      :search-placeholder="$t('ENTITIES.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('ENTITIES.PAGES.LIST.TABLE.TOTALS')"
      :total-count="totalCount"
      :selected-item-id="selectedItemId"
      select-all
      state-key="entity_list"
      @search:change="onSearchList"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
      @selection-changed="onSelectionChanged"
      @select:all="selectAllEntities"
    >
      <!-- Custom column templates -->
      <template #item_name="itemData">
        <div class="tw-truncate">
          {{ itemData.item.name }}
        </div>
      </template>

      <template #item_status="itemData">
        <StatusBadge :status="itemData.item.status" />
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, watch, markRaw, Ref } from "vue";
import {
  IBladeToolbar,
  IParentCallArgs,
  useFunctions,
  IActionBuilderResult,
  ITableColumns,
  useNotifications,
  notification,
  useBladeNavigation,
  usePopup,
  useTableSort,
  useBlade,
} from "@vc-shell/framework";
import type { Entity } from "../types";
// Example: Import your entity's composable (e.g., useOffersList, useProductsList)
import { default as useEntityList } from "../composables/useEntityList";
// Example: Import your entity's details blade component
import EntityDetails from "./entity-details.vue";
import { useI18n } from "vue-i18n";
// Example: Import status badge component if your entity has statuses
import { StatusBadge } from "../components";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:children"): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  name: "Entities",
  url: "/entities",
  notifyType: "EntityDeletedDomainEvent",
  isWorkspace: true,
  menuItem: {
    id: "entities",
    title: "ENTITIES.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { openBlade, closeBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

const { t } = useI18n({ useScope: "global" });
const { debounce } = useFunctions();

const { searchQuery, items, totalCount, pages, currentPage, loadEntities, loading, deleteEntities } = useEntityList();
const { markAsRead, setNotificationHandler } = useNotifications("EntityDeletedDomainEvent");
const { sortExpression, handleSortChange, resetSort } = useTableSort({
  initialProperty: "createdDate",
  initialDirection: "DESC",
});
const blade = useBlade();

const searchValue = ref();
const selectedItemId = ref<string>();
const selectedEntityIds = ref<string[]>([]);
const allSelected = ref(false);
const isDesktop = inject<Ref<boolean>>("isDesktop");
const bladeTitle = computed(() => t("ENTITIES.PAGES.LIST.TITLE"));

setNotificationHandler((message) => {
  if (message.title) {
    notification.success(message.title, {
      onClose() {
        markAsRead(message);
      },
    });
  }
});

watch(sortExpression, async (value) => {
  await loadEntities({ ...searchQuery.value, sort: value });
});

watch(
  () => props.param,
  (newVal) => {
    if (newVal) {
      selectedItemId.value = newVal;
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  await loadEntities({ ...searchQuery.value, sort: sortExpression.value });
});

const reload = async () => {
  selectedEntityIds.value = [];
  await loadEntities({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 20),
    sort: sortExpression.value,
  });
  emit("parent:call", {
    method: "reload",
  });
};

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadEntities({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler() {
      addEntity();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("ENTITIES.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "material-delete",
    async clickHandler() {
      await removeEntities();
    },
    disabled: computed(() => !selectedEntityIds.value?.length),
    isVisible: isDesktop,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "name",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    alwaysVisible: true,
    mobilePosition: "top-left",
  },
  {
    id: "email",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.EMAIL")),
    sortable: true,
    mobilePosition: "bottom-left",
  },
  {
    id: "status",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.STATUS")),
    sortable: true,
    alwaysVisible: true,
    type: "status",
    mobilePosition: "status",
  },
  {
    id: "createdDate",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.CREATED")),
    sortable: true,
    type: "date-ago",
  },
]);

const empty = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.ADD")),
  clickHandler: () => {
    addEntity();
  },
};

const notfound = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("ENTITIES.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchValue.value = "";
    await loadEntities({
      ...searchQuery.value,
      keyword: "",
    });
  },
};

const onItemClick = (item: Entity) => {
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

const onHeaderClick = (item: ITableColumns) => {
  handleSortChange(item.id);
};

const addEntity = () => {
  openBlade({
    blade: markRaw(EntityDetails),
  });
};

const onPaginationClick = async (page: number) => {
  await loadEntities({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
};

const onSelectionChanged = (items: Entity[]) => {
  selectedEntityIds.value = items.flatMap((item) => (item.id ? [item.id] : []));
};

const actionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "material-delete",
    title: "Delete",
    type: "danger",
    async clickHandler(item: Entity) {
      if (item.id && !selectedEntityIds.value.includes(item.id)) {
        selectedEntityIds.value.push(item.id);
      }
      await removeEntities();
      selectedEntityIds.value = [];
    },
  });

  return result;
};

async function removeEntities() {
  if (
    await showConfirmation(
      t("ENTITIES.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE", {
        count: allSelected.value
          ? t("ENTITIES.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.ALL", { totalCount: totalCount.value })
          : selectedEntityIds.value.length,
      }),
    )
  ) {
    closeBlade((blade.value.navigation?.idx ?? 0) + 1);
    await deleteEntities({ allSelected: allSelected.value, entityIds: selectedEntityIds.value });

    if (searchQuery.value.skip && searchQuery.value.take) {
      if (searchQuery.value.skip >= searchQuery.value.take) {
        if (allSelected.value) {
          searchQuery.value.skip = 0;
        } else {
          searchQuery.value.skip -= searchQuery.value.take;
        }
      }
    }
    await reload();
  }
}

async function selectAllEntities(all: boolean) {
  allSelected.value = all;
}

defineExpose({
  title: bladeTitle,
  reload,
  onItemClick,
});
</script>

