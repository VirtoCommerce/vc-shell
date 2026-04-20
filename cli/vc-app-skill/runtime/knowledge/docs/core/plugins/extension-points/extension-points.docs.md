# Extension Points Plugin

Extension points enable **cross-module UI composition** without direct imports. One module declares a named slot ("I accept plugins here"), and other modules inject components into that slot -- at any time, in any order. The system is fully reactive and order-independent.

This is how vc-shell achieves its modular architecture: modules can extend each other without compile-time dependencies.

## When to Use

- Module A needs to inject UI into Module B without a compile-time dependency (e.g., a "Reviews" tab inside a "Product Details" blade owned by another module)
- You need order-independent, runtime-resolved composition -- modules can load in any order
- When NOT to use: for simple parent-child communication within one module -- use props/slots/provide-inject instead; for data-only integration -- use events or a shared composable

---

## Table of Contents

- [Quick Start](#quick-start)
- [Concepts](#concepts)
  - [The Host/Plugin Pattern](#the-hostplugin-pattern)
  - [Order Independence](#order-independence)
  - [Priority-Based Sorting](#priority-based-sorting)
  - [Typed Metadata](#typed-metadata)
- [Features](#features)
  - [defineExtensionPoint (Host-Side Composable)](#defineextensionpoint-host-side-composable)
  - [useExtensionPoint (Plugin-Side Composable)](#useextensionpoint-plugin-side-composable)
  - [ExtensionPoint Component (Declarative)](#extensionpoint-component-declarative)
  - [Scoped Slots for Custom Rendering](#scoped-slots-for-custom-rendering)
  - [Metadata Filtering](#metadata-filtering)
  - [Framework-Owned Extension Point Constants](#framework-owned-extension-point-constants)
- [Recipes](#recipes)
  - [Adding a Custom Section to an Existing Blade](#adding-a-custom-section-to-an-existing-blade)
  - [Adding a Button to the Login Page](#adding-a-button-to-the-login-page)
  - [Multiple Plugins Registering into One Point](#multiple-plugins-registering-into-one-point)
  - [Replacing a Plugin Component](#replacing-a-plugin-component)
  - [Conditional Rendering with Metadata Filters](#conditional-rendering-with-metadata-filters)
- [Common Mistakes](#common-mistakes)
- [API Reference](#api-reference)
- [Related](#related)

---

## Quick Start

**Host module** -- declares an extension point in its blade template:

```vue
<!-- modules/seller-details/pages/SellerDetailsEdit.vue -->
<template>
  <VcBlade title="Seller Details">
    <form><!-- main form fields --></form>

    <!-- Other modules can inject components here -->
    <ExtensionPoint
      name="entity:custom-fields"
      separator
      gap="1rem"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

**Plugin module** -- registers a component into that extension point:

```typescript
// modules/entity-extensions/index.ts
import { defineAppModule, useExtensionPoint } from "@vc-shell/framework";
import CustomFields from "./components/CustomFields.vue";

const { add } = useExtensionPoint("entity:custom-fields");
add({
  id: "entity-extension",
  component: CustomFields,
  props: { showAdvanced: true },
  priority: 10,
});

export default defineAppModule({
  /* ... */
});
```

When the seller details page renders, `CustomFields` appears automatically below the main form -- with a separator and 1rem gap.

---

## Concepts

### The Host/Plugin Pattern

Extension points follow a two-role architecture:

```
HOST (declares)                      PLUGIN (registers)
-----------------                    ------------------
"I have a slot called                "I want to put my
 entity:custom-fields                   CustomFields
 where plugins can                    component in the
 inject content."                     entity:custom-fields slot."

      |                                       |
      v                                       v
defineExtensionPoint(name)          useExtensionPoint(name)
  or <ExtensionPoint name="...">      .add({ id, component })
```

- **Hosts** are pages or components that own a region of the UI and want to allow customization.
- **Plugins** are modules that provide additional UI for those regions.

Neither side imports the other. They communicate through a shared **name string**.

### Order Independence

Plugins can register components **before** the host declares the extension point. The reactive store handles this gracefully:

1. Plugin calls `useExtensionPoint("entity:custom-fields")` and `add(...)` -- the store creates an undeclared entry and stores the component.
2. Later, host calls `defineExtensionPoint("entity:custom-fields")` -- the store upgrades the entry to "declared" and preserves all previously registered components.
3. The host's `components` computed ref reactively picks up the registered components.

This means module load order does not matter. Remote modules loaded via Module Federation may install in any sequence, and extensions still work.

> **Dev warning:** In development mode, if a plugin registers into a point that is never declared, a console warning appears: `Extension point "xyz" is not declared.` This helps catch typos in extension point names.

### Priority-Based Sorting

Components are sorted by `priority` (ascending). Lower numbers render first:

```typescript
add({ id: "a", component: A, priority: 20 }); // Renders second
add({ id: "b", component: B, priority: 10 }); // Renders first
add({ id: "c", component: C }); // priority=0, renders first (tie)
```

Default priority is `0`. Components with the same priority render in registration order.

### Typed Metadata

Extension components can carry arbitrary metadata. The host can type-check it with a generic parameter:

```typescript
interface TabMeta {
  type: "tab" | "section";
  label: string;
}

const { components } = defineExtensionPoint<TabMeta>("order:details-tabs");

// TypeScript knows: components.value[0].meta?.type is "tab" | "section"
for (const ext of components.value) {
  console.log(ext.meta?.label); // Fully typed
}
```

---

## Features

### defineExtensionPoint (Host-Side Composable)

Used in pages or components that **accept** plugin content. Declares the extension point and returns reactive accessors.

```typescript
import { defineExtensionPoint } from "@vc-shell/framework";

const { components, hasComponents } = defineExtensionPoint("entity:custom-fields", {
  description: "Commission fee fields in the seller details form",
});

// components: ComputedRef<ExtensionComponent[]>  -- sorted by priority
// hasComponents: ComputedRef<boolean>             -- true when at least one registered
```

Use in templates:

```vue
<template>
  <div
    v-if="hasComponents"
    class="extensions-area"
  >
    <component
      v-for="ext in components"
      :key="ext.id"
      :is="ext.component"
      v-bind="ext.props || {}"
    />
  </div>
</template>
```

> **Tip:** Prefer the `<ExtensionPoint>` component (below) for simple rendering. Use the composable directly when you need programmatic access to the registered components.

### useExtensionPoint (Plugin-Side Composable)

Used in modules that **provide** content to an extension point. Returns `add` and `remove` functions.

```typescript
import { useExtensionPoint } from "@vc-shell/framework";
import MyComponent from "./MyComponent.vue";

const { add, remove } = useExtensionPoint("entity:custom-fields");

// Register a component
add({
  id: "my-unique-id",
  component: MyComponent,
  props: { editable: true },
  priority: 10,
  meta: { type: "form-section" },
});

// Later, remove it (e.g., during cleanup)
remove("my-unique-id");
```

**`add()` behavior:**

- If a component with the same `id` already exists, it is **replaced** (not duplicated).
- This makes `add()` idempotent -- safe to call multiple times.

**`remove()` behavior:**

- Removes the component by `id`. No-op if not found.

### ExtensionPoint Component (Declarative)

The `<ExtensionPoint>` component is the easiest way to render extensions in a template. It declares the extension point AND renders its components in one step:

```vue
<template>
  <ExtensionPoint name="entity:custom-fields" />
</template>

<script setup lang="ts">
import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

**Props:**

| Prop             | Type                      | Default       | Description                                |
| ---------------- | ------------------------- | ------------- | ------------------------------------------ |
| `name`           | `string`                  | required      | Extension point name                       |
| `separator`      | `boolean`                 | `false`       | Adds an `<hr>` before components           |
| `separatorClass` | `string`                  | default style | Custom CSS class for the `<hr>`            |
| `wrapperClass`   | `string`                  | none          | CSS class for the wrapper `<div>`          |
| `gap`            | `string`                  | none          | CSS gap between components (e.g. `"1rem"`) |
| `filter`         | `Record<string, unknown>` | none          | Filter components by `meta` fields         |

**Rendering modes:**

The component has three rendering modes, chosen automatically:

1. **Scoped slot** -- when `v-slot` is used, the host has full rendering control (see below).
2. **Layout mode** -- when `separator`, `wrapperClass`, or `gap` is set, components are wrapped in a styled `<div>`.
3. **Plain mode** -- components are rendered directly with no wrapper (backward-compatible).

```vue
<!-- Layout mode: separator + gap -->
<ExtensionPoint name="entity:custom-fields" separator gap="1rem" wrapper-class="tw-p-4" />

<!-- Plain mode: no wrapper -->
<ExtensionPoint name="entity:custom-fields" />
```

### Scoped Slots for Custom Rendering

When you need full control over how extensions are rendered, use the scoped slot:

```vue
<template>
  <ExtensionPoint
    name="order:actions"
    v-slot="{ components, hasComponents }"
  >
    <div
      v-if="hasComponents"
      class="action-bar tw-flex tw-gap-2"
    >
      <component
        v-for="ext in components"
        :key="ext.id"
        :is="ext.component"
        v-bind="ext.props || {}"
      />
    </div>
  </ExtensionPoint>
</template>
```

The scoped slot receives:

| Slot prop       | Type                   | Description                   |
| --------------- | ---------------------- | ----------------------------- |
| `components`    | `ExtensionComponent[]` | Sorted, filtered list         |
| `hasComponents` | `boolean`              | Whether the list is non-empty |

### Metadata Filtering

The `<ExtensionPoint>` component supports filtering by metadata fields. Only components whose `meta` matches all specified key-value pairs are rendered:

```typescript
// Plugin registers two components with different meta
const { add } = useExtensionPoint("order:details");
add({ id: "info-panel", component: InfoPanel, meta: { type: "info" } });
add({ id: "action-btn", component: ActionBtn, meta: { type: "action" } });
```

```vue
<!-- Host renders only "action" type components -->
<ExtensionPoint name="order:details" :filter="{ type: 'action' }" />
<!-- Only ActionBtn is rendered -->
```

Filtering uses strict equality (`===`) on each key-value pair and requires all pairs to match.

### Framework-Owned Extension Point Constants

The framework defines typed constants for its own extension points. Use these instead of raw strings for IDE autocomplete and typo safety:

```typescript
import { ExtensionPoints } from "@vc-shell/framework";

// Instead of: useExtensionPoint("auth:after-form")
const { add } = useExtensionPoint(ExtensionPoints.AUTH_AFTER_FORM);
```

Currently defined constants:

| Constant                          | Value               | Location                           |
| --------------------------------- | ------------------- | ---------------------------------- |
| `ExtensionPoints.AUTH_AFTER_FORM` | `"auth:after-form"` | Login page, below the sign-in form |

App-level extension point names (e.g., `"entity:custom-fields"`) are the app's responsibility to define. Consider creating a shared constants file in your application.

---

## Recipes

### Adding a Custom Section to an Existing Blade

Scenario: You want to add commission fee fields to the Seller Details page, which is owned by another module.

**Step 1:** The Seller Details module declares the extension point:

```vue
<!-- seller-details/pages/SellerDetailsEdit.vue -->
<template>
  <VcBlade title="Seller Details">
    <form>
      <!-- Standard fields: name, email, etc. -->
    </form>

    <ExtensionPoint
      v-if="sellerDetails?.id"
      name="entity:custom-fields"
      wrapper-class="tw-p-2"
    />
  </VcBlade>
</template>
```

**Step 2:** The Commissions module registers its component:

```typescript
// commissions/index.ts
import { defineAppModule, useExtensionPoint } from "@vc-shell/framework";
import CustomFields from "./components/CustomFields.vue";
import en from "./locales/en.json";

const { add } = useExtensionPoint("entity:custom-fields");
add({
  id: "commission-fields",
  component: CustomFields,
  props: { editable: true },
  priority: 10,
});

export default defineAppModule({ locales: { en } });
```

**Step 3:** `CustomFields.vue` receives props and renders:

```vue
<!-- commissions/components/CustomFields.vue -->
<template>
  <div class="commission-fields">
    <h3>{{ $t("COMMISSIONS.TITLE") }}</h3>
    <VcInput
      v-if="editable"
      v-model="rate"
      label="Commission Rate (%)"
    />
    <span v-else>{{ rate }}%</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ editable?: boolean }>();
const rate = ref(5);
</script>
```

### Adding a Button to the Login Page

The framework provides the `auth:after-form` extension point on the sign-in page:

```typescript
// registration-module/index.ts
import { defineAppModule, useExtensionPoint, ExtensionPoints } from "@vc-shell/framework";
import RegistrationButton from "./components/RegistrationButton.vue";

const { add } = useExtensionPoint(ExtensionPoints.AUTH_AFTER_FORM);
add({
  id: "registration-button",
  component: RegistrationButton,
  meta: { type: "action" },
});

export default defineAppModule({});
```

### Multiple Plugins Registering into One Point

Multiple modules can register into the same extension point. Components are sorted by priority:

```typescript
// Module A
const { add } = useExtensionPoint("order:sidebar");
add({ id: "shipping-info", component: ShippingInfo, priority: 10 });

// Module B
const { add } = useExtensionPoint("order:sidebar");
add({ id: "payment-info", component: PaymentInfo, priority: 20 });

// Module C
const { add } = useExtensionPoint("order:sidebar");
add({ id: "notes", component: OrderNotes, priority: 30 });
```

The host renders them in order: ShippingInfo, PaymentInfo, OrderNotes.

### Replacing a Plugin Component

If you call `add()` with an `id` that already exists, the component is replaced:

```typescript
const { add } = useExtensionPoint("entity:custom-fields");

// Original registration (e.g., from another module or earlier in the code)
add({ id: "commission-fields", component: OldCustomFields, priority: 10 });

// Override with a new component (same id)
add({ id: "commission-fields", component: NewCustomFields, priority: 10 });
// Only NewCustomFields is rendered
```

This is useful for overriding default behavior provided by a base module.

### Conditional Rendering with Metadata Filters

Use metadata to categorize extensions and filter them in different locations:

```typescript
// Plugin registers multiple components with different categories
const { add } = useExtensionPoint("product:details");
add({ id: "specs-tab", component: SpecsTab, meta: { zone: "tabs" }, priority: 10 });
add({ id: "review-tab", component: ReviewTab, meta: { zone: "tabs" }, priority: 20 });
add({ id: "quick-action", component: QuickAction, meta: { zone: "toolbar" } });
```

```vue
<!-- Host renders different zones in different locations -->
<template>
  <VcBlade title="Product Details">
    <div class="toolbar">
      <ExtensionPoint
        name="product:details"
        :filter="{ zone: 'toolbar' }"
      />
    </div>

    <div class="tabs">
      <ExtensionPoint
        name="product:details"
        :filter="{ zone: 'tabs' }"
      />
    </div>
  </VcBlade>
</template>
```

---

## Common Mistakes

### Typo in extension point name

```typescript
// WRONG -- typo: "seller:comissions" (single 'm')
const { add } = useExtensionPoint("seller:comissions");
add({ id: "my-fields", component: MyFields });
// Component is registered but never rendered because the host declared "entity:custom-fields"
```

The dev-mode console warning (`Extension point "seller:comissions" is not declared`) will alert you to this. Always check the console in development.

> **Tip:** Define constants for your extension point names in a shared file:
>
> ```typescript
> // shared/extension-points.ts
> export const EP = {
>   ENTITY_CUSTOM_FIELDS: "entity:custom-fields",
>   ORDER_SIDEBAR: "order:sidebar",
> } as const;
> ```

### Forgetting to import ExtensionPoint in the template

```vue
<!-- WRONG -- ExtensionPoint is not imported -->
<template>
  <ExtensionPoint name="entity:custom-fields" />
</template>

<script setup lang="ts">
// Missing: import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

### Duplicate IDs across plugins

```typescript
// Module A
add({ id: "my-component", component: ComponentA });

// Module B
add({ id: "my-component", component: ComponentB });
// ComponentA is REPLACED by ComponentB!
```

Use globally unique IDs. A good convention is `module-name:component-name`:

```typescript
add({ id: "module:custom-fields", component: CustomFields });
add({ id: "shipping:delivery-estimate", component: DeliveryEstimate });
```

### Using defineExtensionPoint in a non-setup context

```typescript
// WRONG -- called outside of setup or install
function someUtility() {
  const { components } = defineExtensionPoint("my-point");
}
```

`defineExtensionPoint` calls `declarePoint()` on the reactive store, which is fine anywhere. But if you need the `components` computed to be reactive, it should be called inside a Vue setup context or a composable.

---

## API Reference

### `defineExtensionPoint<M>(name, options?): DefineExtensionPointReturn<M>`

Declares an extension point (host-side). Returns reactive computed refs.

```typescript
function defineExtensionPoint<M = Record<string, unknown>>(name: string, options?: ExtensionPointOptions): DefineExtensionPointReturn<M>;

interface DefineExtensionPointReturn<M> {
  /** Sorted list of registered components (by priority, ascending) */
  components: ComputedRef<Array<ExtensionComponent & { meta?: M }>>;
  /** True when at least one component is registered */
  hasComponents: ComputedRef<boolean>;
}

interface ExtensionPointOptions {
  /** Human-readable description for dev tools */
  description?: string;
}
```

---

### `useExtensionPoint(name): { add, remove }`

Accesses an extension point (plugin-side). Returns functions to manage components.

```typescript
function useExtensionPoint(name: string): {
  add: (entry: ExtensionComponent) => void;
  remove: (id: string) => void;
};
```

---

### `ExtensionComponent`

The data structure representing a registered component:

```typescript
interface ExtensionComponent {
  /** Unique identifier (used for replacement and removal) */
  id: string;
  /** Vue component to render */
  component: Component;
  /** Props passed to the component via v-bind */
  props?: Record<string, unknown>;
  /** Sort order (lower = rendered first). Default: 0 */
  priority?: number;
  /** Arbitrary metadata for filtering */
  meta?: Record<string, unknown>;
}
```

---

### `<ExtensionPoint>` Component

| Prop             | Type                      | Default        | Description                   |
| ---------------- | ------------------------- | -------------- | ----------------------------- |
| `name`           | `string`                  | required       | Extension point name          |
| `separator`      | `boolean`                 | `false`        | Adds `<hr>` before components |
| `separatorClass` | `string`                  | built-in style | CSS class for the separator   |
| `wrapperClass`   | `string`                  | none           | CSS class for the wrapper div |
| `gap`            | `string`                  | none           | CSS gap value (e.g. `"1rem"`) |
| `filter`         | `Record<string, unknown>` | none           | Filter by meta field equality |

**Scoped slot:**

```typescript
defineSlots<{
  default?: (props: { components: ExtensionComponent[]; hasComponents: boolean }) => any;
}>();
```

---

### `ExtensionPoints` (Constants)

```typescript
const ExtensionPoints = {
  AUTH_AFTER_FORM: "auth:after-form",
} as const;

type ExtensionPointName = "auth:after-form";
```

---

### Store Functions (Internal)

These are used internally by `defineExtensionPoint` and `useExtensionPoint`. You typically do not call them directly, but they are available for testing and dev tools:

| Function                      | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `declarePoint(name, options)` | Declare a point. No-op if already declared.              |
| `getPoint(name)`              | Get reactive state. Creates undeclared entry if missing. |
| `getRegistry()`               | Get the full reactive registry (for dev tools).          |

---

## Related

| Resource                 | Path                                               | Description                                   |
| ------------------------ | -------------------------------------------------- | --------------------------------------------- |
| Modularity Plugin        | `core/plugins/modularity/`                         | Module definition and registration            |
| Extension Point Store    | `core/plugins/extension-points/store.ts`           | Reactive registry implementation              |
| ExtensionPoint Component | `core/plugins/extension-points/ExtensionPoint.vue` | Declarative render component                  |
| Types                    | `core/plugins/extension-points/types.ts`           | `ExtensionComponent`, `ExtensionPointOptions` |
