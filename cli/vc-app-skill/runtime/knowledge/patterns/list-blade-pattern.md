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
- `state-key` — unique string key for persisting column widths/order/visibility to localStorage. Use snake_case module name (e.g., `"team_list"`, `"catalog_list"`).
- `v-model:active-item-id` — highlights the currently open row. Bind to `selectedItemId` ref.
- `v-model:sort-field` and `v-model:sort-order` — two-way sort binding from `useDataTableSort`.
- `:pull-to-refresh="true"` — enables mobile pull-to-refresh gesture.
- `:empty-state` — object with `icon`, `title`, `actionLabel`, `actionHandler`.

---

## Column Types Reference

VcColumn `type` prop determines built-in rendering:

| Type | Renders as | When to use |
|------|-----------|-------------|
| *(none)* | Plain text | Default for string fields |
| `"date-ago"` | Relative time ("2 hours ago") | Dates in list blades — preferred over `"date-time"` |
| `"date"` | Formatted date | Date-only fields |
| `"datetime"` | Formatted date+time | When full timestamp needed |
| `"money"` | Formatted currency | Monetary values (reads `currency` field from row by default) |
| `"number"` | Formatted number | Numeric fields |
| `"image"` | Thumbnail | Image URL fields |
| `"status"` | Status badge area | Status/state fields (use with `#body` slot + `VcStatus`) |
| `"status-icon"` | Boolean icon | Boolean on/off fields (e.g., `isActive`) |

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

// 6. Status variant mapping (if status column exists)
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
