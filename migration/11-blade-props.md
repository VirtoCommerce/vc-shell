# 11. Blade Props Simplification

## What Changed

VcBlade is now **context-aware** — it reads `expanded` and `closable` from the BladeDescriptor automatically. Blade pages no longer need boilerplate props/emits.

## Backward Compatibility

Old code continues to work. VcBladeSlot still passes all props and listens to all events. Migration is optional.

## Before / After

**Before (~55 lines of boilerplate):**
```vue
<template>
  <VcBlade
    :title="bladeTitle"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcDataTable ... />
  </VcBlade>
</template>

<script lang="ts" setup>
export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: { sellerProduct?: SellerProduct };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});
const emit = defineEmits<Emits>();

const reload = async () => {
  await loadOffers({ ... });
  emit("parent:call", { method: "reload" });
};
</script>
```

**After (~35 lines):**
```vue
<template>
  <VcBlade
    :title="bladeTitle"
    width="50%"
    :toolbar-items="bladeToolbar"
  >
    <VcDataTable ... />
  </VcBlade>
</template>

<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

const { param, options, openBlade, closeSelf, callParent } =
  useBlade<{ sellerProduct?: SellerProduct }>();

const reload = async () => {
  await loadOffers({ ... });
  callParent("reload");
};
</script>
```

## Migration Steps

1. Remove `expanded`, `closable`, `param`, `options` from Props
2. Remove entire Emits interface and `defineEmits()`
3. Remove `withDefaults(defineProps<Props>(), { expanded: true, closable: true })`
4. Use `useBlade<YourOptionsType>()` for `param`, `options`
5. Remove `:expanded`, `:closable`, `@close`, `@expand`, `@collapse` from `<VcBlade>`
6. Replace `emit("parent:call", { method: "X" })` → `callParent("X")`
7. Replace `emit("close:blade")` → `closeSelf()`
8. Replace `props.param` → `param.value`

## Common Pitfalls

### 1. `param.value` in templates — Vue auto-unwraps refs

In `<template>`, Vue automatically unwraps refs. `param` from `useBlade()` is a `ComputedRef<string | undefined>`, so in templates use `param` directly, not `param.value`:

```vue
<!-- ✅ Correct -->
<div v-if="param">...</div>
<VcInput :disabled="!!param" />

<!-- ❌ Wrong — "Property 'value' does not exist on type 'string'" -->
<div v-if="param.value">...</div>
```

In `<script>`, always use `.value` as usual:
```typescript
if (param.value) {
  await loadProduct({ id: param.value });
}
```

### 2. `useBlade()` must be called BEFORE composables that use `options.value`

If a composable needs `options.value` at setup time, declare `useBlade()` first:

```typescript
// ✅ Correct order
const { options } = useBlade<{ orderId: string }>();
const { items } = useMyComposable({ orderId: options.value?.orderId || "" });

// ❌ Wrong — "Variable 'options' is used before being assigned"
const { items } = useMyComposable({ orderId: options.value?.orderId || "" });
const { options } = useBlade<{ orderId: string }>();
```

### 3. Wrapper components — stop passing blade props to base components

If a wrapper (e.g. `productDetails.vue`) passes `:param`, `:options`, `:expanded`, `:closable` and blade events to a base component (e.g. `ProductDetailsBase.vue`), remove them all. The base component should call `useBlade()` directly — Vue's provide/inject hierarchy resolves the BladeDescriptor from the parent wrapper automatically.

```vue
<!-- ✅ After migration — wrapper only passes non-blade props -->
<ProductDetailsBase :config="detailsConfig" />

<!-- ❌ Before — blade boilerplate forwarding -->
<ProductDetailsBase
  :expanded="expanded" :closable="closable" :param="param" :options="options"
  @parent:call="$emit('parent:call', $event)"
  @close:blade="$emit('close:blade')"
/>
```

### 4. `callParent` args must match the exposed function signature

`callParent("method", args)` passes `args` as the **single argument** to the exposed function (see `useBladeMessaging.ts`). The shape must match:

```typescript
// Parent exposes:
function onItemClick(event: { data: Product }) { ... }
exposeToChildren({ onItemClick });

// ✅ Correct — matches { data: Product } signature
callParent("onItemClick", { data: item.value });

// ❌ Wrong — passes raw Product, not { data: Product }
callParent("onItemClick", item.value);
```

The old `emit("parent:call", { method: "X", args: Y })` passed `Y` the same way — as a single argument to the method. So the shape of `args` must remain identical.

## Typed Options

```typescript
interface MyOptions { productId: string; mode: "edit" | "create" }
const { options } = useBlade<MyOptions>();
// options.value is MyOptions | undefined
```

## New Lifecycle Hooks

```typescript
const { onActivated, onDeactivated } = useBlade();

onActivated(() => {
  // Blade became active (rightmost) — refresh data
});

onDeactivated(() => {
  // Another blade opened on top — pause polling
});
```

## G17: `IBladeToolbar.isVisible` callback receives `BladeDescriptor`

The callback form of `IBladeToolbar.isVisible` (used for dynamically hiding toolbar buttons per blade) changed its argument type.

**Before (v1.x)** — callback received an `IBladeInstance`:

```typescript
// framework/core/types/index.ts (v1.2.3)
export interface IBladeToolbar {
  // ...
  isVisible?:
    | boolean
    | Ref<boolean | undefined>
    | ComputedRef<boolean | undefined>
    | ((blade?: IBladeInstance) => boolean | undefined);
}
```

**After (v2.0)** — callback receives a `BladeDescriptor`:

```typescript
// framework/core/types/index.ts (v2.0)
export interface IBladeToolbar {
  // ...
  isVisible?:
    | boolean
    | Ref<boolean | undefined>
    | ComputedRef<boolean | undefined>
    | ((blade?: BladeDescriptor) => boolean | undefined);
}
```

### Migration

Update toolbar definitions that inspect the passed blade:

```typescript
// ❌ Before — typed as IBladeInstance
const toolbar: IBladeToolbar[] = [
  {
    id: "save",
    title: "Save",
    isVisible: (blade?: IBladeInstance) => !blade?.error,
    clickHandler: () => save(),
  },
];

// ✅ After — typed as BladeDescriptor
const toolbar: IBladeToolbar[] = [
  {
    id: "save",
    title: "Save",
    isVisible: (blade?: BladeDescriptor) => !blade?.error,
    clickHandler: () => save(),
  },
];
```

Most toolbar definitions use implicit inference and need no edits. Only explicitly typed callbacks require updating the parameter annotation and import:

```typescript
import type { BladeDescriptor } from "@vc-shell/framework";
```

## G25: `@reset:error` emit removed from VcBlade

VcBlade no longer declares or emits a `reset:error` event. The event existed in v1.x:

```typescript
// framework/ui/components/organisms/vc-blade/vc-blade.vue (v1.2.3)
export interface Emits {
  (event: "close"): void;
  (event: "expand"): void;
  (event: "collapse"): void;
  (event: "reset:error"): void;   // ← removed in v2.0
}
```

In v2.0 the Emits interface contains only `close`, `expand`, and `collapse`. Error state is now managed centrally by the blade stack and surfaced via `useBlade()`:

```typescript
const { setError, clearError } = useBlade();

// Show an error banner on the current blade
setError(new Error("Failed to save"));

// Clear the banner (replaces @reset:error handler)
clearError();
```

### Migration

Remove any `@reset:error` listeners from `<VcBlade>` usages and replace the handler with a call to `clearError()`:

```vue
<!-- ❌ Before -->
<VcBlade @reset:error="handleResetError">
  <!-- ... -->
</VcBlade>

<script setup lang="ts">
function handleResetError() {
  errorState.value = null;
}
</script>

<!-- ✅ After -->
<VcBlade>
  <!-- ... -->
</VcBlade>

<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { clearError } = useBlade();
// Call clearError() directly wherever the old handler was triggered.
</script>
```

The legacy error banner's "dismiss" action now routes through the shared blade error state, so no explicit wiring from consumer blades is needed.

## G26: `expandable` prop removed from VcBlade

The `expandable` prop no longer exists on VcBlade in v2.0. In v1.x, `expandable` appeared only in `withDefaults` (set to `true`) but was not declared in the `Props` interface — the actual "expandable" state came from the injected `IBladeInstance` (which defaulted to `false` for standalone mode):

```typescript
// framework/ui/components/organisms/vc-blade/vc-blade.vue (v1.2.3)
export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  expanded?: boolean;
  closable?: boolean;
  toolbarItems?: IBladeToolbar[];
  modified?: boolean;
  // no `expandable` field
}

withDefaults(defineProps<Props>(), {
  width: "30%",
  closable: true,
  expandable: true,       // ← dropped in v2.0
  toolbarItems: () => [],
  modified: undefined,
});
```

In v2.0 the prop is gone entirely. Whether the expand/maximize button is shown is driven by the blade's `BladeDescriptor.maximized` state (injected via `BladeDescriptorKey` / `BladeMaximizedKey`), not by a component prop:

```typescript
// framework/ui/components/organisms/vc-blade/vc-blade.vue (v2.0)
export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  expanded?: boolean;
  closable?: boolean;
  toolbarItems?: IBladeToolbar[];
  modified?: boolean;
  loading?: boolean;
  // `expandable` removed
}
```

### Migration

Remove `:expandable="..."` bindings from any `<VcBlade>` template. The expand button now appears automatically when the blade is mounted inside `VcBladeSlot` (blade navigation) and is hidden in standalone usage (Storybook, ad-hoc):

```vue
<!-- ❌ Before — explicit prop -->
<VcBlade
  :title="title"
  :expandable="true"
  :closable="true"
>
  <!-- ... -->
</VcBlade>

<!-- ✅ After — expand behavior determined by blade context -->
<VcBlade :title="title">
  <!-- ... -->
</VcBlade>
```

If you need to programmatically toggle the maximized state, write to `BladeDescriptor.maximized` via the blade stack rather than a prop — `VcBlade` listens to the injected `BladeMaximizedKey` ref and updates accordingly.

## Automated Migration

```bash
npx @vc-shell/codemod --transform blade-props-simplification
```
