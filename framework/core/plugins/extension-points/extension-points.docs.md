# Extension Points Plugin

A decoupled plugin system for injecting Vue components into designated slots across the application. Enables modules to extend host pages without direct imports.

## Overview

Extension points follow a host/plugin pattern. A **host** page declares named extension points where plugin content can appear. A **plugin** module registers components into those points during its `install()` phase. The system is order-independent -- plugins can register before the host declares the point.

The reactive store ensures that components appear automatically when registered, with priority-based ordering and optional metadata filtering.

## API

### Host-Side: `defineExtensionPoint(name, options?)`

Declares an extension point and returns reactive accessors for registered components.

```typescript
function defineExtensionPoint<M = Record<string, unknown>>(
  name: string,
  options?: ExtensionPointOptions,
): DefineExtensionPointReturn<M>;
```

| Return | Type | Description |
|--------|------|-------------|
| `components` | `ComputedRef<ExtensionComponent[]>` | Sorted list of registered components (by `priority`) |
| `hasComponents` | `ComputedRef<boolean>` | `true` when at least one component is registered |

### Plugin-Side: `useExtensionPoint(name)`

Accesses an extension point to register or remove components.

```typescript
function useExtensionPoint(name: string): {
  add: (entry: ExtensionComponent) => void;
  remove: (id: string) => void;
};
```

### `ExtensionComponent` Interface

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (used for replacement and removal) |
| `component` | `Component` | Vue component to render |
| `props` | `Record<string, unknown>` | Props passed via `v-bind` |
| `priority` | `number` | Sort order (lower = rendered first, default: `0`) |
| `meta` | `Record<string, unknown>` | Arbitrary metadata for filtering |

### `<ExtensionPoint>` Component

Declarative alternative to `defineExtensionPoint()`. Declares the point and renders its components.

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Extension point name |
| `separator` | `boolean` | Adds an `<hr>` before components |
| `separatorClass` | `string` | Custom CSS class for the separator |
| `wrapperClass` | `string` | CSS class for the wrapper `<div>` |
| `gap` | `string` | CSS gap between components (e.g. `"1rem"`) |
| `filter` | `Record<string, unknown>` | Filter components by `meta` fields |

### Framework-Owned Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `ExtensionPoints.AUTH_AFTER_FORM` | `"auth:after-form"` | Slot after the sign-in form on the login page |

## Usage

### Host: Declaring an Extension Point in a Page

```vue
<template>
  <div class="seller-details">
    <form><!-- main form fields --></form>

    <!-- Render any plugins registered for this point -->
    <ExtensionPoint
      name="seller:commissions"
      separator
      gap="1rem"
    />
  </div>
</template>

<script setup lang="ts">
import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

### Host: Using the Composable Directly

```typescript
import { defineExtensionPoint } from "@vc-shell/framework";

const { components, hasComponents } = defineExtensionPoint("seller:commissions", {
  description: "Commission fee fields in seller details",
});
```

### Plugin: Registering a Component

```typescript
// In module install() or setup
import { useExtensionPoint } from "@vc-shell/framework";
import CommissionFields from "./components/CommissionFields.vue";

const { add } = useExtensionPoint("seller:commissions");

add({
  id: "marketplace-commission",
  component: CommissionFields,
  props: { showAdvanced: true },
  priority: 10,
  meta: { type: "form-section" },
});
```

### Scoped Slot for Custom Rendering

```vue
<template>
  <ExtensionPoint name="seller:actions" v-slot="{ components, hasComponents }">
    <div v-if="hasComponents" class="action-bar">
      <component
        v-for="ext in components"
        :key="ext.id"
        :is="ext.component"
        v-bind="ext.props"
      />
    </div>
  </ExtensionPoint>
</template>
```

### Typed Metadata

```typescript
interface ActionMeta { type: "action" | "info" }

const { components } = defineExtensionPoint<ActionMeta>("seller:actions");
// components.value[0].meta?.type is typed as "action" | "info"
```

## Related

- `framework/core/plugins/extension-points/store.ts` -- reactive registry (`declarePoint`, `getPoint`, `getRegistry`)
- `framework/core/plugins/extension-points/ExtensionPoint.vue` -- declarative render component
- `framework/core/plugins/extension-points/types.ts` -- `ExtensionComponent`, `ExtensionPointOptions`, `ExtensionPointState`
