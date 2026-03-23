# List Blade Pattern

Describes the full structure of a list blade: workspace entry point with `VcBlade` + `VcDataTable`, sort, pagination, toolbar, and child blade navigation.

Source: extracted from `apps/vendor-portal/src/modules/team/pages/team-list.vue`.

---

## Complete Template

```vue
<template>
  <VcBlade
    :title="title"
    width="50%"
    :toolbar-items="bladeToolbar"
    :expandable="false"
  >
    <VcDataTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :items="xxxList"
      :total-count="totalCount"
      :pagination="{ currentPage, pages }"
      v-model:active-item-id="selectedItemId"
      state-key="xxx_list"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      :pull-to-refresh="true"
      :empty-state="{
        icon: 'lucide-<icon>',
        title: $t('XXX.PAGES.LIST.EMPTY.NO_ITEMS'),
        actionLabel: $t('XXX.PAGES.LIST.EMPTY.ADD'),
        actionHandler: onAddItem,
      }"
      @row-click="onItemClick"
      @pagination-click="onPaginationClick"
      @pull-refresh="reload"
    >
      <!-- Simple columns: computed array, bound via v-for + v-bind -->
      <VcColumn
        v-for="col in simpleColumns"
        :key="col.id"
        v-bind="col"
      />

      <!-- Custom columns: inline with #body slot for complex rendering -->
      <VcColumn
        id="status"
        :title="t('XXX.PAGES.LIST.TABLE.HEADER.STATUS')"
        :always-visible="true"
      >
        <template #body="{ data }">
          <XxxStatus :value="data.status" />
        </template>
      </VcColumn>
    </VcDataTable>
  </VcBlade>
</template>
```

**Key VcDataTable props:**
- `state-key` — unique string key for persisting column widths/order/visibility to localStorage. Use snake_case module name (e.g., `"team_list"`, `"catalog_list"`).
- `v-model:active-item-id` — highlights the currently open row. Bind to `selectedItemId` ref.
- `v-model:sort-field` and `v-model:sort-order` — two-way sort binding from `useDataTableSort`.
- `:pull-to-refresh="true"` — enables mobile pull-to-refresh gesture.
- `:empty-state` — object with `icon`, `title`, `actionLabel`, `actionHandler`.

---

## Complete Script Setup

```vue
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { IBladeToolbar, useBlade, useDataTableSort } from "@vc-shell/framework";
import useXxxs from "../composables/useXxxs";
import { useI18n } from "vue-i18n";

// 1. Blade metadata — MUST be called at module scope, not inside setup
defineBlade({
  name: "XxxList",
  url: "/xxx",
  isWorkspace: true,
  permissions: ["xxx:manage"],          // array of permission strings from your UserPermissions enum
  menuItem: {
    title: "XXX.MENU.TITLE",
    icon: "lucide-<icon>",
    priority: 5,
    // Optional: group this menu item under a collapsible section
    groupConfig: {
      id: "settings",
      title: "SETTINGS.MENU.TITLE",
      icon: "lucide-store",
      priority: 6,
    },
  },
});

// 2. Core composables
const { openBlade, exposeToChildren, param } = useBlade();
const { t } = useI18n({ useScope: "global" });
const { getXxxs, searchQuery, loading, xxxList, currentPage, pages, totalCount } = useXxxs();

// 3. Sort — provides sortField, sortOrder (for VcDataTable v-model), sortExpression (string for API)
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});

// 4. UI state
const selectedItemId = ref<string | undefined>();
const title = computed(() => t("XXX.PAGES.LIST.TITLE"));

// 5. Toolbar
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("XXX.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "lucide-refresh-cw",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "addItem",
    title: computed(() => t("XXX.PAGES.LIST.TOOLBAR.ADD")),
    icon: "lucide-plus",
    clickHandler: onAddItem,
  },
]);

// 6. Simple columns: computed array — use for plain text/date/image fields
const simpleColumns = computed(() => [
  {
    id: "name",
    title: t("XXX.PAGES.LIST.TABLE.HEADER.NAME"),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("XXX.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
    type: "date-time" as const,    // note: "date-time" (with hyphen) in column definitions
    alwaysVisible: false,
  },
]);

// 7. Sort reactivity — reload when sort changes
watch(sortExpression, async (value) => {
  await getXxxs({ ...searchQuery.value, sort: value });
});

// 8. Track selected row when param changes (e.g., navigating directly to URL)
watch(
  () => param.value,
  () => {
    selectedItemId.value = param.value;
  },
  { immediate: true },
);

// 9. Load data on mount
onMounted(async () => {
  await reload();
});

// 10. Reload — reloads current page with current sort
const reload = async () => {
  await getXxxs({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

// 11. Pagination
const onPaginationClick = async (page: number) => {
  await getXxxs({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

// 12. Row click → open details blade
const onItemClick = (event: { data: { id?: string } }) => {
  openBlade({
    name: "XxxDetails",
    param: event.data.id,
    options: {
      item: event.data,             // pass row data as options if details blade needs it
    },
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

// 13. Add new item — open details blade with no param (creates new)
function onAddItem() {
  openBlade({
    name: "XxxDetails",
  });
}

// 14. Expose reload to child blades so details can trigger list refresh after save/delete
exposeToChildren({ reload });
</script>
```

---

## Key Rules

### `defineBlade` placement
`defineBlade(...)` is a compiler macro (like `defineProps`). It must be called at the **top level of `<script setup>`**, not inside any function or conditional. The framework registers blade config at module parse time.

### `useDataTableSort` — three outputs
```ts
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
```
- `sortField` — reactive ref, two-way bound to `VcDataTable` via `v-model:sort-field`
- `sortOrder` — reactive ref (`"ASC"` | `"DESC"`), two-way bound via `v-model:sort-order`
- `sortExpression` — computed string `"field:DIR"` (e.g., `"createdDate:DESC"`), passed to the API

### Sort watcher pattern
```ts
watch(sortExpression, async (value) => {
  await getXxxs({ ...searchQuery.value, sort: value });
});
```
Watch `sortExpression` (not `sortField`/`sortOrder` separately) to trigger a reload whenever sort changes.

### `exposeToChildren`
```ts
exposeToChildren({ reload });
```
Call this ONCE at the end of setup. The details blade calls `callParent("reload")` after save/delete, which invokes this `reload` function.

### Simple vs custom columns
- **Simple columns** — computed array of plain objects, rendered via `v-for + v-bind`. Use for text, dates, images, numbers.
- **Custom columns** — inline `<VcColumn>` with `#body="{ data }"` slot. Use when the cell needs a custom component or complex logic.

Both patterns can coexist in the same `VcDataTable`.

### Column `type` values
Valid values: `"image"`, `"date-time"`, `"number"`, `"boolean"`, `"html"`, `"link"`. Use `as const` to preserve the literal type:
```ts
type: "date-time" as const,
type: "image" as const,
```

### `state-key` naming
Use snake_case: `"team_list"`, `"catalog_items"`, `"orders_list"`. Must be unique across all modules in the app.

### List-only blades (no details)
For read-only list blades, omit `onItemClick` and the `addItem` toolbar button. Keep `exposeToChildren({ reload })` only if a parent blade might need to refresh this list.

---

## Minimal List Blade (no custom columns, no groups)

```vue
<template>
  <VcBlade :title="title" width="50%" :toolbar-items="bladeToolbar">
    <VcDataTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :items="xxxList"
      :total-count="totalCount"
      :pagination="{ currentPage, pages }"
      v-model:active-item-id="selectedItemId"
      state-key="xxx_list"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      @row-click="onItemClick"
      @pagination-click="onPaginationClick"
    >
      <VcColumn v-for="col in simpleColumns" :key="col.id" v-bind="col" />
    </VcDataTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { IBladeToolbar, useBlade, useDataTableSort } from "@vc-shell/framework";
import useXxxs from "../composables/useXxxs";
import { useI18n } from "vue-i18n";

defineBlade({ name: "XxxList", url: "/xxx", isWorkspace: true });

const { openBlade, exposeToChildren } = useBlade();
const { t } = useI18n({ useScope: "global" });
const { getXxxs, searchQuery, loading, xxxList, currentPage, pages, totalCount } = useXxxs();
const { sortField, sortOrder, sortExpression } = useDataTableSort({ initialField: "createdDate", initialDirection: "DESC" });

const selectedItemId = ref<string | undefined>();
const title = computed(() => t("XXX.PAGES.LIST.TITLE"));

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("XXX.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "lucide-refresh-cw",
    async clickHandler() { await reload(); },
  },
  {
    id: "addItem",
    title: computed(() => t("XXX.PAGES.LIST.TOOLBAR.ADD")),
    icon: "lucide-plus",
    clickHandler: () => openBlade({ name: "XxxDetails" }),
  },
]);

const simpleColumns = computed(() => [
  { id: "name", title: t("XXX.PAGES.LIST.TABLE.HEADER.NAME"), alwaysVisible: true, sortable: true },
]);

watch(sortExpression, async (value) => {
  await getXxxs({ ...searchQuery.value, sort: value });
});

onMounted(async () => { await reload(); });

const reload = async () => {
  await getXxxs({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

const onPaginationClick = async (page: number) => {
  await getXxxs({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};

const onItemClick = (event: { data: { id?: string } }) => {
  openBlade({
    name: "XxxDetails",
    param: event.data.id,
    onOpen() { selectedItemId.value = event.data.id; },
    onClose() { selectedItemId.value = undefined; },
  });
};

exposeToChildren({ reload });
</script>
```
