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

## Props (Options)

The blade receives its configuration via the `options` prop when opened:

| Option | Type | Description |
|---|---|---|
| `title` | `string` | Custom blade title (defaults to i18n `ASSETS_MANAGER.TITLE`) |
| `manager` | `UseAssetsManagerReturn` | The asset manager instance from `useAssetsManager()` |
| `disabled` | `boolean` | When true, hides upload/delete actions and disables reordering |
| `hiddenFields` | `string[]` | Fields to hide in the detail view |

## Usage

Open the Assets Manager as a child blade:

```typescript
import { markRaw } from "vue";
import { useBlade, useAssetsManager } from "@vc-shell/framework";

const { openBlade } = useBlade();

const assetsManager = useAssetsManager(product.assets, {
  uploadPath: () => `/catalog/${product.id}`,
  confirmRemove: () => confirm("Delete selected assets?"),
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
    hiddenFields: ["sortOrder"],
  },
});
```

## Features

- **Table view**: Displays assets with thumbnail, name, size, sort order, and creation date columns.
- **Upload**: Via toolbar button or drag-and-drop onto the table. Handles duplicate filenames by appending `_1`, `_2`, etc.
- **Delete**: Toolbar delete button (requires selection) and per-row action button.
- **Reorder**: Drag-and-drop row reordering when not in readonly mode.
- **Detail view**: Clicking a row opens an `AssetsDetails` child blade for single-asset editing.
- **Mobile**: Responsive card layout for mobile viewports.
- **Empty state**: Shows upload prompt when no assets exist (or "No assets" in readonly mode).

## Toolbar

| Button | Condition | Action |
|---|---|---|
| Add | `!disabled` | Opens file picker for upload |
| Delete | `!disabled` and items selected | Calls `manager.removeMany()` with selected items |

## Tips

- **Always use `markRaw()` when passing manager through blade options.** Blade descriptors are stored in `ref<BladeDescriptor[]>()`, which creates a deep reactive proxy. Vue auto-unwraps `Ref` values inside reactive objects, so `manager.items` would become a plain array instead of `Ref<AssetLike[]>` — breaking `.value` access. `markRaw()` prevents this by telling Vue not to make the manager reactive.
- The `manager` object (from `useAssetsManager()`) owns the reactive asset list and all mutation methods. The blade reads `manager.items` and calls `manager.upload()`, `manager.remove()`, `manager.removeMany()`, `manager.reorder()`, and `manager.updateItem()`.
- The `disabled` prop makes the entire blade readonly: no upload, no delete, no reorder.
- Asset thumbnails use `isImage()` from shared utilities to determine if an image preview or a file-type icon should be shown.
- The module uses `useBlade()` internally to open the detail sub-blade.

## Related

- `framework/core/composables/useAssetsManager/` -- `useAssetsManager`, `AssetLike`, `UseAssetsManagerReturn`
- `framework/shared/utilities/assets.ts` -- `isImage`, `getFileThumbnail`, `readableSize`
- `framework/core/utilities/date/` -- `formatDateRelative` for creation dates
