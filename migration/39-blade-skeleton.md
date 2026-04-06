# 39. Transparent Blade Skeletons

**Severity:** Informational (non-breaking)

## What Changed

`VcBlade` now provides `BladeLoadingKey` via Vue's provide/inject when `loading=true`. All framework UI components automatically render skeleton placeholders matching their visual footprint during blade loading.

The generic `BladeContentSkeleton` has been removed from the content zone — the real slot content is always rendered, and each component self-skeletonizes.

## Before

```vue
<!-- VcBlade showed a generic skeleton during loading -->
<VcBlade :loading="loading" title="Product">
  <VcInput label="Name" v-model="item.name" />
  <VcSelect label="Category" v-model="item.categoryId" :options="categories" />
</VcBlade>
<!-- Generic skeleton: didn't match actual form layout -->
```

## After

```vue
<!-- Same code — no changes needed! -->
<VcBlade :loading="loading" title="Product">
  <VcInput label="Name" v-model="item.name" />
  <VcSelect label="Category" v-model="item.categoryId" :options="categories" />
</VcBlade>
<!-- Now shows: label skeleton + input skeleton for each field -->
```

## Using in Custom Components

If you build custom components that should also skeletonize inside VcBlade:

```ts
import { useBladeLoading } from "@vc-shell/framework";

const bladeLoading = useBladeLoading();
// bladeLoading.value === true when parent VcBlade is loading
```

## Migration

No migration required. This is a visual enhancement with full backward compatibility.
