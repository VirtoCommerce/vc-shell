# useAssets

Handles file upload, removal, and editing for `ICommonAsset` arrays (images, documents, etc.).

## When to Use

- Upload files to the platform asset storage and get back `ICommonAsset` objects
- Remove or update assets in a local array before saving
- When NOT to use: for non-platform asset storage or custom upload endpoints

## Basic Usage

```typescript
import { useAssets } from '@vc-shell/framework';

const { upload, remove, edit, loading } = useAssets();

// Upload files
const newAssets = await upload(fileList, 'catalog/products/images', currentMaxSort);
assets.value = [...assets.value, ...newAssets];

// Remove assets
assets.value = remove(filesToDelete, assets.value);

// Edit (update metadata or reorder)
assets.value = edit(updatedFiles, assets.value);
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `upload` | `(files: FileList, uploadPath: string, startingSortOrder?: number) => Promise<ICommonAsset[]>` | Upload files in parallel batches (max 4 concurrent) |
| `remove` | `(filesToDelete: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[]` | Return a new array with deleted items removed (matched by `url`) |
| `edit` | `(updatedFiles: ICommonAsset[], initialAssetArr: ICommonAsset[]) => ICommonAsset[]` | Merge updated fields into existing assets, or replace entire array on reorder |
| `loading` | `ComputedRef<boolean>` | Whether an upload or remove operation is in progress |

## Common Patterns

```typescript
// Reorder all assets (updatedFiles.length === initialAssetArr.length)
const reordered = edit(reorderedAssets, assets.value);

// Update a single asset's alt text
const patched = edit([{ ...asset, altText: 'New alt' }], assets.value);
```

## Related

- `ICommonAsset` type in `@core/types`
