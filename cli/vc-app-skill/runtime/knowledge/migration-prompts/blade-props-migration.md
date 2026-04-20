---
name: blade-props-migration
description: AI transformation rules for reusable blade components skipped by CLI migrator.
---

# Blade Props Migration: Boilerplate Removal

Remove blade prop/emit boilerplate from blade pages. VcBlade is now context-aware — it reads `expanded` and `closable` from the BladeDescriptor automatically via provide/inject. Use `useBlade()` for `param`, `options`, `closeSelf`, and `callParent`.

## RULE 1: Remove Blade Prop Forwarding from Template

Remove `:expanded`, `:closable`, `@close`, `@expand`, `@collapse` from the `<VcBlade>` tag.

**BEFORE:**

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
```

**AFTER:**

```vue
<template>
  <VcBlade
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
  >
    <VcDataTable ... />
  </VcBlade>
</template>
```

## RULE 2: Remove Props and Emits Interfaces

Remove `expanded`, `closable`, `param`, `options` from Props interface. Remove blade events from Emits. Use `useBlade()` to access `param` and `options`.

**BEFORE:**

```typescript
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
```

**AFTER:**

```typescript
import { useBlade } from "@vc-shell/framework";

const { param, options, openBlade, closeSelf, callParent } = useBlade<{ sellerProduct?: SellerProduct }>();
```

If the Props interface has other non-blade props, keep only those:

```typescript
// Keep non-blade props
export interface Props {
  config?: DetailConfig;
}

const props = defineProps<Props>();

// Blade concerns via composable
const { param, options, closeSelf, callParent } = useBlade<{ orderId: string }>();
```

## RULE 3: Replace emit("parent:call") with callParent()

**BEFORE:**

```typescript
const emit = defineEmits<Emits>();

const reload = async () => {
  await loadOffers({ ... });
  emit("parent:call", { method: "reload" });
};

function onItemSelect(item: Product) {
  emit("parent:call", { method: "onItemClick", args: { data: item } });
}
```

**AFTER:**

```typescript
const { callParent } = useBlade();

const reload = async () => {
  await loadOffers({ ... });
  callParent("reload");
};

function onItemSelect(item: Product) {
  callParent("onItemClick", { data: item });
}
```

## RULE 4: Replace emit("close:blade") with closeSelf()

**BEFORE:**

```typescript
const emit = defineEmits<Emits>();

function handleClose() {
  emit("close:blade");
}

// or in template:
// @click="$emit('close:blade')"
```

**AFTER:**

```typescript
const { closeSelf } = useBlade();

function handleClose() {
  closeSelf();
}

// or in template:
// @click="closeSelf()"
```

## Wrapper Components

If a wrapper component forwards blade props to a base component, remove the forwarding. The base component should call `useBlade()` directly.

**BEFORE:**

```vue
<template>
  <ProductDetailsBase
    :expanded="expanded"
    :closable="closable"
    :param="param"
    :options="options"
    @parent:call="$emit('parent:call', $event)"
    @close:blade="$emit('close:blade')"
    @expand:blade="$emit('expand:blade')"
    @collapse:blade="$emit('collapse:blade')"
  />
</template>
```

**AFTER:**

```vue
<template>
  <ProductDetailsBase />
</template>
```

## Verification

After migration:

1. Run `npx tsc --noEmit` to verify no TypeScript errors
2. Confirm blades open and close correctly
3. Confirm `param.value` is accessible in script (use `param` without `.value` in templates)
4. Confirm `options.value` provides typed options from parent
5. Confirm `callParent()` triggers the parent's exposed method
6. Confirm no remaining `emit("close:blade")` or `emit("parent:call", ...)` calls
7. Confirm no remaining `:expanded`, `:closable`, `@close`, `@expand`, `@collapse` on `<VcBlade>`
