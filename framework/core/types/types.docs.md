# Core Types

Shared TypeScript interfaces and types used across the vc-shell framework for validation, menus, toolbars, tables, assets, and service abstractions.

## Overview

These types form the contract between framework services, UI components, and consuming modules. They are re-exported from `@vc-shell/framework`.

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

## Related

- `framework/ui/types/` -- UI-specific types (form fields, breadcrumbs)
- `framework/injection-keys.ts` -- Injection keys for framework services
- `framework/core/services/` -- Service implementations consuming these interfaces
