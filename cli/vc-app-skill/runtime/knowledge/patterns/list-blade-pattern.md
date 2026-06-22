# List Blade Pattern

Describes the full structure of a list blade: workspace entry point with `VcBlade` + `VcDataTable`, sort, pagination, toolbar, and child blade navigation.

Generic worked example for a typical list blade (search, sort, pagination, row actions).

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
      :total-count="pagination.totalCount"
      :pagination="pagination"
      v-model:active-item-id="selectedItemId"
      state-key="xxx_list"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      v-model:search-value="searchValue"
      :searchable="true"
      :pull-to-refresh="true"
      :empty-state="{
        icon: 'lucide-<icon>',
        title: $t('XXX.PAGES.LIST.EMPTY.NO_ITEMS'),
        actionLabel: $t('XXX.PAGES.LIST.EMPTY.ADD'),
        actionHandler: onAddItem,
      }"
      @row-click="onItemClick"
      @pagination-click="pagination.goToPage"
      @pull-refresh="reload"
    >
      <!-- Each VcColumn is declared explicitly in the template (NOT via v-for).
           This allows custom #body slots for status, image, and other complex cells. -->
      <VcColumn
        id="name"
        :title="t('XXX.PAGES.LIST.TABLE.HEADER.NAME')"
        :always-visible="true"
        :sortable="true"
        mobile-position="top-left"
      />
      <VcColumn
        id="status"
        :title="t('XXX.PAGES.LIST.TABLE.HEADER.STATUS')"
        :always-visible="true"
        :sortable="true"
        type="status"
        mobile-role="status"
      >
        <template #body="{ data }">
          <VcStatus :variant="statusVariant(data.status)">
            {{ data.status }}
          </VcStatus>
        </template>
      </VcColumn>
      <VcColumn
        id="total"
        :title="t('XXX.PAGES.LIST.TABLE.HEADER.TOTAL')"
        :sortable="true"
        type="money"
        mobile-position="top-right"
      />
      <VcColumn
        id="createdDate"
        :title="t('XXX.PAGES.LIST.TABLE.HEADER.CREATED_DATE')"
        :sortable="true"
        type="date-ago"
        mobile-position="bottom-right"
      />
    </VcDataTable>
  </VcBlade>
</template>
```

**CRITICAL: Do NOT use `v-for` to render columns.** Declare each `<VcColumn>` explicitly in the template. This is necessary for:

- Custom `#body` slots (status badges, images, formatted values)
- Per-column `mobile-role` / `mobile-position` attributes
- Readability and maintainability

**Key VcDataTable props:**

- `state-key` — unique string key for persisting column widths/order/visibility to localStorage. Use snake_case module name (e.g., `"team_list"`, `"catalog_list"`). This prop controls column layout only — URL query persistence (sort/search/page) comes from the composables' `stateKey` option.
- `v-model:active-item-id` — highlights the currently open row. Bind to `selectedItemId` ref.
- `v-model:sort-field` and `v-model:sort-order` — two-way sort binding from `useDataTableSort`.
- `v-model:search-value` and `:searchable="true"` — two-way search binding from `useTableSearch`.
- `:pagination="pagination"` and `@pagination-click="pagination.goToPage"` — pass the reactive object from `useDataTablePagination` directly.
- `:pull-to-refresh="true"` — enables mobile pull-to-refresh gesture.
- `:empty-state` — object with `icon`, `title`, `actionLabel`, `actionHandler`.

---

## Column Types Reference

VcColumn `type` prop determines built-in rendering:

| Type            | Renders as                    | When to use                                                  |
| --------------- | ----------------------------- | ------------------------------------------------------------ |
| _(none)_        | Plain text                    | Default for string fields                                    |
| `"date-ago"`    | Relative time ("2 hours ago") | Dates in list blades — preferred over `"date-time"`          |
| `"date"`        | Formatted date                | Date-only fields                                             |
| `"datetime"`    | Formatted date+time           | When full timestamp needed                                   |
| `"money"`       | Formatted currency            | Monetary values (reads `currency` field from row by default) |
| `"number"`      | Formatted number              | Numeric fields                                               |
| `"image"`       | Thumbnail                     | Image URL fields                                             |
| `"status"`      | Status badge area             | Status/state fields (use with `#body` slot + `VcStatus`)     |
| `"status-icon"` | Boolean icon                  | Boolean on/off fields (e.g., `isActive`)                     |

**CRITICAL:** Use `"date-ago"` (NOT `"date-time"`) for dates in list blades. `"date-time"` is the legacy `ITableColumnsBase` format — VcColumn uses `"datetime"` or `"date-ago"`.

---

## Mobile Layout Attributes

Each VcColumn can specify its position in the mobile card layout:

**`mobile-position`** — where the column appears in the card grid:

- `"top-left"` — primary identifier (name, title)
- `"top-right"` — secondary value (price, total)
- `"bottom-left"` — tertiary info (SKU, category)
- `"bottom-right"` — timestamp or date

**`mobile-role`** — special rendering roles:

- `"image"` — displayed as card thumbnail on the left
- `"status"` — displayed as status badge at bottom
- `"title"` — main card title
- `"field"` — generic field value

---

## Status Column Pattern

For fields that represent a status/state (e.g., order status, approval state), use `VcStatus` component in a `#body` slot:

```vue
<VcColumn id="status" :title="t('XXX.PAGES.LIST.TABLE.HEADER.STATUS')" :always-visible="true" :sortable="true" type="status" mobile-role="status">
  <template #body="{ data }">
    <VcStatus :variant="statusVariant(data.status)">
      {{ data.status }}
    </VcStatus>
  </template>
</VcColumn>
```

Status variant mapping function:

```ts
// Map API status values to VcStatus variant colors
const statusVariant = (status: string | undefined): "info" | "warning" | "danger" | "success" | "primary" => {
  const map: Record<string, "info" | "warning" | "danger" | "success" | "primary"> = {
    // Positive states
    Published: "success",
    Active: "success",
    Confirmed: "success",
    Approved: "success",
    Paid: "success",
    Completed: "success",
    // In-progress / pending states
    New: "warning",
    Pending: "warning",
    Draft: "warning",
    Processing: "warning",
    Unpaid: "warning",
    // Negative states
    Cancelled: "danger",
    Rejected: "danger",
    Failed: "danger",
    Deleted: "danger",
    // Neutral / special states
    Shipped: "primary",
    Packaged: "primary",
    Accepted: "primary",
  };
  return map[status ?? ""] ?? "info";
};
```

If the API defines an enum of statuses, populate the map from those values. If statuses are unknown at generation time, provide a default map with common patterns and add a `// TODO: adjust status variants to match API statuses` comment.

---

## Complete Script Setup

```vue
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { IBladeToolbar, useBlade, useDataTableSort, useDataTablePagination, useTableSearch } from "@vc-shell/framework";
import { debounce } from "lodash-es";
import useXxxs from "../composables/useXxxs";
import { useI18n } from "vue-i18n";

// 1. Blade metadata — MUST be called at module scope, not inside setup
defineBlade({
  name: "XxxList",
  url: "/xxx",
  isWorkspace: true,
  permissions: ["xxx:manage"], // array of permission strings from your UserPermissions enum
  menuItem: {
    title: "XXX.MENU.TITLE",
    icon: "lucide-<icon>",
    priority: 5,
  },
});

// 2. Core composables
const { openBlade, exposeToChildren, param } = useBlade();
const { t } = useI18n({ useScope: "global" });
const { getXxxs, loading, xxxList, totalCount } = useXxxs();

// 3. Sort — stateKey persists sort to blade URL; omit stateKey to opt out
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  stateKey: "xxx_list",
  initialField: "createdDate",
  initialDirection: "DESC",
});

// 4. Search — stateKey persists keyword to blade URL; omit stateKey to opt out
const { searchValue } = useTableSearch({ stateKey: "xxx_list" });

// 5. Pagination — stateKey persists current page to blade URL; omit stateKey to opt out
// Note: state-key on <VcDataTable> is column-layout persistence only (localStorage).
// URL query persistence (sort/search/page) is controlled by the stateKey option here.
const pagination = useDataTablePagination({
  stateKey: "xxx_list",
  pageSize: 20,
  totalCount,
});

// 6. UI state
const selectedItemId = ref<string | undefined>();
const title = computed(() => t("XXX.PAGES.LIST.TITLE"));

// 7. Toolbar
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

// 8. Status variant mapping (if status column exists)
const statusVariant = (status: string | undefined): "info" | "warning" | "danger" | "success" | "primary" => {
  const map: Record<string, "info" | "warning" | "danger" | "success" | "primary"> = {
    // TODO: adjust status variants to match your API statuses
    Active: "success",
    Published: "success",
    New: "warning",
    Pending: "warning",
    Draft: "warning",
    Cancelled: "danger",
    Rejected: "danger",
  };
  return map[status ?? ""] ?? "info";
};

// 9. Load function — explicit; called on mount and by watchers
const load = async () => {
  await getXxxs({
    sort: sortExpression.value,
    keyword: searchValue.value || undefined,
    skip: pagination.skip,
    take: 20,
  });
};

// 10. Reset to page 1 when search changes, then reload
watch(searchValue, () => pagination.setPage(1));

// 11. Reload when sort, search, or page changes (debounced to coalesce rapid changes)
watch([sortExpression, searchValue, () => pagination.skip], debounce(load, 300));

// 12. Track selected row when param changes (e.g., navigating directly to URL)
watch(
  () => param.value,
  () => {
    selectedItemId.value = param.value;
  },
  { immediate: true },
);

// 13. Load data on mount
onMounted(() => load());

// 14. Reload helper — used by toolbar and exposed to child blades
const reload = async () => {
  await load();
};

// 15. Row click → open details blade
const onItemClick = (event: { data: { id?: string } }) => {
  openBlade({
    name: "XxxDetails",
    param: event.data.id,
    options: {
      item: event.data,
    },
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

// 16. Add new item — open details blade with no param (creates new)
function onAddItem() {
  openBlade({
    name: "XxxDetails",
  });
}

// 17. Expose reload to child blades so details can trigger list refresh after save/delete
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
  stateKey: "xxx_list", // optional: persists sort to blade URL
  initialField: "createdDate",
  initialDirection: "DESC",
});
```

- `sortField` — reactive ref, two-way bound to `VcDataTable` via `v-model:sort-field`
- `sortOrder` — reactive ref (`"ASC"` | `"DESC"`), two-way bound via `v-model:sort-order`
- `sortExpression` — computed string `"field:DIR"` (e.g., `"createdDate:DESC"`), passed to the API
- `stateKey` — when provided, the composable reads the initial sort from the URL and writes back on change

### `useTableSearch` — search with optional URL persistence

```ts
const { searchValue } = useTableSearch({ stateKey: "xxx_list" });
```

- Returns `searchValue` ref, two-way bound via `v-model:search-value` on `VcDataTable`.
- With `stateKey`, restores and persists the keyword to the blade URL.
- Without `stateKey`, behaves like a plain `ref("")`.

### `useDataTablePagination` — pagination with optional URL persistence

```ts
const pagination = useDataTablePagination({
  stateKey: "xxx_list", // optional: persists current page to blade URL
  pageSize: 20,
  totalCount,
});
```

- Pass `pagination` directly as `:pagination="pagination"` and `@pagination-click="pagination.goToPage"`.
- Access `pagination.skip` for API calls, `pagination.setPage(1)` to reset on search change.
- `stateKey` persists the current page to the blade URL; omit to opt out.
- The table `state-key` prop is column-layout persistence (localStorage) only and is independent.

### Load + watcher pattern

```ts
const load = async () => {
  await getXxxs({ sort: sortExpression.value, keyword: searchValue.value || undefined, skip: pagination.skip, take: 20 });
};
watch(searchValue, () => pagination.setPage(1));
watch([sortExpression, searchValue, () => pagination.skip], debounce(load, 300));
onMounted(() => load());
```

Watch `[sortExpression, searchValue, () => pagination.skip]` to reload whenever any query dimension changes. Reset to page 1 when search changes before the reload watcher fires.

### `exposeToChildren`

```ts
exposeToChildren({ reload });
```

Call this ONCE at the end of setup. The details blade calls `callParent("reload")` after save/delete, which invokes this `reload` function.

### Column declaration — explicit, NOT v-for

**CRITICAL:** Always declare each `<VcColumn>` explicitly in the template. Do NOT use `v-for` with a computed array.

Why:

- Allows `#body` slots for custom rendering (VcStatus, images, formatted values)
- Allows per-column `mobile-role` and `mobile-position` attributes
- Makes the template self-documenting and easier to customize

### Column type selection rules

When choosing `type` for each column, apply these rules based on the field's data type from the API:

- **String enum / status field** (field name contains "status", "state") → `type="status"` + `#body` slot with `VcStatus`
- **Boolean field** (field name starts with "is", "has", "can") → `type="status-icon"`
- **Date/DateTime field** (field name contains "date", "created", "modified", "updated") → `type="date-ago"` for list blades
- **Monetary/price field** (field name contains "price", "total", "amount", "cost") → `type="money"`
- **Image URL field** (field name contains "img", "image", "avatar", "thumbnail") → `type="image"` + `width="60px"` or `width="75px"`
- **Numeric field** (field is number but not money) → `type="number"`
- **Everything else** → no type (plain text)

### Mobile layout assignment rules

Assign mobile attributes based on column semantic role:

- **Primary identifier** (name, number, title) → `mobile-position="top-left"`
- **Image** → `mobile-role="image"` + `:always-visible="true"`
- **Status** → `mobile-role="status"`
- **Primary value** (total, price) → `mobile-position="top-right"`
- **Secondary info** (SKU, category, customer) → `mobile-position="bottom-left"`
- **Date** → `mobile-position="bottom-right"`

### `state-key` naming

Use snake_case: `"team_list"`, `"catalog_items"`, `"orders_list"`. Must be unique across all modules in the app.

### List-only blades (no details)

For read-only list blades, omit `onItemClick` and the `addItem` toolbar button. Keep `exposeToChildren({ reload })` only if a parent blade might need to refresh this list.
