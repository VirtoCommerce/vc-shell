---
id: framework-useAssets
type: API
complexity: MODERATE
category: framework
tags: [composable, framework, gallery, upload, images]
critical: true
title: "useAssets"
description: "useAssets composable for managing file uploads with VcGallery"
---

# useAssets - Gallery Upload

**Capability:** `gallery-upload`
**When to use:** Handle image/file uploads with VcGallery component
**Source:** `apps/vendor-portal/src/modules/offers/pages/offers-details.vue`

---

## Description

Manages file uploads, removal, and editing for gallery components. Returns methods that work with `ICommonAsset[]` arrays and integrate with `VcGallery` events.

---

## Required Imports

```typescript
import { useAssets } from "@vc-shell/framework";
```

---

## Complete Example (from vendor-portal)

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
  >
    <VcCard :header="$t('OFFERS.PAGES.DETAILS.FIELDS.GALLERY.TITLE')">
      <div class="tw-p-2">
        <VcGallery
          :images="item.images"
          :disabled="readonly"
          multiple
          @upload="assetsHandler.upload"
          @sort="assetsHandler.edit"
          @remove="assetsHandler.remove"
        />
      </div>
    </VcCard>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAssets, usePopup, ICommonAsset } from "@vc-shell/framework";
import { Image } from "../api";

// Initialize useAssets
const { upload, remove, edit, loading: assetsLoading } = useAssets();
const { showConfirmation } = usePopup();

// Item with images array
const item = ref<{ id?: string; images?: ICommonAsset[] }>({});

// Assets handler object for VcGallery events
const assetsHandler = {
  loading: assetsLoading,

  // Handle file upload from VcGallery @upload event
  async upload(files: FileList, startingSortOrder?: number) {
    // Upload to server with entity-specific path
    const uploaded = await upload(files, `offers/${item.value?.id}`, startingSortOrder);

    // Merge uploaded files with existing images
    item.value.images = [
      ...(item.value?.images ?? []),
      ...(uploaded.map((x) => new Image(x)) ?? []),
    ];
  },

  // Handle file removal from VcGallery @remove event
  async remove(file: ICommonAsset) {
    // Show confirmation before removing
    if (await showConfirmation("Are you sure you want to delete this image?")) {
      // Remove file from array
      const remainingImages = remove([file], item.value?.images ?? []);
      item.value.images = remainingImages.map((x) => new Image(x));
    }
  },

  // Handle sort/edit from VcGallery @sort event
  edit(files: ICommonAsset[]) {
    // Update images with new order/data
    item.value.images = edit(files, item.value?.images ?? []).map((x) => new Image(x));
  },
};
</script>
```

---

## API Reference

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `upload` | `(files: FileList, uploadPath: string, startingSortOrder?: number) => Promise<ICommonAsset[]>` | Upload files to server |
| `remove` | `(filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[]` | Remove files from array |
| `edit` | `(updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[]` | Update files in array |

### State

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `ComputedRef<boolean>` | Loading state during operations |

---

## Key Points

1. **Upload path should be unique per entity** - Use entity ID in path: `offers/${item.value?.id}`
2. **Methods return new arrays** - Always assign back: `item.value.images = remove(...)`
3. **Use with VcGallery events** - Maps directly to `@upload`, `@remove`, `@sort`
4. **Show confirmation for destructive actions** - Use `usePopup().showConfirmation()` before remove
5. **Loading state** - Use `assetsLoading` to show loading indicator during uploads

---

## Common Mistakes

```typescript
// ❌ WRONG: Not assigning returned array
remove([file], item.value.images);

// ✅ CORRECT: Assign returned array back
item.value.images = remove([file], item.value.images ?? []);
```

```typescript
// ❌ WRONG: Generic upload path
await upload(files, "uploads");

// ✅ CORRECT: Entity-specific path
await upload(files, `offers/${item.value?.id}`);
```
