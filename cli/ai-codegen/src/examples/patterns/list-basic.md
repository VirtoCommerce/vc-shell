---
id: composition-list-list-basic
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, list, list]
title: "List Basic"
description: "List Basic composition for list blades"
---

# List Basic Pattern

Core structure for list blades with VcTable and basic CRUD operations.

## Description
Provides the fundamental structure for a list blade including:
- VcBlade container with toolbar
- VcTable with columns
- Composable for data loading
- Item click handler

## Usage
Use this as the foundation for all list blades. Combine with other patterns like filters, multiselect, etc.

## Code

```vue
<template>
  <VcBlade
    :title="title"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    width="70%"
    @expand="$emit('expand', $event)"
    @close="$emit('close', $event)"
  >
    <!-- @vue-generic {IItem} -->
    <VcTable
      :columns="columns"
      :items="items"
      :loading="loading"
      :total-count="totalCount"
      :pages="pages"
      :current-page="currentPage"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @header-click="onHeaderClick"
    >
      <template #mobile-item="{ item }">
        <div class="tw-p-3">
          <div class="tw-font-semibold">{{ item.name }}</div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { VcBlade, VcTable } from "@vc-shell/framework";
import type { IBladeToolbar, ITableColumns } from "@vc-shell/framework";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<{
  (event: "close", args: unknown): void;
  (event: "expand", args: unknown): void;
}>();

// Composable
const { items, loading, totalCount, pages, currentPage, load } = useEntityList();

// Toolbar
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: "Refresh",
    icon: "material-refresh",
    clickHandler: () => load(),
  },
]);

// Table columns
const columns = ref<ITableColumns[]>([
  {
    id: "name",
    title: "Name",
    width: "auto",
    sortable: true,
  },
]);

// Handlers
function onItemClick(item: { id: string }) {
  // Will be enhanced by parent-child pattern
}

function onPaginationClick(page: number) {
  currentPage.value = page;
  load();
}

function onHeaderClick(column: ITableColumns) {
  if (column.sortable) {
    // Toggle sort direction
  }
}

// Lifecycle
onMounted(() => {
  load();
});
</script>
```
