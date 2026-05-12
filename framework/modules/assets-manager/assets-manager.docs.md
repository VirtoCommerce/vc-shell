---
title: Assets Manager
category: reference
group: modules
slug: assets-manager
---

# Assets Manager Module

A built-in blade module for managing file assets (images, documents, archives). Provides upload, delete, reorder, and preview functionality via a table-based UI.

## Overview

The Assets Manager is registered as an app module via `defineAppModule` and opened as a child blade from any parent blade that needs asset management. The parent creates a `useAssetsManager` instance and passes it through `options.manager` -- the module handles the UI and delegates data mutations through the manager.

## Module Registration

```typescript
import { AssetsManagerModule } from "@vc-shell/framework";

// Registered automatically when the framework loads
// Exposes: AssetsManager blade component
```

The module exports `AssetsManagerModule` (a Vue plugin) and the `AssetsManager` component, which is declared as a global component.

## Options (via `useBlade`)

The blade reads its configuration from `options` via `useBlade<AssetsManagerOptions>()` (not props):

| Option         | Type                     | Description                                                                              |
| -------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `title`        | `string?`                | Custom blade title (defaults to i18n `ASSETS_MANAGER.TITLE`)                             |
| `manager`      | `UseAssetsManagerReturn` | The asset manager instance from `useAssetsManager()`. **Must be wrapped in `markRaw()`** |
| `disabled`     | `boolean?`               | When true, hides upload/delete actions and disables reordering                           |
| `hiddenFields` | `string[]?`              | Fields to hide in the detail view                                                        |

> **Breaking change:** The old options (`assets`, `loading`, `assetsUploadHandler`, `assetsEditHandler`, `assetsRemoveHandler`) have been removed. Pass a single `manager` instance instead. See [migration guide #32](../../../migration/32-use-assets-manager.md).

## Usage

The canonical pattern is to bind the manager to a writable `computed` over a field of the parent entity, so that uploads/removes/reorders propagate back into the form. `confirmRemove` is wired to the framework's popup service rather than `window.confirm`.

```typescript
import { computed, markRaw } from "vue";
import { useBlade, useAssetsManager, usePopup } from "@vc-shell/framework";

const { openBlade } = useBlade();
const { showConfirmation } = usePopup();

// Two-way binding: the manager mutates `productAssets.value`, which writes
// straight back to `item.value.productData.assets`.
const productAssets = computed({
  get: () => item.value?.productData?.assets ?? [],
  set: (val) => {
    if (item.value?.productData) item.value.productData.assets = val;
  },
});

const assetsManager = useAssetsManager(productAssets, {
  uploadPath: () => `/catalog/${item.value?.id}`,
  confirmRemove: () => showConfirmation("Are you sure you want to delete the selected assets?"),
});

openBlade({
  name: "AssetsManager",
  options: {
    // IMPORTANT: markRaw prevents Vue from wrapping the manager in a
    // deep reactive proxy. Without it, blade options (stored in
    // ref<BladeDescriptor[]>) auto-unwrap nested Refs, breaking
    // manager.items.value and manager.loading.value access.
    manager: markRaw(assetsManager),
    disabled: !canEdit.value,
  },
});
```

## Features

- **Table view**: Displays assets with thumbnail, name, size, sort order, and creation date columns using `VcDataTable` with declarative `<VcColumn>` API.
- **Upload**: Via toolbar button or drag-and-drop onto the table. Handles duplicate filenames by appending `_1`, `_2`, etc.
- **Delete**: Toolbar delete button (requires selection) and per-row action button.
- **Reorder**: Drag-and-drop row reordering when not in readonly mode.
- **Detail view**: Clicking a row opens an `AssetsDetails` child blade for single-asset editing.
- **Non-image assets**: Files without an image extension render a colored badge with the uppercased extension (`PDF`, `DOCX`, `ZIP`, ...) instead of a thumbnail.
- **Empty state**: Shows upload prompt when no assets exist; the empty-state action button opens the file picker.

## Toolbar

| Button | Condition                      | Action                                           |
| ------ | ------------------------------ | ------------------------------------------------ |
| Add    | `!disabled`                    | Opens file picker for upload                     |
| Delete | `!disabled` and items selected | Calls `manager.removeMany()` with selected items |

## Tips

- **Always use `markRaw()` when passing manager through blade options.** Blade descriptors are stored in `ref<BladeDescriptor[]>()`, which creates a deep reactive proxy. Vue auto-unwraps `Ref` values inside reactive objects, so `manager.items` would become a plain array instead of `Ref<AssetLike[]>` — breaking `.value` access. `markRaw()` prevents this by telling Vue not to make the manager reactive.
- The `manager` object (from `useAssetsManager()`) owns the reactive asset list and all mutation methods. The blade reads `manager.items` and calls `manager.upload()`, `manager.remove()`, `manager.removeMany()`, `manager.reorder()`, and `manager.updateItem()`.
- The `disabled` prop makes the entire blade readonly: no upload, no delete, no reorder.
- Asset thumbnails use `isImage()` from `@core/utilities/assets` to decide between an image preview (`VcImage`) and a colored extension badge (`getExtensionColor` + `getExtensionLabel`).
- The module uses `useBlade()` internally to open the detail sub-blade.
- The `manager` instance can be reused as a `useBladeWidgets` badge source — its `items.value.length` updates reactively as uploads/removes happen inside the blade, so a parent widget showing the asset count refreshes without an extra round-trip.

## Recipes

### Open from a blade widget

Most callers don't open `AssetsManager` directly — they expose it as one of the parent blade's widgets. The widget shows the asset count as a live badge and opens the manager on click. The manager is created once per parent blade and reused across openings.

```typescript
import { computed, markRaw, type Ref, type ComputedRef } from "vue";
import { useBlade, useBladeWidgets, useAssetsManager, usePopup } from "@vc-shell/framework";

interface Entity {
  id?: string;
  productData?: { assets?: Asset[] };
}

export function useEntityWidgets(opts: { item: Ref<Entity | undefined>; disabled: ComputedRef<boolean>; isVisible: ComputedRef<boolean> }) {
  const { item, disabled, isVisible } = opts;
  const { openBlade } = useBlade();
  const { showConfirmation } = usePopup();

  const entityAssets = computed({
    get: () => item.value?.productData?.assets ?? [],
    set: (val) => {
      if (item.value?.productData) item.value.productData.assets = val;
    },
  });

  const assetsManager = useAssetsManager(entityAssets, {
    uploadPath: () => `/catalog/${item.value?.id}`,
    confirmRemove: () => showConfirmation("Are you sure you want to delete the selected assets?"),
  });

  const assetsCount = computed(() => entityAssets.value.length);

  return useBladeWidgets([
    {
      id: "AssetsWidget",
      icon: "lucide-file",
      title: "WIDGETS.ASSETS",
      badge: assetsCount,
      isVisible,
      onClick: () =>
        openBlade({
          name: "AssetsManager",
          options: {
            manager: markRaw(assetsManager),
            disabled: disabled.value,
          },
        }),
    },
  ]);
}
```

Key points:

- `useAssetsManager` is invoked once at widget-setup time, not inside `onClick`. Recreating it per click would lose pending state and break optimistic updates.
- `disabled.value` is unwrapped at click time. Passing the raw `ComputedRef` would work too, but the blade reads `options.value?.disabled` as a plain value.
- `assetsCount` reads from the source array (not from `assetsManager.items`), but both stay in sync because the manager mutates the same array via the setter.

## Related

- `framework/core/composables/useAssetsManager/` -- `useAssetsManager`, `AssetLike`, `UseAssetsManagerReturn`
- `framework/core/utilities/assets.ts` -- `isImage`, `readableSize`, `getExtensionColor`, `getExtensionLabel`
- `framework/modules/assets/components/assets-details/` -- `AssetsDetails` child blade opened on row click
