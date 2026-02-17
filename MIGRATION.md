# @vc-shell/framework — Migration Guide to v2.0.0

> Covers all breaking changes, deprecations, and migration paths from **v1.2.x → v2.0.0**.
> Changes are grouped by domain. Look for severity badges:
>
> - **⚠️ BREAKING** — code will fail without changes
> - **📋 DEPRECATED** — old API still works but should be updated
> - **✨ NEW** — purely additive, no migration needed

---

## Table of Contents

1. [Blade Navigation](#1-blade-navigation) — ⚠️ architecture rewrite
2. [Extension Points](#2-extension-points) — ⚠️ full API replacement
3. [Table (VcTable → VcDataTable)](#3-table) — 📋 deprecated adapter available
4. [Components](#4-components) — mixed ⚠️ and 📋
5. [Injection Keys](#5-injection-keys) — 📋 legacy aliases preserved
6. [Module System](#6-module-system) — ⚠️ routing changes
7. [New Features](#7-new-features) — ✨ overview

---

## 1. Blade Navigation

The blade navigation system was rewritten from a VNode-mutation model to a state machine architecture. This is the largest breaking change in v2.0.0.

### Architecture Overview

| Layer | v1.x | v2.0.0 |
|-------|------|--------|
| **State** | Mutable VNode array | `BladeStack` state machine with `BladeDescriptor` data objects |
| **Rendering** | Direct VNode construction | `VcBladeSlot` reads descriptors, renders components |
| **Communication** | `defineExpose` + emit callbacks | `BladeMessaging` RPC (async/await) |
| **URL** | Vue Router routes per blade | Single catch-all route, URL sync only |
| **Addressing** | Index-based (`closeBlade(2)`) | ID-based (`closeSelf()`) |

### ⚠️ `useBlade()` → `useBladeContext()`

`useBlade()` returns a single `ComputedRef<IBladeInstance>`. The new `useBladeContext()` returns individual computed refs plus action methods.

> `useBlade()` still works for reading blade identity, but `useBladeContext()` is required for actions.

**Before:**

```typescript
import { useBlade, useBladeNavigation } from "@vc-shell/framework";
import { markRaw } from "vue";
import OrderDetails from "./order-details.vue";

const blade = useBlade();
const { openBlade, closeBlade, onParentCall } = useBladeNavigation();

// Read properties
const entityId = blade.value.param;
const isExpanded = blade.value.expandable;

// Open child — requires component import + markRaw
openBlade({
  blade: markRaw(OrderDetails),
  param: item.id,
  options: { source: "list" },
  onOpen() { selectedId.value = item.id; },
  onClose() { selectedId.value = undefined; },
});

// Close child — fragile index arithmetic
closeBlade((blade.value.navigation?.idx ?? 0) + 1);

// Call parent — callback-based
onParentCall({
  method: "reload",
  args: { id: item.id },
  callback: (result) => { /* ... */ },
});

// Before-close guard — return false to PREVENT closing
onBeforeClose(async () => {
  if (modified.value) return false;
});
```

**After:**

```typescript
import { useBladeContext } from "@vc-shell/framework";

const {
  param, options, expanded, closable, id, query,
  openBlade, closeSelf, replaceWith,
  callParent, exposeToChildren,
  onBeforeClose,
  setError, clearError,
} = useBladeContext();

// Read properties — direct computed refs
const entityId = param.value;
const isExpanded = expanded.value;

// Open child — by registered name, no markRaw needed
openBlade({
  name: "OrderDetails",
  param: item.id,
  options: { source: "list" },
  onOpen() { selectedId.value = item.id; },
  onClose() { selectedId.value = undefined; },
});

// Close self — no index needed
await closeSelf();

// Call parent — async/await with typed return
const result = await callParent<void>("reload", { id: item.id });

// Before-close guard — return true to PREVENT closing (inverted!)
onBeforeClose(async () => {
  if (modified.value) return true;  // true = prevent
  return false;                     // false = allow
});
```

**Gotchas:**

- The before-close guard boolean is **inverted**: v1.x `return false` → prevent; v2.0.0 `return true` → prevent. The legacy adapter handles this automatically, but when migrating to `useBladeContext()` you must flip the logic.
- `openBlade` now takes `{ name: string }` (resolved from `BladeRegistry`), not `{ blade: Component }`. No `markRaw()` needed.
- `replaceWith()` is a dedicated method replacing the old `replaceCurrentBlade: true` flag.
- `useBladeContext()` only works inside components rendered by `VcBladeSlot`. If your blade is still rendered by the legacy navigation layer, continue using `useBlade()` + `useBladeNavigation()`.

### 📋 Inter-Blade Communication

**Before:**

```typescript
// Parent — implicit via defineExpose
defineExpose({ reload, save, title });

// Child — callback-based
emit("parent:call", {
  method: "reload",
  args: { id },
  callback: (result) => { /* ... */ },
});
```

**After:**

```typescript
// Parent — explicit registration
const { exposeToChildren } = useBladeContext();
exposeToChildren({ reload, save });
defineExpose({ title }); // title still needs defineExpose for VcBladeSlot

// Child — async/await
const { callParent } = useBladeContext();
const result = await callParent<void>("reload", { id });
```

> `VcBladeSlot` bridges `defineExpose()` to `BladeMessaging` automatically. If the parent uses `defineExpose({ reload })`, `callParent("reload")` works without explicit `exposeToChildren()`. However, `exposeToChildren()` is preferred for clarity.

---

## 2. Extension Points

The extension points system was completely replaced.

### API Mapping

| v1.x | v2.0.0 | Notes |
|------|--------|-------|
| `inject(extensionsHelperSymbol)` | Not needed | No injection required |
| `extensionsHelper.getOutboundExtensions(point)` | `defineExtensionPoint(name)` | Returns `{ components, hasComponents }` |
| `extensionsHelper.getInboundExtensions(ns, point)` | Removed | Use `meta` field or provide/inject |
| Module `extensions: { inbound, outbound }` | Removed | Use `useExtensionPoint()` in `install()` |
| `<component :is="ext.component" />` loop | `<ExtensionPoint name="..." />` | Declarative component |

### ⚠️ Host Side: Defining Extension Points

**Before:**

```vue
<template>
  <!-- Manual iteration -->
  <template v-for="ext in extensions" :key="ext.id">
    <component :is="ext.component" />
  </template>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import { extensionsHelperSymbol } from "@vc-shell/framework";

const extensionsHelper = inject(extensionsHelperSymbol);
const extensions = computed(
  () => extensionsHelper?.getOutboundExtensions("login-after-form") || [],
);
</script>
```

**After:**

```vue
<template>
  <!-- Single declarative component -->
  <ExtensionPoint name="auth:after-form" />
</template>

<script setup lang="ts">
import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

The `<ExtensionPoint>` component supports several rendering modes:

```vue
<!-- Plain mode: no wrapper -->
<ExtensionPoint name="seller:detail-cards" />

<!-- Layout mode: with separator and wrapper -->
<ExtensionPoint
  name="seller:detail-cards"
  separator
  wrapper-class="tw-mt-4"
  gap="1rem"
/>

<!-- Scoped slot: full rendering control -->
<ExtensionPoint name="seller:detail-cards">
  <template #default="{ components, hasComponents }">
    <div v-if="hasComponents" class="tw-grid tw-grid-cols-2 tw-gap-4">
      <component
        v-for="ext in components"
        :key="ext.id"
        :is="ext.component"
        v-bind="ext.props || {}"
      />
    </div>
  </template>
</ExtensionPoint>

<!-- Filter by meta fields -->
<ExtensionPoint
  name="seller:detail-cards"
  :filter="{ type: 'card' }"
/>
```

For programmatic access without the component:

```typescript
import { defineExtensionPoint } from "@vc-shell/framework";

const { components, hasComponents } = defineExtensionPoint("seller:detail-cards", {
  description: "Additional cards in seller details blade",
});
```

### ⚠️ Plugin Side: Registering Extensions

**Before:**

```typescript
// my-module/index.ts
export default {
  install(app, options) { /* ... */ },

  // Static extensions object
  extensions: {
    outbound: {
      "login-after-form": [
        { id: "RegistrationButton", component: RegistrationButton },
      ],
    },
    inbound: {
      "registration-form": useRegistrationForm(),
    },
  },
};
```

**After:**

```typescript
// my-module/index.ts
import { useExtensionPoint } from "@vc-shell/framework";
import RegistrationButton from "./components/RegistrationButton.vue";

export default {
  install(app, options) {
    // Register components into the host's extension point
    const { add } = useExtensionPoint("auth:after-form");

    add({
      id: "registration-button",
      component: RegistrationButton,
      props: { text: "Register" },
      priority: 10,               // lower = rendered first
      meta: { type: "action" },   // for filtering
    });
  },
  // No more `extensions` property
};
```

### New Capabilities

**Replace an extension** (same `id` replaces):

```typescript
const { add } = useExtensionPoint("auth:after-form");
add({
  id: "registration-button",  // same id = replacement
  component: CustomButton,
  priority: 10,
});
```

**Remove an extension:**

```typescript
const { remove } = useExtensionPoint("auth:after-form");
remove("registration-button");
```

### Type Changes

| v1.x | v2.0.0 |
|------|--------|
| `ExtensionPoint { id, component }` | `ExtensionComponent { id, component, props?, priority?, meta? }` |
| `ComposableFunction { id, fn }` | Removed — use provide/inject or shared composables |

---

## 3. Table

### 📋 VcTable → VcDataTable

`VcTable` is now a **deprecated adapter** (`VcTableAdapter.vue`) that wraps `VcDataTable`. Existing code using `:columns` prop and old event names continues to work but shows deprecation warnings.

The new `VcDataTable` uses a declarative `<VcColumn>` API inspired by PrimeVue DataTable.

**Before (VcTable with column config array):**

```vue
<template>
  <VcTable
    :columns="columns"
    :items="items"
    :sort="sortExpression"
    :loading="loading"
    :total-count="totalCount"
    :pages="pages"
    :current-page="currentPage"
    :search-value="searchValue"
    :multiselect="true"
    :expanded="isExpanded"
    :state-key="'my-table'"
    :selected-item-id="selectedItemId"
    @headerClick="onHeaderClick"
    @itemClick="onItemClick"
    @selectionChanged="onSelectionChanged"
    @search:change="onSearchChange"
    @paginationClick="onPageChange"
  >
    <template #item_name="{ item }">
      <span class="tw-font-bold">{{ item.name }}</span>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import type { ITableColumns } from "@vc-shell/framework";

const columns: ITableColumns[] = [
  { id: "name", title: "Name", sortable: true, alwaysVisible: true },
  { id: "price", title: "Price", type: "money", width: 120, align: "end" },
  { id: "createdDate", title: "Created", type: "date-time", sortable: true, width: 160 },
  { id: "status", title: "Status", type: "status-icon", width: 80, align: "center" },
];
</script>
```

**After (VcDataTable with declarative VcColumn):**

```vue
<template>
  <VcDataTable
    :items="items"
    :sort-field="sortField"
    :sort-order="sortOrder"
    :removable-sort="true"
    :loading="loading"
    :total-count="totalCount"
    :pagination="{ currentPage, pages }"
    :searchable="true"
    :search-value="searchValue"
    selection-mode="multiple"
    :show-all-columns="isExpanded"
    state-key="my-table"
    :row-class="highlightRow"
    @sort="onSort"
    @row-click="onRowClick"
    @update:selection="onSelectionChanged"
    @search="onSearchChange"
    @pagination-click="onPageChange"
  >
    <VcColumn id="name" field="name" title="Name" sortable always-visible>
      <template #body="{ data }">
        <span class="tw-font-bold">{{ data.name }}</span>
      </template>
    </VcColumn>

    <VcColumn id="price" field="price" title="Price" type="money" :width="120" align="end" />
    <VcColumn id="createdDate" field="createdDate" title="Created" type="datetime" sortable :width="160" />
    <VcColumn id="status" field="status" title="Status" type="status-icon" :width="80" align="center" />
  </VcDataTable>
</template>

<script setup lang="ts">
const sortField = ref<string | undefined>(undefined);
const sortOrder = ref<number>(0); // 1 = ASC, -1 = DESC, 0 = none

function onSort(event: { sortField?: string; sortOrder?: number }) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder ?? 0;
}
</script>
```

### Prop Mapping

| VcTable (v1.x) | VcDataTable (v2.0.0) | Notes |
|-----------------|----------------------|-------|
| `:columns="cols"` | `<VcColumn>` children | Declarative, no config arrays |
| `:sort="'name:ASC'"` | `:sort-field` + `:sort-order` | Separate field and numeric order (1/-1/0) |
| `:multiselect="true"` | `selection-mode="multiple"` | `"single"` or `"multiple"` |
| `:expanded="bool"` | `:show-all-columns="bool"` | Controls column visibility on blade narrow |
| `:selectedItemId` | `:row-class="fn"` | Supply a function returning a CSS class |
| `:itemActionBuilder` | `:row-actions` | Same shape: `(item) => Action[]` |
| `:pages` + `:currentPage` | `:pagination="{ pages, currentPage }"` | Single object prop |
| `:header="true"` | `:searchable="true"` | Explicit search bar toggle |
| `@headerClick` | `@sort` | Payload: `{ sortField, sortOrder }` |
| `@itemClick` | `@row-click` | Payload: `{ data, index, originalEvent }` |
| `@selectionChanged` | `@update:selection` | Standard v-model pattern |
| `@paginationClick` | `@pagination-click` | Same payload |
| `@search:change` | `@search` | Debounced 300ms by default |
| Column type `"date-time"` | VcColumn type `"datetime"` | No hyphen in VcColumn |

### Cell Slot Name Change

| v1.x | v2.0.0 |
|------|--------|
| `#item_<columnId>="{ item }"` | `#body="{ data, index }"` on the `<VcColumn>` |

```vue
<!-- Before -->
<VcTable :columns="columns" :items="items">
  <template #item_name="{ item }">{{ item.name }}</template>
</VcTable>

<!-- After -->
<VcDataTable :items="items">
  <VcColumn id="name" field="name" title="Name">
    <template #body="{ data }">{{ data.name }}</template>
  </VcColumn>
</VcDataTable>
```

### ⚠️ Sort: 2-State → 3-State

The sort cycle changed from 2-state (ASC → DESC → ASC) to 3-state (ASC → DESC → **clear** → ASC). The third click now removes the sort entirely.

This affects both:
- `useTableSort()` composable — `sortExpression` can now be `undefined`
- `VcDataTable` — `sortOrder` can be `0` (none)

If your code assumes sort is always set after a header click, add a null check:

```typescript
// Before — sortField was always defined after a click
if (sortField === "name") { /* ... */ }

// After — sortField can be undefined on third click
if (sortField) {
  // handle active sort
} else {
  // handle cleared sort (default/unsorted state)
}
```

To disable the 3-state cycle and keep the old 2-state behavior:

```vue
<VcDataTable :removable-sort="false" />
```

---

## 4. Components

### ⚠️ VcLoginForm Removed

`VcLoginForm` was deleted. Use `VcAuthLayout` instead.

**Before:**

```vue
<VcLoginForm :logo="logoUrl" :background="bgUrl" :title="'LOGIN'">
  <form @submit.prevent="handleLogin">
    <VcInput v-model="username" label="Username" />
    <VcInput v-model="password" label="Password" type="password" />
    <VcButton type="submit">Sign In</VcButton>
  </form>
</VcLoginForm>
```

**After:**

```vue
<VcAuthLayout
  :logo="logoUrl"
  :background="bgUrl"
  :title="'Sign In'"
  :subtitle="'Enter your credentials'"
  logo-alt="Company Logo"
>
  <form @submit.prevent="handleLogin">
    <VcInput v-model="username" label="Username" />
    <VcInput v-model="password" label="Password" type="password" />
    <VcButton type="submit">Sign In</VcButton>
  </form>

  <template #footer>
    <a href="/terms">Terms of Service</a>
  </template>
</VcAuthLayout>
```

New props: `subtitle`, `logoAlt`, `bgColor`. New slot: `#footer`. Theming via CSS custom properties:

```css
:root {
  --auth-layout-card-max-width: 420px;
  --auth-layout-card-radius: 12px;
  --auth-layout-title-color: var(--neutrals-900);
}
```

### 📋 GenericDropdown → VcDropdown

`GenericDropdown` is still exported with `@deprecated`. New code should use `VcDropdown`.

**Before:**

```vue
<GenericDropdown
  :opened="isOpen"
  :items="items"
  placement="bottom-start"
  @item-click="onSelect"
  @update:opened="isOpen = $event"
>
  <template #trigger="{ isActive }">
    <button :class="{ active: isActive }">Menu</button>
  </template>
</GenericDropdown>
```

**After:**

```vue
<VcDropdown
  v-model="isOpen"
  :items="items"
  placement="bottom-start"
  :close-on-select="true"
  :close-on-escape="true"
  role="listbox"
  @item-click="onSelect"
>
  <template #trigger="{ isActive, toggle }">
    <button :class="{ active: isActive }" @click="toggle">Menu</button>
  </template>
</VcDropdown>
```

Key additions in VcDropdown: `v-model` (replaces `:opened` + `@update:opened`), ARIA attributes, keyboard navigation, `closeOnSelect`/`closeOnEscape`/`closeOnClickOutside`, `@close` event with reason.

### 📋 Sidebar → VcSidebar

`Sidebar` is still exported with `@deprecated`. New code should use `VcSidebar`.

**Before:**

```vue
<Sidebar
  :is-expanded="showPanel"
  position="right"
  title="Filters"
  :close-cross="true"
  @close="showPanel = false"
>
  <template #content>
    <FilterForm />
  </template>
</Sidebar>
```

**After:**

```vue
<VcSidebar
  v-model="showPanel"
  position="right"
  size="md"
  title="Filters"
  :close-button="true"
  :show-overlay="true"
  :trap-focus="true"
  @close="onClose"
>
  <!-- Default slot replaces #content -->
  <FilterForm />

  <template #footer>
    <button @click="applyFilters">Apply</button>
  </template>
</VcSidebar>
```

Key additions: `v-model`, `size` presets (`"sm"` / `"md"` / `"lg"` / `"full"`), `#footer` slot, overlay, focus trapping, scroll lock, `position: "bottom"` for drawer, animated transitions, `@close` with reason.

---

## 5. Injection Keys

All injection keys were renamed to follow a `*Key` suffix convention. **Legacy aliases are preserved** — existing code continues to work.

| Old Name (deprecated) | New Name |
|------------------------|----------|
| `navigationViewLocation` | `NavigationViewLocationKey` |
| `BladeInstance` | `BladeInstanceKey` |
| `NotificationTemplatesSymbol` | `NotificationTemplatesKey` |
| `BLADE_BACK_BUTTON` | `BladeBackButtonKey` |
| `TOOLBAR_SERVICE` | `ToolbarServiceKey` |
| `EMBEDDED_MODE` | `EmbeddedModeKey` |

**Before:**

```typescript
import { BladeInstance, TOOLBAR_SERVICE, EMBEDDED_MODE } from "@vc-shell/framework";

const blade = inject(BladeInstance);
const toolbar = inject(TOOLBAR_SERVICE);
const embedded = inject(EMBEDDED_MODE);
```

**After:**

```typescript
import { BladeInstanceKey, ToolbarServiceKey, EmbeddedModeKey } from "@vc-shell/framework";

const blade = inject(BladeInstanceKey);
const toolbar = inject(ToolbarServiceKey);
const embedded = inject(EmbeddedModeKey);
```

New injection keys (no deprecated aliases — these are new in v2.0.0):

| Key | Type | Purpose |
|-----|------|---------|
| `BladeStackKey` | `InjectionKey<IBladeStack>` | BladeStack state machine (app-level) |
| `BladeMessagingKey` | `InjectionKey<IBladeMessaging>` | Inter-blade RPC (app-level) |
| `BladeDescriptorKey` | `InjectionKey<ComputedRef<BladeDescriptor>>` | Current blade descriptor (per-blade) |
| `WidgetServiceKey` | `InjectionKey<IWidgetService>` | Widget service |
| `DashboardServiceKey` | `InjectionKey<IDashboardService>` | Dashboard service |
| `GlobalSearchKey` | `InjectionKey<GlobalSearchState>` | Global search state |
| `MenuServiceKey` | `InjectionKey<MenuService>` | Menu service |
| `AppRootElementKey` | `InjectionKey<Ref<HTMLElement>>` | App root element for teleport |
| `AiAgentServiceKey` | `InjectionKey<IAiAgentService>` | AI agent service |

> Most consumers should use composables (`useBladeContext()`, `useMenuService()`, etc.) instead of injecting keys directly.

---

## 6. Module System

### ⚠️ `createAppModule` — No More `router.addRoute()`

Blades are no longer Vue Router routes. `createAppModule()` registers blades in `BladeRegistry` instead of calling `router.addRoute()`. Vue Router is used only for URL synchronization.

**Impact:** Code using `router.push({ name: "BladeName" })` to navigate to a blade will fail silently — the route no longer exists.

**Before:**

```typescript
import { useRouter } from "vue-router";
const router = useRouter();
router.push({ name: "OrderDetails", params: { id: orderId } });
```

**After:**

```typescript
import { useBladeContext } from "@vc-shell/framework";
const { openBlade } = useBladeContext();

openBlade({
  name: "OrderDetails",
  param: orderId,
});
```

### ✨ Module Dependencies

Modules can now declare load-order dependencies:

```typescript
export default createAppModule(pages, locales, undefined, undefined, {
  dependsOn: ["SellerDetails", "Products"],
});
```

### ✨ The `routable` Property

Controls whether a blade URL is persisted and can be restored from a deep link:

```typescript
defineOptions({
  name: "OrderList",
  url: "/orders",
  isWorkspace: true,
  routable: true,   // default — appears in URL, restorable from deep link
});

defineOptions({
  name: "LineItemEditor",
  url: "/line-item",
  routable: false,  // never restored from URL
});
```

---

## 7. New Features

These are purely additive and require no migration.

### New Components

| Component | Description |
|-----------|-------------|
| `VcDataTable` + `VcColumn` | Compositional table with declarative column API |
| `VcDropdown` | Accessible dropdown with ARIA, keyboard nav |
| `VcDropdownPanel` | Standalone floating panel |
| `VcPaginator` | Pagination component |
| `VcDatePicker` | Date picker |
| `VcColorInput` | Color picker input |
| `VcButtonGroup` | Button group container |
| `VcAuthLayout` | Auth page layout (replaces VcLoginForm) |
| `VcSidebar` | Full-featured sidebar/drawer |
| `ExtensionPoint` | Declarative extension point renderer |
| `VcBladeSlot` | New blade render wrapper |

### New Composables

| Composable | Description |
|------------|-------------|
| `useBladeContext()` | Extended blade API (open, close, callParent, etc.) |
| `defineExtensionPoint()` | Host-side extension point declaration |
| `useExtensionPoint()` | Plugin-side extension registration |
| Table composables | `useTableColumns`, `useTableColumnsResize`, `useTableColumnsReorder`, `useTableRowReorder`, `useTableInlineEdit`, `useVirtualScroll`, `useTableRowGrouping`, `useFilterState`, `useColumnFilter`, `useDataTableState` |

### New Systems

| System | Description |
|--------|-------------|
| **Shell Features** | Pluggable feature system for app-bar widgets, mobile buttons, settings menu |
| **AI Agent Plugin** | Optional AI agent integration (`aiAgent` option in framework config) |
| **Centralized Logger** | `createLogger("scope")` replacing raw `console.*` calls |
| **BladeStack** | State machine for blade navigation |
| **BladeMessaging** | Inter-blade async RPC |

### New Pages

| Page | Description |
|------|-------------|
| `ForgotPasswordPage` | Password recovery page |

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] **Extension Points** — Replace `extensionsHelper` / `useExtensionSlot` with `defineExtensionPoint` / `useExtensionPoint` / `<ExtensionPoint>`
- [ ] **Extension Registration** — Move module `extensions: {}` to imperative `useExtensionPoint().add()` inside `install()`
- [ ] **Blade Navigation** — Replace `router.push()` blade navigation with `openBlade()` from `useBladeContext()` or `useBladeNavigation()`
- [ ] **useBlade → useBladeContext** — Migrate composable calls; mind the inverted before-close guard boolean
- [ ] **Inter-blade communication** — Migrate `emit("parent:call")` to `callParent()`; add `exposeToChildren()` in parents
- [ ] **VcLoginForm** — Replace with `VcAuthLayout`
- [ ] **Sort handling** — Add null checks for cleared sort state (3-state cycle)
- [ ] **Injection keys** — Update to `*Key` suffix names (optional — old names still work)
- [ ] **GenericDropdown** — Migrate to `VcDropdown` (optional — old component still works)
- [ ] **Sidebar** — Migrate to `VcSidebar` (optional — old component still works)
- [ ] **VcTable** — Migrate to `VcDataTable` + `VcColumn` (optional — adapter still works)
- [ ] **Column type** — Change `"date-time"` to `"datetime"` if using VcColumn directly
