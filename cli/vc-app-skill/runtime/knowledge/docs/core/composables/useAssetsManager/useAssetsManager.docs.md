# useAssetsManager

High-level composable for managing asset arrays (images, documents, files). Wraps upload, remove, reorder, and metadata editing operations, mutating a reactive ref directly — no manual wiring needed.

Replaces the low-level `useAssets()` composable which required building handler objects manually.

## When to Use

- Manage a list of images/assets on an entity (product, offer, user profile, seller)
- Need upload, remove, reorder, and edit-metadata on an asset array
- Want to bind directly to `VcGallery` events without boilerplate

## API

```typescript
import { useAssetsManager } from "@vc-shell/framework";

const assets = useAssetsManager(ref, options);
```

### Parameters

| Parameter | Type                                    | Description                                                                                                                                                                                                |
| --------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`  | `Ref<AssetLike[] \| undefined \| null>` | Reactive ref to the asset array. Accepts `ref()`, `toRef()`, or `computed({ get, set })`. `undefined`/`null` values are treated as empty array. The composable holds an internal copy and syncs both ways. |
| `options` | `UseAssetsManagerOptions`               | Configuration (see below)                                                                                                                                                                                  |

### Options

| Option          | Type                                | Required | Description                                                             |
| --------------- | ----------------------------------- | -------- | ----------------------------------------------------------------------- |
| `uploadPath`    | `() => string`                      | Yes      | Upload destination path (function — evaluated at upload time)           |
| `confirmRemove` | `() => Promise<boolean> \| boolean` | No       | Called before remove. Return `false` to cancel. Omit for silent remove. |
| `assetKey`      | `string`                            | No       | Key for matching items (default: `"url"`)                               |
| `concurrency`   | `number`                            | No       | Max concurrent uploads (default: 4)                                     |

### Return (`UseAssetsManagerReturn`)

| Property     | Type                                                             | Description                                                    |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `items`      | `Ref<AssetLike[]>`                                               | Reactive asset array (internal ref, safe to bind to templates) |
| `upload`     | `(files: FileList, startingSortOrder?: number) => Promise<void>` | Upload files, append to array                                  |
| `remove`     | `(item: AssetLike) => Promise<void>`                             | Remove single item (with confirmation if configured)           |
| `removeMany` | `(items: AssetLike[]) => Promise<void>`                          | Remove multiple items (one confirmation for batch)             |
| `reorder`    | `(items: AssetLike[]) => void`                                   | Replace array with new order                                   |
| `updateItem` | `(item: AssetLike) => void`                                      | Update single item metadata by `assetKey`                      |
| `loading`    | `ComputedRef<boolean>`                                           | True during upload                                             |

## Usage Examples

### Basic — gallery with confirmation

```typescript
import { useAssetsManager } from "@vc-shell/framework";
import { toRef } from "vue";

const assets = useAssetsManager(
  computed({
    get: () => entity.value.images ?? [],
    set: (val) => {
      entity.value.images = val;
    },
  }),
  {
    uploadPath: () => `entities/${entity.value?.id ?? "new"}`,
    confirmRemove: () => showConfirmation(t("MODULE.ALERTS.IMAGE_DELETE")),
  },
);
```

```html
<VcGallery
  :images="assets.items.value"
  @upload="assets.upload"
  @sort="assets.reorder"
  @remove="assets.remove"
  @edit="onGalleryItemEdit"
/>
```

### Single image (photo/logo)

Wrap a single value in a computed array:

```typescript
const photoAssets = computed({
  get: () => (user.value?.iconUrl ? [{ url: user.value.iconUrl }] : []),
  set: (val) => {
    user.value!.iconUrl = val[0]?.url;
  },
});

const photo = useAssetsManager(photoAssets, {
  uploadPath: () => `users/${user.value?.id}`,
});
```

### Passing to AssetsManager blade

When passing `useAssetsManager` through blade options, **always wrap with `markRaw()`**:

```typescript
import { markRaw } from "vue";
import { useBlade, useAssetsManager } from "@vc-shell/framework";

const { openBlade } = useBlade();

const assets = useAssetsManager(productAssetsRef, {
  uploadPath: () => `/catalog/${product.value?.id}`,
  confirmRemove: () => showConfirmation("Delete selected assets?"),
});

openBlade({
  name: "AssetsManager",
  options: {
    manager: markRaw(assets), // IMPORTANT: prevents reactive proxy unwrap
    disabled: !canEdit.value,
  },
});
```

**Why `markRaw`?** Blade descriptors are stored in `ref<BladeDescriptor[]>()`, which creates a deep reactive proxy. Vue auto-unwraps `Ref` values inside reactive objects — so `manager.items` would become a plain array instead of `Ref<AssetLike[]>`, breaking `.value` access. `markRaw()` tells Vue to skip this object, keeping Refs intact.

## Reactivity Model

The composable holds an **internal ref** (`_items`) that is the source of truth for the UI:

1. **Source → internal**: A `watch` syncs changes from the source ref (e.g., when parent reloads data)
2. **Mutations → internal → source**: Every operation (`upload`, `remove`, `reorder`, `updateItem`) updates `_items` first, then writes back to the source via `_sync()`

This two-way sync avoids reactivity issues when the source is a `WritableComputed` wrapping deeply nested properties (e.g., `item.value.productData.assets`).

## Types

### `AssetLike`

Minimal structural contract compatible with any domain image type:

```typescript
interface AssetLike {
  url?: string;
  name?: string;
  sortOrder?: number;
  [key: string]: any; // compatible with Image, ProductImage, Asset, etc.
}
```

## Related

- `framework/modules/assets-manager/` — AssetsManager blade (table UI for managing assets)
- `framework/modules/assets/` — AssetsDetails blade (single asset editing)
- `framework/ui/components/organisms/vc-gallery/` — VcGallery component
- `framework/core/composables/useAssets/` — deprecated low-level composable
