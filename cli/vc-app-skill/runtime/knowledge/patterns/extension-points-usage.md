# Extension Points Usage Pattern

Cross-module UI composition without compile-time dependencies. One module declares a named slot (host), other modules inject components into it (plugin). Fully reactive and order-independent.

---

## When to Use

- Module A needs to inject UI into Module B without importing it (e.g., a "Commissions" section inside a "Seller Details" blade owned by another module).
- Modules load in any order (including remote Module Federation modules).

**Do not use** for simple parent-child communication within one module -- use props/slots/provide-inject instead.

---

## Core Concepts

### Two Roles

| Role | API | Purpose |
|------|-----|---------|
| **Host** | `<ExtensionPoint>` or `defineExtensionPoint()` | Declares a named region that accepts plugins |
| **Plugin** | `useExtensionPoint()` | Registers components into a named region |

Neither side imports the other. They communicate through a shared **name string**.

### Order Independence

Plugins can register components **before** the host declares the point. The reactive store preserves pre-registered components and upgrades the entry when the host declares.

### Priority Sorting

Components are sorted by `priority` (ascending, default `0`). Same priority = registration order.

---

## Inbound Extensions (Host Accepts Plugins)

A module declares a named extension point in its blade template. Other modules inject components into it.

### Declarative: `<ExtensionPoint>` Component

The simplest approach -- declares the point and renders registered components in one step:

```vue
<!-- seller-details/pages/seller-details-edit.vue -->
<template>
  <VcBlade title="Seller Details">
    <form><!-- main form fields --></form>

    <ExtensionPoint
      v-if="sellerDetails?.id"
      name="entity:custom-fields"
      wrapper-class="tw-p-2"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | Extension point name |
| `separator` | `boolean` | `false` | Adds `<hr>` before components |
| `separatorClass` | `string` | built-in | Custom CSS class for `<hr>` |
| `wrapperClass` | `string` | none | CSS class for wrapper div |
| `gap` | `string` | none | CSS gap (e.g. `"1rem"`) |
| `filter` | `Record<string, unknown>` | none | Filter by meta field equality |

### Composable: `defineExtensionPoint()`

For programmatic access to registered components (e.g., building tabs dynamically):

```typescript
import { defineExtensionPoint } from "@vc-shell/framework";

interface TabMeta {
  zone: "tabs" | "toolbar";
  label: string;
}

const { components, hasComponents } = defineExtensionPoint<TabMeta>("product:details");

// components.value is ComputedRef<ExtensionComponent[]>, sorted by priority
// hasComponents.value is ComputedRef<boolean>
```

### Scoped Slot for Custom Rendering

When the host needs full control over layout:

```vue
<ExtensionPoint name="order:actions" v-slot="{ components, hasComponents }">
  <div v-if="hasComponents" class="tw-flex tw-gap-2">
    <component
      v-for="ext in components"
      :key="ext.id"
      :is="ext.component"
      v-bind="ext.props || {}"
    />
  </div>
</ExtensionPoint>
```

---

## Outbound Extensions (Plugin Provides Components)

A module registers components into an extension point declared by another module (or the framework itself).

### Basic Registration

```typescript
// commissions-module/index.ts
import { defineAppModule, useExtensionPoint } from "@vc-shell/framework";
import CustomFields from "./components/CustomFields.vue";

const { add } = useExtensionPoint("entity:custom-fields");
add({
  id: "module:custom-fields",
  component: CustomFields,
  props: { editable: true },
  priority: 10,
});

export default defineAppModule({ /* locales, blades, etc. */ });
```

### Using Framework Constants

The framework exposes typed constants for its own extension points:

```typescript
import { useExtensionPoint, ExtensionPoints } from "@vc-shell/framework";
import RegistrationButton from "./components/RegistrationButton.vue";

const { add } = useExtensionPoint(ExtensionPoints.AUTH_AFTER_FORM);
add({
  id: "registration:signup-button",
  component: RegistrationButton,
  meta: { type: "action" },
});
```

Currently defined framework constants:

| Constant | Value | Location |
|----------|-------|----------|
| `ExtensionPoints.AUTH_AFTER_FORM` | `"auth:after-form"` | Login page, below sign-in form |

### Removing a Registration

```typescript
const { add, remove } = useExtensionPoint("entity:custom-fields");
add({ id: "my-fields", component: MyFields });

// Later (e.g., during cleanup):
remove("my-fields");
```

---

## Passing Props and Context to Injected Components

Props are passed via the `props` field in `add()` and bound with `v-bind`:

```typescript
add({
  id: "commission-fields",
  component: CustomFields,
  props: { editable: true, entityId: "abc-123" },
  priority: 10,
});
```

The injected component receives them as standard Vue props:

```vue
<script setup lang="ts">
const props = defineProps<{
  editable?: boolean;
  entityId?: string;
}>();
</script>
```

For dynamic context that changes after registration, use reactive values or provide/inject within the host blade.

---

## Metadata Filtering

Categorize extensions with `meta` and render different subsets in different locations:

```typescript
const { add } = useExtensionPoint("product:details");
add({ id: "specs-tab",    component: SpecsTab,    meta: { zone: "tabs" },    priority: 10 });
add({ id: "review-tab",   component: ReviewTab,   meta: { zone: "tabs" },    priority: 20 });
add({ id: "quick-action", component: QuickAction,  meta: { zone: "toolbar" } });
```

```vue
<template>
  <VcBlade title="Product Details">
    <div class="toolbar">
      <ExtensionPoint name="product:details" :filter="{ zone: 'toolbar' }" />
    </div>
    <div class="tabs">
      <ExtensionPoint name="product:details" :filter="{ zone: 'tabs' }" />
    </div>
  </VcBlade>
</template>
```

Filtering uses strict equality (`===`) on every key-value pair; all pairs must match.

---

## Recipe: Adding a Custom Tab to Another Module's Blade

**Step 1 -- Host module declares the point:**

```vue
<!-- orders/pages/order-details.vue -->
<template>
  <VcBlade title="Order Details">
    <VcForm><!-- core order fields --></VcForm>

    <ExtensionPoint
      name="order:details-tabs"
      gap="1rem"
      wrapper-class="tw-mt-4"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ExtensionPoint } from "@vc-shell/framework";
</script>
```

**Step 2 -- Plugin module registers a tab component:**

```typescript
// shipping-module/index.ts
import { defineAppModule, useExtensionPoint } from "@vc-shell/framework";
import ShippingTab from "./components/ShippingTab.vue";

const { add } = useExtensionPoint("order:details-tabs");
add({
  id: "shipping:tracking-tab",
  component: ShippingTab,
  props: { showMap: true },
  priority: 20,
});

export default defineAppModule({ /* ... */ });
```

**Step 3 -- The injected component:**

```vue
<!-- shipping-module/components/ShippingTab.vue -->
<template>
  <VcCard header="Shipping & Tracking">
    <div class="tw-p-4">
      <p>Carrier: {{ carrier }}</p>
      <div v-if="showMap"><!-- map widget --></div>
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
defineProps<{ showMap?: boolean }>();
const carrier = ref("FedEx");
</script>
```

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Typo in extension point name | Component registered but never rendered | Check dev console for `"Extension point X is not declared"` warning. Use shared constants. |
| Duplicate `id` across modules | Later registration silently replaces the earlier one | Prefix IDs with module name: `"shipping:tracking-tab"` |
| Forgetting `import { ExtensionPoint }` in host template | Vue renders nothing (unknown component) | Add the import in `<script setup>` |
| Calling `defineExtensionPoint` outside setup context | Computed refs not reactive | Call inside `<script setup>` or a composable used during setup |

---

## Related

| Resource | Path |
|----------|------|
| Extension Points Plugin (full docs) | `framework/core/plugins/extension-points/extension-points.docs.md` |
| Store implementation | `framework/core/plugins/extension-points/store.ts` |
| ExtensionPoint component | `framework/core/plugins/extension-points/ExtensionPoint.vue` |
| Types | `framework/core/plugins/extension-points/types.ts` |
| Public API exports | `framework/core/plugins/extension-points/public.ts` |
| Framework host usage | `framework/shell/auth/LoginPage/components/login/Login.vue` |
