# Core Types

Shared TypeScript interfaces and types used across the vc-shell framework for validation, menus, toolbars, tables, assets, and service abstractions.

## Overview

These types form the contract between framework services, UI components, and consuming modules. They define the shape of data structures used throughout the application: how menu items are configured, how table columns are defined, what toolbar buttons look like, and how services communicate.

All types are re-exported from `@vc-shell/framework`, so module developers import them directly from the framework package.

**Files:** `index.ts`, `menu-types.ts`, `services.ts`

## Key Interfaces

### Validation

| Type | Description |
|------|-------------|
| `IValidationRules` | Validation rule map for form fields. Supports `required`, `email`, `min`, `max`, `regex`, `between`, `confirmed`, `ext`, `mimes`, `dimensions`, `before`/`after` date comparison, and more. |

### Menu System (`menu-types.ts`)

| Type | Description |
|------|-------------|
| `MenuItemConfig` | Configuration for registering a menu item: `title`, `icon`, `priority`, `permissions`, `group`/`groupConfig`, `badge`. |
| `MenuItemBadge` | Badge display config: `content` (static, ref, computed, or function), `variant`, `isDot`. |
| `MenuItemBadgeConfig` | Union: full `MenuItemBadge` object or shorthand `number \| string \| Ref \| ComputedRef \| function`. |
| `MenuItem` | Runtime menu item extending `MenuItemConfig` with `routeId`, `url`, `children[]`, `groupIcon`, `groupId`. |

### Toolbar

| Type | Description |
|------|-------------|
| `IBladeToolbar` | Toolbar button config: `id`, `icon`, `disabled`, `title`, `isVisible`, `clickHandler`, `separator`, `permissions`. |
| `ToolbarMenu<T>` | Generic toolbar menu item that infers component props from the provided component type. |

### Table Columns

| Type | Description |
|------|-------------|
| `ITableColumnsBase` | Column definition: `id`, `title`, `width`, `field`, `type` (money, date, image, status, etc.), `sortable`, `editable`, `rules`, `filter`, `mobilePosition`, `mobileVisible`. |
| `ITableColumns` | Union of `ITableColumnsBase` with specialized image and money column variants. |
| `IColumnFilterConfig` | Column filter: `true` (text), `string` (custom field), `{ options }` (select), `{ range }` (date range). |
| `IFilterOption` | Select filter option: `{ value, label }`. |

### Assets

| Type | Description |
|------|-------------|
| `ICommonAsset` | Asset record: `url`, `relativeUrl`, `title`, `name`, `size`, `sortOrder`, `typeId`, dates. |
| `AssetsHandler<T>` | Asset operations: `upload()`, `edit()`, `remove()`, `loading` ref, `noRemoveConfirmation`. |

### Service Abstractions (`services.ts`)

| Type | Description |
|------|-------------|
| `ServiceLifecycle<T>` | Service create/provide/cleanup lifecycle. |
| `PreregistrationQueue<T>` | Queue for items registered before a service initializes: `register()`, `flush()`, `clear()`. |
| `RegistryService<TKey, TItem>` | Generic registry: `register()`, `unregister()`, `get()`, `has()`, `getAll()`, `clear()`. |
| `ListService<T>` | Reactive list: `items` ref, `add()`, `remove()`, `find()`, `filter()`. |
| `OrderedListService<T>` | Extends `ListService` with `reorder()` and `getSorted()`. |
| `ObservableService<T>` | Subscribe/getValue pattern for change observation. |
| `ServiceResult<T>` | Async operation result: `success`, `data?`, `error?` with code/message/details. |
| `WidgetRegistration` | Widget entry: `id`, `component`, `props`, `order`, `isVisible`. |
| `MenuItemRegistration` | Menu item entry: `id`, `title`, `icon`, `priority`, `permissions`, `routeId`, `group`, `children`. |
| `ToolbarItemRegistration` | Toolbar item entry: `id`, `title`, `icon`, `order`, `disabled`, `clickHandler`, `permissions`. |

### Other

| Type | Description |
|------|-------------|
| `IBladeDropdownItem` | Blade dropdown option: `id`, `title`, `icon`, `clickHandler`. |
| `IMenuItem<T>` | Generic menu item with optional component slot. |
| `NotificationTemplateConstructor` | Component constructor with a `notifyType` static field. |
| `IActionBuilderResult<T>` | Row action definition: `icon`, `title`, `type` (danger/success/warning/info), `clickHandler`. |
| `RequestPasswordResult` | Password reset result: `succeeded`, `error`, `errorCode`. |

## Usage Examples

### Defining table columns

```typescript
import type { ITableColumns } from "@vc-shell/framework";

const columns: ITableColumns[] = [
  {
    id: "name",
    title: "Product Name",
    sortable: true,
    type: "text",
  },
  {
    id: "price",
    title: "Price",
    type: "money",
    sortable: true,
    width: 120,
  },
  {
    id: "image",
    title: "Image",
    type: "image",
    width: 80,
  },
  {
    id: "status",
    title: "Status",
    type: "status",
    width: 100,
    filter: {
      options: [
        { value: "active", label: "Active" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ],
    },
  },
  {
    id: "createdDate",
    title: "Created",
    type: "date-time",
    sortable: true,
    width: 150,
  },
];
```

### Configuring toolbar buttons

```typescript
import type { IBladeToolbar } from "@vc-shell/framework";

const toolbarItems: IBladeToolbar[] = [
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    clickHandler: async () => await saveProduct(),
    permissions: "product:update",
  },
  {
    id: "delete",
    title: "Delete",
    icon: "lucide-trash",
    clickHandler: () => confirmDelete(),
    permissions: ["product:delete", "product:manage"],
    isVisible: computed(() => !isNewProduct.value),
  },
];
```

### Registering menu items

```typescript
import type { MenuItemConfig } from "@vc-shell/framework";

const menuConfig: MenuItemConfig = {
  title: "Orders",
  icon: "lucide-shopping-cart",
  priority: 10,
  permissions: ["order:read"],
  group: "Commerce",
  badge: {
    content: computed(() => pendingOrderCount.value),
    variant: "warning",
  },
};
```

## Tip: ITableColumnsBase type field

The `type` field in `ITableColumnsBase` uses `"date-time"` (with hyphen), but the VcColumn component uses `"datetime"` (no hyphen). The VcTableAdapter handles this mapping automatically. If you use VcDataTable directly with VcColumn slot syntax, use `"datetime"`:

```vue
<!-- VcColumn uses "datetime" -->
<VcColumn id="created" title="Created" type="datetime" />

<!-- ITableColumnsBase uses "date-time" -->
<!-- { id: "created", title: "Created", type: "date-time" } -->
```

## Related

- `framework/ui/types/` -- UI-specific types (form fields, breadcrumbs)
- `framework/injection-keys.ts` -- Injection keys for framework services
- `framework/core/services/` -- Service implementations consuming these interfaces
