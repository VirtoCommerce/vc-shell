---
title: Assets Module
category: reference
group: modules
slug: assets
---

# Assets Details Module

A built-in child blade that shows one asset. It has two modes:

- **Flat mode** (`asset`): an asset stored on an entity, such as a product image or a task attachment. The user edits the name, alt text (images only) and description, then saves or deletes.
- **Storage mode** (`assetSource`): a file in a storage folder. The blade is read-only and offers Download, Copy link and Delete.

`AssetsManager` opens it in flat mode when the user clicks a row, `AssetsFolderManager` in storage mode when the user clicks a file. Any parent blade can open it the same way.

## Overview

The blade never talks to the network. Saving and deleting go back to the caller through `assetEditHandler` and `assetRemoveHandler`; the caller decides what they mean.

The module is registered as `AssetsDetailsModule` and exposes the blade under the name `"AssetsDetails"`.

## Module Registration

```typescript
import { AssetsDetailsModule } from "@vc-shell/framework";

// Registered automatically when the framework loads
// Exposes: AssetsDetails blade component
```

## Options (via `useBlade`)

The blade reads its configuration from `options` via `useBlade<AssetsDetailsOptions>()`, not props. Every option is optional.

| Option               | Type                                                                  | Description                                                                                                                       |
| -------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `asset`              | `AssetLike`                                                           | Flat mode. The asset to edit. The blade works on a copy; the source object is not touched until `assetEditHandler` gets the copy. |
| `assetSource`        | `ComputedRef<AssetLike \| undefined>`                                 | Storage mode. The live entry. The blade follows its changes and closes when it becomes `undefined`. Wins over `asset`.            |
| `disabled`           | `boolean`                                                             | Disables Save and Delete, and makes the form fields read-only. Download and Copy link stay available.                             |
| `hiddenFields`       | `string[]`                                                            | Form fields to hide: `"name"`, `"altText"`, `"description"`. The header and the File section are always shown.                    |
| `assetEditHandler`   | `(asset: AssetLike) => void`                                          | Flat mode. Called by Save with the edited copy. The blade closes after it resolves.                                               |
| `assetRemoveHandler` | `(asset: AssetLike) => Promise<void \| boolean>`                      | Called by Delete. The blade closes after it resolves, unless it resolves `false`. A rejection also keeps the blade open.          |
| `extraInfo`          | `(asset: AssetLike) => IAssetInfoItem[] \| Promise<IAssetInfoItem[]>` | Extra rows under the File section, in both modes. See [Extra rows](#extra-rows).                                                  |

The exported types:

```typescript
import type { AssetsDetailsOptions, IAssetInfoItem } from "@vc-shell/framework";

interface IAssetInfoItem {
  label: string;
  value: string;
}
```

## Usage

### Flat mode

```typescript
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

openBlade({
  name: "AssetsDetails",
  options: {
    asset: selectedAsset,
    disabled: !canEdit.value,
    hiddenFields: ["altText"],
    assetEditHandler: async (edited) => {
      await api.updateAsset(edited);
    },
    assetRemoveHandler: async (asset) => {
      await api.deleteAsset(asset.id);
    },
  },
});
```

### Storage mode

Pass the entry as a computed, so the blade shows fresh data after a reload and closes when the file is gone.

```typescript
import { computed } from "vue";
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

openBlade({
  name: "AssetsDetails",
  options: {
    assetSource: computed(() => entries.value.find((entry) => entry.url === openUrl.value)),
    assetRemoveHandler: async (asset) => {
      const confirmed = await confirmDelete(asset.name);
      if (!confirmed) return false; // keeps the blade open
      await api.deleteBlobs([asset.url]);
    },
  },
});
```

### Used by AssetsManager

```typescript
// inside AssetsManager
openBlade({
  name: "AssetsDetails",
  options: {
    asset,
    disabled: readonly.value,
    hiddenFields: options.value?.hiddenFields,
    assetEditHandler: (asset) => manager.updateItem(asset),
    assetRemoveHandler: (asset) => manager.remove(asset),
  },
});
```

## Layout

| Part     | Content                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header   | A 96 px preview for images (click opens the file in a new tab), or a tile with the extension label (`FILE` without an extension). The name and chips: extension, size, image dimensions. |
| URL row  | The absolute URL (a relative URL is resolved against the page origin) on one line, with a copy button. Only when the asset has a `url`.                                                  |
| Metadata | Flat mode only. Name, alt text, description. Hidden when `hiddenFields` hides all of them.                                                                                               |
| File     | Type (`contentType` or the extension), size, dimensions (images, once loaded), created date. Storage mode adds the modified date.                                                        |
| Extra    | Rows from `extraInfo`, under a separator.                                                                                                                                                |

An image is detected by the file extension (`isImage(name)`). An image that has no `url` or fails to load shows the tile and no dimensions.

## Form fields

Flat mode only. The fields edit the copy of `asset`.

| Field         | Visibility                           | Notes                                                                                          |
| ------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `name`        | Hide with `"name"`                   | Required. Edits the base name only; the extension is shown as a suffix and reattached on save. |
| `altText`     | Only when `asset.typeId === "Image"` | Hide with `"altText"`.                                                                         |
| `description` | Hide with `"description"`            | Multiline.                                                                                     |

## Toolbar

| Button    | Mode    | Shown when                                 | Disabled when                                       | Action                                                                   |
| --------- | ------- | ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Save      | Flat    | Always                                     | `disabled`, the form is invalid, or nothing changed | `await assetEditHandler(copy)`, then close                               |
| Download  | Both    | The asset has a `url`                      | Never                                               | Downloads the file under its name                                        |
| Copy link | Storage | The asset has a `url`                      | Never                                               | Copies the absolute URL and shows a toast                                |
| Delete    | Both    | Storage mode needs `platform:asset:delete` | `disabled`                                          | `await assetRemoveHandler(asset)`, then close unless it resolved `false` |

Flat-mode Delete has no permission check; the caller decides who may delete.

## Extra rows

`extraInfo` runs each time the blade shows a file, and again when the file's `url` or `modifiedDate` changes. A skeleton shows while it loads. If it throws or rejects, one muted line says the information could not be loaded and the rest of the blade works. When several calls overlap, the last one wins.

```typescript
openBlade({
  name: "AssetsDetails",
  options: {
    assetSource,
    extraInfo: async (asset) => {
      const pages = await api.pagesUsing(asset.url);
      return [{ label: "Used on", value: `${pages.length} pages` }];
    },
  },
});
```

## Closing

- Save closes the blade after `assetEditHandler` resolves.
- Delete closes it after `assetRemoveHandler` resolves, unless the result is `false`. A rejection keeps it open.
- In storage mode, the blade closes when `assetSource` becomes `undefined`.
- Options carry functions and a live ref, so a page reload or a deep link mounts the blade without `asset` or `assetSource`. It then closes itself.

## Tips

- **Extension is locked.** Renaming `photo.png` to `cover` saves `cover.png`. A name without an extension, such as `README`, is saved as typed.
- **Only the last extension is locked.** `my.photo.v2.jpg` edits as `my.photo.v2` with `.jpg` locked.
- **The source asset is never mutated.** `assetEditHandler` gets the edited copy; treat it as the new state.
- **`hiddenFields` does not enforce required fields.** Hiding `"name"` drops its validation, so Save depends on dirtiness only.

## Related

- [Assets Manager](../assets-manager/assets-manager.docs.md) -- opens `AssetsDetails` in flat mode for an entity's assets
- [Assets Folder Manager](../assets-manager/assets-folder-manager.docs.md) -- opens `AssetsDetails` in storage mode for files in a folder
- `framework/core/composables/useAssetsManager/` -- `AssetLike` type definition
- `framework/core/utilities/assets.ts` -- `isImage`, `readableSize`, `absoluteUrl`, `downloadFile`, `getExtensionColor`
