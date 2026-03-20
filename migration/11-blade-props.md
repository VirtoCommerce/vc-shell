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

## Automated Migration

```bash
npx @vc-shell/codemod --transform blade-props-simplification
```
