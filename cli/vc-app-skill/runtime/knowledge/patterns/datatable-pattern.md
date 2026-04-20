# Data Table Pattern

List blades use `VcDataTable` with declarative `<VcColumn>` children to render paginated, sortable, searchable data grids with optional row selection and global filters.

---

## 1. Quick Start

Minimal list blade with three columns, sort, search, and pagination. No filters, no selection.

### Template

```vue
<template>
  <VcBlade
    :title="title"
    :toolbar-items="bladeToolbar"
    width="50%"
  >
    <VcDataTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :items="items"
      :total-count="pagination.totalCount"
      :pagination="pagination"
      v-model:active-item-id="selectedItemId"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      state-key="entity_list"
      :searchable="true"
      @row-click="onItemClick"
      @pagination-click="pagination.goToPage"
      @search="onSearch"
    >
      <VcColumn
        id="name"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.NAME')"
        :sortable="true"
        :always-visible="true"
        mobile-position="top-left"
      />
      <VcColumn
        id="status"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.STATUS')"
        :sortable="true"
        type="status"
        mobile-role="status"
      />
      <VcColumn
        id="createdDate"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.CREATED_DATE')"
        :sortable="true"
        type="date-ago"
        mobile-position="bottom-right"
      />
    </VcDataTable>
  </VcBlade>
</template>
```

### Script

```vue
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { IBladeToolbar, useBlade, useDataTableSort } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import useEntities from "../composables/useEntities";

const { openBlade, exposeToChildren, param } = useBlade();
const { t } = useI18n({ useScope: "global" });
const { getEntities, searchQuery, loading, items, pagination } = useEntities();
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

const selectedItemId = ref<string>();
const title = computed(() => t("MODULE.PAGES.LIST.TITLE"));
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    icon: "lucide-refresh-cw",
    title: computed(() => t("MODULE.PAGES.LIST.TOOLBAR.REFRESH")),
    async clickHandler() {
      await reload();
    },
  },
]);

watch(sortExpression, async (val) => {
  await getEntities({ ...searchQuery.value, sort: val });
});
onMounted(async () => {
  await reload();
});

const reload = async () => {
  await getEntities({ ...searchQuery.value, skip: pagination.skip, sort: sortExpression.value });
};
const onSearch = async (keyword: string | undefined) => {
  await getEntities({ ...searchQuery.value, keyword, skip: 0, sort: sortExpression.value });
};
const onItemClick = (event: { data: { id?: string } }) => {
  openBlade({
    name: "EntityDetails",
    param: event.data.id,
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

exposeToChildren({ reload });
</script>
```

---

## 2. Full Example

Demonstrates all major VcDataTable features: selection, global filters, pull-to-refresh, empty state, custom column body slots, and search header actions.

### Template

```vue
<template>
  <VcBlade
    :title="title"
    :toolbar-items="toolbarItems"
    width="50%"
  >
    <VcDataTable
      v-model:active-item-id="selectedItemId"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      v-model:selection="localSelection"
      class="tw-grow tw-basis-0"
      :loading="loading"
      :items="items"
      :total-count="pagination.totalCount"
      :pagination="pagination"
      :state-key="stateKey"
      :searchable="true"
      :selection-mode="multiselect ? 'multiple' : undefined"
      :global-filters="computedGlobalFilters"
      :pull-to-refresh="true"
      :empty-state="{
        icon: 'lucide-package-open',
        title: $t('MODULE.PAGES.LIST.EMPTY.NO_ITEMS'),
        actionLabel: $t('MODULE.PAGES.LIST.EMPTY.ADD'),
        actionHandler: onAddItem,
      }"
      @row-click="onItemClick"
      @pagination-click="pagination.goToPage"
      @search="onSearch"
      @filter="onFilter"
      @pull-refresh="reload"
    >
      <!-- Slot for custom actions next to the search bar -->
      <template #search-header-actions>
        <VcButton
          icon="lucide-sliders-horizontal"
          variant="outline"
          size="sm"
          @click="toggleAdvancedView"
        >
          {{ $t("MODULE.PAGES.LIST.ACTIONS.TOGGLE_VIEW") }}
        </VcButton>
      </template>

      <!-- Image column -->
      <VcColumn
        id="img"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.IMAGE')"
        :always-visible="true"
        mobile-role="image"
        type="image"
      >
        <template #body="{ data }">
          <img
            :src="data.imgSrc || '/placeholder.png'"
            class="tw-w-10 tw-h-10 tw-rounded tw-object-cover"
          />
        </template>
      </VcColumn>

      <!-- Status column with custom body -->
      <VcColumn
        id="status"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.STATUS')"
        :sortable="true"
        :always-visible="true"
        mobile-role="status"
        type="status"
      >
        <template #body="{ data }">
          <VcStatus :variant="statusVariant(data.status)">
            {{ data.status }}
          </VcStatus>
        </template>
      </VcColumn>

      <!-- Name column -->
      <VcColumn
        id="name"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.NAME')"
        :sortable="true"
        :always-visible="true"
        mobile-position="top-left"
      />

      <!-- Date column (built-in date-ago rendering) -->
      <VcColumn
        id="createdDate"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.CREATED_DATE')"
        :sortable="true"
        type="date-ago"
      />

      <!-- Plain text column -->
      <VcColumn
        id="sku"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.SKU')"
        :always-visible="true"
        mobile-position="bottom-left"
      />

      <!-- Boolean status-icon column -->
      <VcColumn
        id="isPublished"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.PUBLISHED')"
        :sortable="true"
        mobile-position="bottom-right"
        type="status-icon"
      />

      <!-- Nested property via :field dot-path -->
      <VcColumn
        id="category"
        :field="'metadata.category'"
        :title="t('MODULE.PAGES.LIST.TABLE.HEADER.CATEGORY')"
      />
    </VcDataTable>
  </VcBlade>
</template>
```

### Script

```vue
<script lang="ts" setup>
import { computed, ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, useBlade, usePopup, useDataTableSort } from "@vc-shell/framework";
import useEntities from "../composables/useEntities";

const { openBlade, exposeToChildren, param } = useBlade();
const { t } = useI18n({ useScope: "global" });
const { showConfirmation } = usePopup();
const { getEntities, deleteEntities, searchQuery, loading, items, pagination } = useEntities();

// Sort state
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

const selectedItemId = ref<string>();
const multiselect = true;
const stateKey = "entity_list";

// Selection binding — syncs v-model:selection with local ref
const localSelection = ref<Record<string, unknown>[]>([]);

watch(
  localSelection,
  (newSelection) => {
    // Process selection changes (e.g., update toolbar state)
  },
  { deep: true },
);

// Global filters configuration
const computedGlobalFilters = computed(() => {
  return [
    {
      id: "status",
      label: t("MODULE.PAGES.LIST.FILTERS.STATUS"),
      filter: {
        options: [
          { value: "Active", label: t("MODULE.STATUSES.ACTIVE") },
          { value: "Draft", label: t("MODULE.STATUSES.DRAFT") },
          { value: "Archived", label: t("MODULE.STATUSES.ARCHIVED") },
        ],
        multiple: true,
      },
    },
  ];
});

// Status variant mapping
const statusVariant = (status: string | undefined) => {
  const map: Record<string, string> = {
    Active: "success",
    Published: "success",
    Draft: "warning",
    Pending: "warning",
    Archived: "danger",
    Cancelled: "danger",
  };
  return map[status ?? ""] ?? "info";
};

// Toolbar (computed to react to selection changes)
const toolbarItems = computed((): IBladeToolbar[] => {
  const items: IBladeToolbar[] = [];

  items.push({
    id: "add",
    icon: "lucide-plus",
    title: t("MODULE.PAGES.LIST.TOOLBAR.ADD"),
    clickHandler: () => onAddItem(),
  });

  items.push({
    id: "refresh",
    icon: "lucide-refresh-cw",
    title: t("MODULE.PAGES.LIST.TOOLBAR.REFRESH"),
    clickHandler: async () => await reload(),
  });

  items.push({
    id: "deleteSelected",
    icon: "lucide-trash-2",
    title: t("MODULE.PAGES.LIST.TOOLBAR.DELETE"),
    disabled: localSelection.value.length === 0,
    clickHandler: async () => {
      if (await showConfirmation(t("MODULE.ALERTS.DELETE_SELECTED"))) {
        const ids = localSelection.value.map((item) => item.id as string);
        await deleteEntities({ ids });
        localSelection.value = [];
        await reload();
      }
    },
  });

  return items;
});

// Sort reactivity
watch(sortExpression, async (val) => {
  await getEntities({ ...searchQuery.value, sort: val });
});

// Track selected row when param changes
watch(
  () => param.value,
  (newVal) => {
    selectedItemId.value = newVal;
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  await getEntities({ sort: sortExpression.value });
});

const reload = async () => {
  await getEntities({
    ...searchQuery.value,
    skip: pagination.skip,
    sort: sortExpression.value,
  });
};
// No manual onPaginationClick — pagination.goToPage handles it via useDataTablePagination

const onSearch = async (keyword: string | undefined) => {
  await getEntities({ ...searchQuery.value, keyword, skip: 0, sort: sortExpression.value });
};

// Row click handler — event wraps row data in { data }
const onItemClick = (event: { data: { id?: string } }) => {
  selectedItemId.value = event.data.id;
  openBlade({
    name: "EntityDetails",
    param: event.data.id,
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

async function onFilter(event: { filters: Record<string, unknown> }) {
  const statusFilter = event.filters.status as string[] | undefined;
  await getEntities({
    ...searchQuery.value,
    status: statusFilter ?? [],
    skip: 0,
    sort: sortExpression.value,
  });
}

function onAddItem() {
  openBlade({ name: "EntityDetails" });
}

function toggleAdvancedView() {
  // Custom view toggle logic
}

// Expose methods to child blades (without title)
exposeToChildren({
  reload,
  onItemClick,
});
</script>
```

---

## 3. VcColumn Props Reference

| Prop              | Type      | Description                                                                                                                                           |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | `string`  | Column identifier. Matches the item property name used to extract cell value.                                                                         |
| `title`           | `string`  | Column header text. Accepts an i18n key or plain string.                                                                                              |
| `sortable`        | `boolean` | Enable sorting on this column. Default `false`.                                                                                                       |
| `always-visible`  | `boolean` | Column cannot be hidden by the user via column settings. Default `false`.                                                                             |
| `type`            | `string`  | Built-in cell renderer: `"date-ago"`, `"date-time"`, `"image"`, `"status"`, `"status-icon"`, `"money"`, `"number"`, `"date"`, `"datetime"`.           |
| `width`           | `string`  | CSS width value (e.g., `"60px"`, `"120px"`, `"20%"`).                                                                                                 |
| `visible`         | `boolean` | Initial column visibility. Default `true`. Set `false` to hide by default (user can show via column settings).                                        |
| `field`           | `string`  | Dot-path to nested property on the row item (e.g., `"metadata.category"`, `"productData.productType"`). Use when `id` alone cannot resolve the value. |
| `mobile-position` | `string`  | Position in mobile card layout: `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`.                                                       |
| `mobile-role`     | `string`  | Special mobile rendering role: `"image"`, `"status"`, `"title"`, `"field"`.                                                                           |

### VcColumn Slots

| Slot    | Scope      | Description                                           |
| ------- | ---------- | ----------------------------------------------------- |
| `#body` | `{ data }` | Custom cell body. `data` is the full row item object. |

---

## 4. VcDataTable Props Reference

| Prop                     | Type                                                                                | Default     | Description                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `items`                  | `unknown[]`                                                                         | `[]`        | Array of row items to display.                                                                                         |
| `total-count`            | `number`                                                                            | `0`         | Total number of items (for pagination display).                                                                        |
| `loading`                | `boolean`                                                                           | `false`     | Shows loading indicator overlay.                                                                                       |
| `pagination`             | `UseDataTablePaginationReturn`                                                      | --          | Pagination state from `useDataTablePagination()`. Contains `currentPage`, `pages`, `totalCount`, `skip`, `goToPage()`. |
| `v-model:active-item-id` | `string \| undefined`                                                               | --          | Two-way binding for the highlighted/active row id.                                                                     |
| `v-model:sort-field`     | `string`                                                                            | --          | Two-way binding for the currently sorted column id.                                                                    |
| `v-model:sort-order`     | `0 \| 1 \| -1`                                                                      | --          | Two-way binding for sort order (1=ASC, -1=DESC, 0=none). Use `useDataTableSort()` which manages this internally.       |
| `v-model:selection`      | `unknown[]`                                                                         | --          | Two-way binding for selected row items.                                                                                |
| `state-key`              | `string`                                                                            | --          | Unique key for persisting column widths/order/visibility to localStorage. Use snake_case (e.g., `"entity_list"`).      |
| `searchable`             | `boolean`                                                                           | `false`     | Shows the search input above the table.                                                                                |
| `selection-mode`         | `"multiple" \| undefined`                                                           | `undefined` | Enables row checkboxes for multi-select. Set to `"multiple"` to enable, `undefined` to disable.                        |
| `is-row-selectable`      | `(item: unknown) => boolean`                                                        | --          | Predicate to control which rows can be selected.                                                                       |
| `global-filters`         | `GlobalFilter[] \| undefined`                                                       | `undefined` | Array of filter definitions shown above the table.                                                                     |
| `pull-to-refresh`        | `boolean`                                                                           | `false`     | Enables mobile pull-to-refresh gesture.                                                                                |
| `empty-state`            | `{ icon: string; title: string; actionLabel?: string; actionHandler?: () => void }` | --          | Configuration for empty state display when no items.                                                                   |

---

## 5. Events Reference

| Event               | Payload                                | Description                                                                                                 |
| ------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `@row-click`        | `{ data: RowItem }`                    | Emitted when a row is clicked. The row item is wrapped in `{ data }`.                                       |
| `@pagination-click` | `number`                               | Emitted when a pagination page button is clicked. Payload is the target page number (1-based).              |
| `@search`           | `string \| undefined`                  | Emitted when the user types in the search input. Payload is the search keyword or `undefined` when cleared. |
| `@filter`           | `{ filters: Record<string, unknown> }` | Emitted when a global filter is applied. `filters` is a map of filter id to selected values.                |
| `@pull-refresh`     | --                                     | Emitted when the user triggers pull-to-refresh on mobile.                                                   |

---

## 6. Key Rules

1. **Declare columns explicitly, NOT with `v-for`.** Each `<VcColumn>` must be a direct child in the template. This enables custom `#body` slots, per-column `mobile-role`/`mobile-position` attributes, and readable templates.

2. **Row click event wraps data in `{ data }`.** The `@row-click` handler receives `{ data: RowItem }`, not the raw item. Always destructure: `const onItemClick = (event: { data: { id?: string } }) => { ... }`.

3. **Use `useDataTableSort` for sort state.** It returns `sortField`, `sortOrder` (for v-model bindings), and `sortExpression` (computed `"field:DIR"` string for the API). Watch `sortExpression` to reload data when sort changes.

4. **Selection requires a local ref.** Bind `v-model:selection` to a `localSelection` ref, then watch it to sync with external selection state or toolbar actions:

   ```ts
   const localSelection = ref<Item[]>([]);
   watch(
     localSelection,
     (newSelection) => {
       // Update toolbar state, selection handler, etc.
     },
     { deep: true },
   );
   ```

5. **`state-key` must be unique across all modules.** Use snake_case naming: `"entity_list"`, `"another_list"`, `"team_members"`.

6. **`exposeToChildren` should not include `title`.** Expose only callable methods like `reload` and `onItemClick`. The title is blade metadata, not a child-callable method.

7. **Global filters structure:** Each filter is an object with `id`, `label`, and a `filter` object containing `options` (array of `{ value, label }`) and `multiple` (boolean). Return `undefined` from the computed to hide filters entirely.

8. **Empty state requires all four properties** when you want an action button: `icon` (Lucide icon name), `title` (i18n string), `actionLabel` (button text), `actionHandler` (callback function). Omit `actionLabel` and `actionHandler` for a passive empty state.

9. **Column `type` selection rules:**
   - Date fields: use `"date-ago"` in list blades (relative time), not `"date-time"`
   - Boolean fields (is*, has*, can\*): use `"status-icon"`
   - Status/state enums: use `"status"` with a custom `#body` slot containing `VcStatus`
   - Image URLs: use `"image"` with `mobile-role="image"`
   - Currency fields: use `"money"`

10. **`#search-header-actions` slot** renders custom buttons/controls adjacent to the search input. Use for view toggles, breadcrumbs, or additional action buttons that relate to the list as a whole.
