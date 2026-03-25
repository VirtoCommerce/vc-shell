# Assets Management Pattern

Integrating file/image assets into a details blade. Covers two scenarios: inline gallery on the blade and an AssetsWidget opening the AssetsManager as a child blade.

Both scenarios use `useAssetsManager` — a composable that wraps `useAssets` with higher-level operations (upload with deduplication, remove with confirmation, reorder). The manager operates on a **writable computed** bound to the parent entity's asset array.

---

## Core Setup — Writable Computed + useAssetsManager

The key is creating a two-way binding between the entity's asset array and the manager:

```ts
import { computed, markRaw } from "vue";
import { useAssetsManager, usePopup } from "@vc-shell/framework";
import type { Asset } from "../api_client/...";

// `item` is a Ref to the parent entity (e.g., product, category, order)
const entityAssets = computed({
  get: () => (item.value?.assets ?? []) as Asset[],
  set: (val) => {
    if (item.value) item.value.assets = val;
  },
});

const { showConfirmation } = usePopup();

const assetsManager = useAssetsManager(entityAssets, {
  // Dynamic upload path — resolved at upload time
  uploadPath: () => `/catalog/${item.value?.id}`,
  // Optional: confirmation dialog before remove
  confirmRemove: () => showConfirmation("Delete selected assets?"),
});
```

**Why writable computed?** `useAssetsManager` reads and writes the asset array reactively. A writable computed bridges the gap between the manager and the nested entity field (`item.value.assets`). When the manager sets a new array after upload/remove/reorder, Vue's reactivity propagates the change to the entity — making it trackable by `useModificationTracker`.

---

## Scenario 1 — Inline Gallery (VcGallery on the blade)

Use when images are a primary field of the entity (e.g., product images shown directly on the details blade).

```vue
<template>
  <VcCard header="Images">
    <div class="tw-p-2">
      <VcGallery
        :images="item.images"
        :multiple="!disabled"
        :disabled="disabled"
        :loading="assets.loading.value"
        @upload="assets.upload"
        @remove="assets.remove"
        @sort="assets.reorder"
        @edit="onEditAsset"
      />
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBlade, useAssetsManager, usePopup } from "@vc-shell/framework";

const { openBlade } = useBlade();
const { showConfirmation } = usePopup();

const images = computed({
  get: () => item.value?.images ?? [],
  set: (val) => { if (item.value) item.value.images = val; },
});

const assets = useAssetsManager(images, {
  uploadPath: () => `/catalog/${item.value?.id}`,
  confirmRemove: () => showConfirmation("Delete selected images?"),
});

// Open AssetsDetails blade for editing a single asset (alt text, crop, etc.)
function onEditAsset(asset: Asset) {
  openBlade({
    name: "AssetsDetails",
    options: {
      asset,
      assetEditHandler: (updated: Asset) => assets.updateItem(updated),
      assetRemoveHandler: (toRemove: Asset) => assets.remove(toRemove),
    },
  });
}
</script>
```

---

## Scenario 2 — AssetsWidget (child blade)

Use when assets are a secondary concern shown as a widget badge. Clicking the widget opens the built-in `AssetsManager` blade.

### Widget composable

```ts
// widgets/useEntityWidgets.ts
import { computed, markRaw, type Ref, type ComputedRef } from "vue";
import {
  useBlade,
  useBladeWidgets,
  useAssetsManager,
  usePopup,
  type UseBladeWidgetsReturn,
} from "@vc-shell/framework";

interface Options {
  item: Ref<Entity | undefined>;
  disabled: ComputedRef<boolean>;
  isVisible: ComputedRef<boolean>;
}

export function useEntityWidgets({ item, disabled, isVisible }: Options): UseBladeWidgetsReturn {
  const { openBlade } = useBlade();
  const { showConfirmation } = usePopup();

  // Assets manager for the widget
  const entityAssets = computed({
    get: () => (item.value?.assets ?? []) as Asset[],
    set: (val) => {
      if (item.value) item.value.assets = val;
    },
  });

  const assetsManager = useAssetsManager(entityAssets, {
    uploadPath: () => `/files/${item.value?.id}`,
    confirmRemove: () => showConfirmation("Delete selected assets?"),
  });

  const assetsCount = computed(() => item.value?.assets?.length ?? 0);

  return useBladeWidgets([
    {
      id: "AssetsWidget",
      icon: "lucide-file",
      title: "MODULE.WIDGETS.ASSETS",
      badge: assetsCount,
      isVisible,
      onClick: () =>
        openBlade({
          name: "AssetsManager",
          options: {
            manager: markRaw(assetsManager),  // markRaw prevents Vue from making it reactive
            disabled: disabled.value,
          },
        }),
    },
    // ... other widgets
  ]);
}
```

### Usage in the details blade

```vue
<script setup lang="ts">
import { useEntityWidgets } from "../widgets";

const { item, loading } = useEntityDetails();

useEntityWidgets({
  item,
  disabled: computed(() => !!param.value && !item.value?.canBeModified),
  isVisible: computed(() => !!param.value), // hide widgets on "create new"
});
</script>
```

---

## Combining Both Scenarios

A blade can use **both** an inline gallery and an assets widget. The product details blade demonstrates this:

- **Inline gallery** — `useAssetsManager` for product images, bound to `item.productData.images`, rendered via `VcGallery`
- **Assets widget** — a separate `useAssetsManager` for product file assets, bound to `item.productData.assets`, opened via `AssetsManager` blade

Each manager operates on a different writable computed pointing to a different array on the entity. They are fully independent.

```ts
// Gallery assets (images)
const productImages = computed({
  get: () => item.value.productData?.images ?? [],
  set: (val) => { if (item.value.productData) item.value.productData.images = val; },
});
const imageAssets = useAssetsManager(productImages, { uploadPath: () => `/catalog/${item.value.id}` });

// Widget assets (files)
const productFiles = computed({
  get: () => (item.value?.productData?.assets ?? []) as Asset[],
  set: (val) => { if (item.value?.productData) item.value.productData.assets = val; },
});
const fileAssets = useAssetsManager(productFiles, { uploadPath: () => `/catalog/${item.value.id}` });
```

---

## Key Points

| Concern | Approach |
|---|---|
| Binding to entity | Writable `computed` — getter reads nested array, setter writes it back |
| Upload path | Callback `() => string` — resolved at upload time, so entity ID is available |
| Remove confirmation | Pass `confirmRemove` returning `Promise<boolean>` via `usePopup().showConfirmation` |
| Passing to AssetsManager blade | Wrap with `markRaw()` — prevents Vue from making the manager deeply reactive |
| Multiple asset types | Create separate `useAssetsManager` instances per array (images vs files) |
| Gallery edit | Open `AssetsDetails` blade, pass `assetEditHandler` and `assetRemoveHandler` callbacks |
| Widget visibility | Use `isVisible: computed(() => !!param.value)` to hide on "create new" mode |
