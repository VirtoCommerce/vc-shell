---
id: framework-useAssets-edit
type: API
complexity: MODERATE
category: framework
tags: [composable, framework, gallery, edit, images]
critical: true
title: "useAssets - Edit Gallery Item"
description: "Edit gallery items and open asset details blade"
---

# useAssets - Edit Gallery Item

**Capability:** `gallery-edit`
**When to use:** Open asset details for editing from VcGallery
**Source:** `apps/vendor-portal/src/modules/offers/pages/offers-details.vue`

---

## Description

Handle editing individual gallery items by opening an asset details blade. The edit handler receives the updated asset and applies changes to the images array.

---

## Required Imports

```typescript
import { useAssets, useBladeNavigation, ICommonAsset } from "@vc-shell/framework";
```

---

## Complete Example

```vue
<template>
  <VcGallery
    :images="item.images"
    :disabled="readonly"
    multiple
    @upload="assetsHandler.upload"
    @sort="assetsHandler.edit"
    @remove="assetsHandler.remove"
    @edit="onGalleryItemEdit"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAssets, useBladeNavigation, ICommonAsset } from "@vc-shell/framework";

const { upload, remove, edit, loading: assetsLoading } = useAssets();
const { openBlade } = useBladeNavigation();

const item = ref<{ id?: string; images?: ICommonAsset[] }>({});

// Assets handler for basic operations
const assetsHandler = {
  loading: assetsLoading,
  async upload(files: FileList, startingSortOrder?: number) {
    const uploaded = await upload(files, `entity/${item.value?.id}`, startingSortOrder);
    item.value.images = [...(item.value?.images ?? []), ...uploaded];
  },
  async remove(file: ICommonAsset) {
    item.value.images = remove([file], item.value?.images ?? []);
  },
  edit(files: ICommonAsset[]) {
    item.value.images = edit(files, item.value?.images ?? []);
  },
};

// Open asset details blade for editing
const onGalleryItemEdit = (asset: ICommonAsset) => {
  openBlade({
    blade: { name: "AssetsDetails" },
    options: {
      asset,
      assetEditHandler: (updatedAsset: ICommonAsset) => {
        assetsHandler.edit([updatedAsset]);
      },
      assetRemoveHandler: (assetToRemove: ICommonAsset) => {
        assetsHandler.remove(assetToRemove);
      },
    },
  });
};
</script>
```

---

## VcGallery Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@upload` | `(files: FileList, sortOrder?: number)` | Files dropped or selected for upload |
| `@sort` | `(files: ICommonAsset[])` | Images reordered via drag-drop |
| `@remove` | `(file: ICommonAsset)` | Single image remove clicked |
| `@edit` | `(file: ICommonAsset)` | Image edit/details clicked |

---

## Key Points

1. **VcGallery @edit event** - Opens detailed view for single image
2. **Pass handlers to child blade** - `assetEditHandler` and `assetRemoveHandler`
3. **Use existing AssetsDetails blade** - Built-in blade for asset editing
4. **Edit returns new array** - Must assign back to images array
