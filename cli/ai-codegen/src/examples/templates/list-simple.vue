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
      :sort="sortExpression"
      :pages="pages"
      :current-page="currentPage"
      :total-count="totalCount"
      :selected-item-id="selectedItemId"
      state-key="ENTITY_LIST"
      :empty="empty"
      @header-click="onHeaderClick"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
    >
      <!-- Custom column templates can be added here -->
      <!-- Example:
      <template #item_status="itemData">
        <StatusBadge :status="itemData.item.status" />
      </template>
      -->
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, markRaw } from "vue";
import { IBladeToolbar, IParentCallArgs, ITableColumns, useBladeNavigation, useTableSort } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
// TODO: Update import path for your entity's composable
import { useEntityList } from "../composables/useEntityList";
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
const { getEntities, searchQuery, loading, items, currentPage, pages, totalCount } = useEntityList();

const { sortExpression, handleSortChange: tableSortHandler } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

const selectedItemId = ref();
const title = computed(() => t("ENTITIES.PAGES.LIST.TITLE"));

const empty = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.ADD")),
  clickHandler: onAddEntity,
};

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
    clickHandler: onAddEntity,
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "name",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.NAME")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "email",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.EMAIL")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "status",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.STATUS")),
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("ENTITIES.PAGES.LIST.TABLE.HEADER.CREATED")),
    sortable: true,
    type: "date-ago",
  },
]);

watch(sortExpression, async (value) => {
  await getEntities({ ...searchQuery.value, sort: value });
});

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
    sort: sortExpression.value,
  });
};

const onHeaderClick = (item: ITableColumns) => {
  tableSortHandler(item.id);
};

const onPaginationClick = async (page: number) => {
  await getEntities({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

const onItemClick = (item: { id?: string }) => {
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

defineExpose({
  reload,
  title,
});
</script>

