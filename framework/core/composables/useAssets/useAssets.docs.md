# useAssets

Handles file upload, removal, and editing for `ICommonAsset` arrays (images, documents, etc.). This composable encapsulates the platform's asset storage API, handling multipart form upload with batched concurrency (max 4 simultaneous uploads), sort-order assignment, URL decoding, and immutable array operations for remove and edit. It returns a new array from every operation rather than mutating in place, which plays well with Vue's reactivity system and makes undo/redo patterns straightforward.

## When to Use

- Upload files to the platform asset storage and get back `ICommonAsset` objects with URLs, sizes, and sort orders
- Remove assets from a local array before saving the parent entity
- Update asset metadata (alt text, sort order) or reorder the entire asset list
- When NOT to use: for non-platform asset storage, custom upload endpoints, or binary blob handling outside the vc-shell asset API

## Quick Start

```vue
<script setup lang="ts">
import { useAssets } from '@vc-shell/framework';
import { ref } from 'vue';
import type { ICommonAsset } from '@vc-shell/framework';

const { upload, remove, edit, loading } = useAssets();
const assets = ref<ICommonAsset[]>([]);

async function onFilesSelected(fileList: FileList) {
  const maxSort = Math.max(0, ...assets.value.map((a) => a.sortOrder ?? 0));
  const newAssets = await upload(fileList, 'catalog/products/images', maxSort);
  assets.value = [...assets.value, ...newAssets];
}

function onDeleteAssets(toDelete: ICommonAsset[]) {
  assets.value = remove(toDelete, assets.value);
}

function onUpdateAltText(asset: ICommonAsset, altText: string) {
  assets.value = edit([{ ...asset, altText }], assets.value);
}
</script>

<template>
  <VcBlade title="Product Images" :loading="loading">
    <VcGallery
      :assets="assets"
      @upload="onFilesSelected"
      @delete="onDeleteAssets"
    />
  </VcBlade>
</template>
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `upload` | `(files: FileList, uploadPath: string, startingSortOrder?: number) => Promise<ICommonAsset[]>` | Upload files in parallel batches (max 4 concurrent). Returns only successfully uploaded assets. Sort orders are assigned incrementally from `startingSortOrder + 1`. |
| `remove` | `(filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[]` | Return a new array with deleted items removed. Matching is done by `url` field. The original array is not mutated. |
| `edit` | `(updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[]` | Merge updated fields into existing assets (matched by `url`). If `updatedFiles.length === initialAssetArr.length`, the entire array is replaced (reorder mode). |
| `loading` | `ComputedRef<boolean>` | Whether an upload or remove operation is currently in progress. |

## How It Works

### Upload Batching

Files are uploaded in batches of 4 (`MAX_CONCURRENT_UPLOADS`). For example, if you select 10 files, the first 4 upload in parallel, then the next 4, then the remaining 2. This prevents overwhelming the server while still being much faster than sequential uploads. Each file is POSTed as `multipart/form-data` to `/api/assets?folderUrl=/{uploadPath}`.

### Edit Detection: Reorder vs. Patch

The `edit` function uses a simple heuristic: if `updatedFiles.length === initialAssetArr.length`, it assumes a reorder operation and returns `updatedFiles` directly (preserving their order). If only a subset is passed, it patches matching items in the original array by `url`, keeping the original order intact.

### Immutability

Both `remove` and `edit` use `lodash-es` `cloneDeep` to create a new array, so the original `initialAssetArr` is never modified. This is important because Vue's reactivity relies on reference changes to detect updates.

## Recipe: Drag-and-Drop Reorder with Sort Order Update

```typescript
import { useAssets } from '@vc-shell/framework';

const { edit } = useAssets();
const assets = ref<ICommonAsset[]>([]);

function onDragEnd(reorderedList: ICommonAsset[]) {
  // Assign new sort orders based on position
  const withNewSortOrders = reorderedList.map((asset, index) => ({
    ...asset,
    sortOrder: index + 1,
  }));

  // Because length matches, edit() treats this as a full reorder
  assets.value = edit(withNewSortOrders, assets.value);
}
```

## Recipe: Upload with Progress Feedback

```vue
<script setup lang="ts">
import { useAssets } from '@vc-shell/framework';
import { ref, watch } from 'vue';

const { upload, loading } = useAssets();
const assets = ref<ICommonAsset[]>([]);
const statusMessage = ref('');

watch(loading, (isLoading) => {
  statusMessage.value = isLoading ? 'Uploading files...' : '';
});

async function handleUpload(files: FileList) {
  statusMessage.value = `Uploading ${files.length} file(s)...`;
  try {
    const uploaded = await upload(files, 'catalog/products/images');
    assets.value = [...assets.value, ...uploaded];
    statusMessage.value = `Successfully uploaded ${uploaded.length} file(s)`;
  } catch (err) {
    statusMessage.value = 'Upload failed. Please try again.';
  }
}
</script>
```

## Tips

- **Sort order starts from `startingSortOrder + 1`.** If you pass `startingSortOrder: 5` and upload 3 files, they get sort orders 6, 7, and 8. Pass `0` or omit it to start from 1.
- **Failed uploads are silently filtered.** If one file in a batch fails, the others still succeed. The returned array only contains successfully uploaded assets. Check the browser console for error logs from the `use-assets` logger.
- **`remove` matches by `url`, not by `id`.** Assets may not have stable IDs before they are saved to the server. The `url` field is used as the matching key because it is always present after upload.
- **Each `useAssets()` call creates an independent instance.** Unlike singleton composables, calling `useAssets()` twice gives you two separate `loading` states. This is useful if different parts of your blade upload to different paths.

## Related

- `ICommonAsset` type in `@core/types`
- `VcGallery` / `VcImageTile` -- UI components that consume asset arrays
