---
name: use-assets-migration
description: AI transformation rules for useAssets()/AssetsHandler migration to useAssetsManager().
---

# Assets Migration: useAssets -> useAssetsManager

Migrate legacy assets handling (`useAssets`, `AssetsHandler`, ad-hoc upload/remove/edit callbacks) to `useAssetsManager`.

## RULE 1: Replace `useAssets()` with `useAssetsManager()`

**BEFORE:**

```typescript
import { useAssets } from "@vc-shell/framework";

const { upload, remove, edit, loading } = useAssets(imagesRef, uploadPath);
```

**AFTER:**

```typescript
import { useAssetsManager } from "@vc-shell/framework";

const assetsManager = useAssetsManager(imagesRef, {
  uploadPath: () => uploadPath.value,
  confirmRemove: () => showConfirmation(t("MY_MODULE.ALERTS.DELETE_CONFIRMATION")),
});

// assetsManager.items, assetsManager.upload, assetsManager.remove,
// assetsManager.removeMany, assetsManager.reorder, assetsManager.updateItem, assetsManager.loading
```

Notes:

- `uploadPath` must be a function (`() => string`), not a static string.
- If no confirmation is needed, omit `confirmRemove`.

## RULE 2: Replace `ICommonAsset` with `AssetLike`

**BEFORE:**

```typescript
import type { ICommonAsset } from "@vc-shell/framework";
```

**AFTER:**

```typescript
import type { AssetLike } from "@vc-shell/framework";
```

Also update all type annotations in the file.

## RULE 3: Single-image fields must be wrapped in writable computed array

For fields like `iconUrl`, `logo`, `photo`, convert single value <-> array bridge.

**BEFORE:**

```typescript
const { upload, remove } = useAssets(photoRef, () => `users/${item.value?.id}`);
```

**AFTER:**

```typescript
const photoAssets = computed({
  get: () => (item.value?.iconUrl ? [{ url: item.value.iconUrl }] : []),
  set: (val) => {
    if (item.value) item.value.iconUrl = val[0]?.url;
  },
});

const photoManager = useAssetsManager(photoAssets, {
  uploadPath: () => `users/${item.value?.id ?? "new"}`,
});
```

## RULE 4: `AssetsHandler` and raw handler props -> manager object

If the component receives or creates handler bundles (`assetsUploadHandler`, `assetsEditHandler`, `assetsRemoveHandler`, `AssetsHandler<T>`), replace with a manager instance.

**BEFORE:**

```typescript
interface Props {
  imageHandlers?: AssetsHandler<MyImage>;
}

const defaultHandlers = { upload, remove, edit, loading };
const handlers = props.imageHandlers ?? defaultHandlers;
```

**AFTER:**

```typescript
interface Props {
  manager?: ReturnType<typeof useAssetsManager>;
}

const defaultManager = useAssetsManager(imagesRef, {
  uploadPath: () => `products/${item.value?.id}`,
});

const manager = computed(() => props.manager ?? defaultManager);
```

## RULE 5: `openBlade("AssetsManager")` must pass `manager: markRaw(...)`

**BEFORE:**

```typescript
openBlade({
  name: "AssetsManager",
  options: {
    assets: item.value?.assets,
    assetsUploadHandler: upload,
    assetsEditHandler: edit,
    assetsRemoveHandler: remove,
    loading,
  },
});
```

**AFTER:**

```typescript
import { markRaw } from "vue";

openBlade({
  name: "AssetsManager",
  options: {
    manager: markRaw(assetsManager),
    disabled: disabled.value,
  },
});
```

If `manager` is already passed but not wrapped, add `markRaw()`.

## RULE 6: Keep `AssetsDetails` callbacks wired to manager methods

If opening `AssetsDetails`, connect handlers to manager methods (`updateItem`, `remove`) and keep asset type as `AssetLike`.

```typescript
openBlade({
  name: "AssetsDetails",
  options: {
    asset,
    assetEditHandler: (updated: AssetLike) => assetsManager.updateItem(updated),
    assetRemoveHandler: (toRemove: AssetLike) => assetsManager.remove(toRemove),
  },
});
```

## Verification

After migration:

1. Search for stale API: `useAssets(`, `AssetsHandler`, `ICommonAsset`, `assetsUploadHandler`, `assetsEditHandler`, `assetsRemoveHandler`.
2. Confirm `AssetsManager` blade calls pass `manager: markRaw(...)`.
3. Run `npx vue-tsc --noEmit`.
4. Validate runtime flow: upload, remove, reorder, edit metadata.
