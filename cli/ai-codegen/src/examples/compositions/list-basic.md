# Basic List Blade

**Pattern:** VcBlade + VcTable

**Use:** Simple CRUD list without special features

**Based on:** fulfillment-centers-list.vue, team-list.vue

```vue
<template>
  <VcBlade
    :title="title"
    :toolbar-items="toolbar"
    width="50%"
    :expanded="expanded"
    :closable="closable"
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
      state-key="entity_list"
      :empty="empty"
      @header-click="onHeaderClick"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, markRaw } from "vue";
import { IBladeToolbar, ITableColumns, useBladeNavigation, useTableSort } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

// Composable for data management
const { items, loading, currentPage, pages, totalCount, loadItems } = useEntityList();
const { sortExpression, handleSortChange } = useTableSort();

// State
const selectedItemId = ref();
const title = computed(() => t("ENTITIES.PAGES.LIST.TITLE"));

// Empty state
const empty = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.NO_ITEMS")),
};

// Toolbar
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    icon: "material-refresh",
    async clickHandler() { await reload(); },
  },
  {
    id: "add",
    icon: "material-add",
    clickHandler: () => openAddBlade(),
  },
]);

// Columns
const columns = ref<ITableColumns[]>([
  { id: "name", title: "Name", sortable: true, alwaysVisible: true },
  { id: "email", title: "Email", sortable: true },
  { id: "createdDate", title: "Created", sortable: true, type: "date-ago" },
]);

// Event handlers
function onHeaderClick(column: ITableColumns) {
  handleSortChange(column.id);
}

function onItemClick(item: any) {
  openBlade({ blade: markRaw(EntityDetails), param: item.id });
}

async function onPaginationClick(page: number) {
  await loadItems({ skip: (page - 1) * 20 });
}

const reload = async () => {
  await loadItems({ skip: (currentPage.value - 1) * 20, sort: sortExpression.value });
};
</script>
```

**Components Used:**
- VcBlade
- VcTable

**Features:**
- Sorting
- Pagination
- Empty state
- Item click navigation
- Toolbar actions

**Lines:** ~50

