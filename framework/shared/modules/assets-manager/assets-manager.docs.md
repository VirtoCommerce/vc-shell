# Assets Manager Module

A built-in blade module for managing file assets (images, documents, archives). Provides upload, delete, reorder, and preview functionality via a table-based UI.

## Overview

The Assets Manager is registered as an app module via `defineAppModule` and opened as a child blade from any parent blade that needs asset management. The parent provides handler callbacks for upload, edit, and remove operations -- the module handles the UI and delegates data mutations back to the parent.

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
| `assets` | `ICommonAsset[]` | Initial array of assets to display |
| `loading` | `Ref<boolean>` | Reactive loading state for the table overlay |
| `assetsEditHandler` | `(assets) => ICommonAsset[]` | Called when assets are reordered or edited |
| `assetsUploadHandler` | `(files) => Promise<ICommonAsset[]>` | Called with selected files for upload |
| `assetsRemoveHandler` | `(assets) => Promise<ICommonAsset[]>` | Called to delete selected assets |
| `disabled` | `boolean` | When true, hides upload/delete actions and disables reordering |
| `hiddenFields` | `string[]` | Fields to hide in the detail view |

## Usage

Open the Assets Manager as a child blade:

```typescript
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade, resolveBladeByName } = useBladeNavigation();

openBlade({
  blade: resolveBladeByName("AssetsManager"),
  options: {
    assets: product.assets,
    loading: isLoading,
    disabled: !canEdit.value,
    hiddenFields: ["sortOrder"],
    assetsUploadHandler: async (files) => {
      const uploaded = await uploadFiles(files);
      return [...product.assets, ...uploaded];
    },
    assetsEditHandler: (assets) => {
      product.assets = assets;
      return assets;
    },
    assetsRemoveHandler: async (assets) => {
      await deleteAssets(assets);
      return product.assets.filter(a => !assets.includes(a));
    },
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
| Delete | `!disabled` and items selected | Calls `assetsRemoveHandler` with selected items |

## Tips

- All mutation handlers must return the updated full asset array -- the module replaces its internal list with the return value.
- The `disabled` prop makes the entire blade readonly: no upload, no delete, no reorder.
- Asset thumbnails use `isImage()` from shared utilities to determine if an image preview or a file-type icon should be shown.
- The module uses `useBladeNavigation()` internally to open the detail sub-blade.

## Related

- `framework/shared/utilities/assets.ts` -- `isImage`, `getFileThumbnail`, `readableSize`
- `framework/core/utilities/date/` -- `formatDateRelative` for creation dates
- `framework/core/types/` -- `ICommonAsset` interface
