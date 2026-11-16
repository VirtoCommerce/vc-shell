---
title: Assets Folder Manager
category: reference
group: modules
slug: assets-folder-manager
---

# Assets Folder Manager

A built-in blade that browses a folder of platform asset storage. It lists one folder level at a time, opens subfolders, and uploads, creates and deletes against storage directly. For a flat list of files owned by an entity, see [Assets Manager](./assets-manager.docs.md).

## Overview

`AssetsFolderManager` is registered by `AssetsManagerModule` and opened by name with `openBlade`. It is a browser only: it does not return a chosen file to the opener. Clicking a file opens `AssetsFolderEntryDetails`, a child blade with the file's preview and properties. The same module registers it.

Every request goes to `/api/assets` with `fetch`. Storage is the source of truth: each upload, new folder and delete reloads the current level, there are no local edits.

```typescript
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

openBlade({
  name: "AssetsFolderManager",
  options: { rootUrl: "/stores/1", title: "Store files" },
});
```

## Options (via `useBlade`)

| Option          | Type                                                 | Description                                                                     |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `rootUrl`       | `string`                                             | Root folder, for example `/stores/<id>`. Required. The blade cannot leave it    |
| `title`         | `string?`                                            | Blade title and root breadcrumb. Defaults to i18n `ASSETS_MANAGER.FOLDER.TITLE` |
| `folderActions` | `IAssetsFolderAction[]?`                             | Extra actions on folder rows and cards only                                     |
| `entryInfo`     | `(entry) => IAssetsFolderInfoItem[] \| Promise<...>` | Extra rows in the details blade. See [App hooks](#app-hooks)                    |
| `beforeDelete`  | `(entries) => string \| undefined \| Promise<...>`   | Extra warning in the delete confirmation. See [App hooks](#app-hooks)           |

## Permissions

| Permission              | Controls                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `platform:asset:create` | Toolbar New folder, Upload, Upload from URL, drag-and-drop, the empty-state upload button |
| `platform:asset:delete` | Toolbar Delete, row Delete, the selection column and card checkboxes, details Delete      |

Without the permission the control is hidden. Browsing, search, Download and Copy link need no permission.

## Folder navigation and root guard

- Clicking a folder row opens it. Clicking a file opens the [details blade](#details-blade).
- A bar above the table holds the folder path (breadcrumbs) and the search field. The breadcrumbs lead back to every level. The root crumb shows the blade title, the last crumb is the current folder and is not a link.
- Navigation is limited to the root: a folder opens only if it is in the current listing, and a breadcrumb jump accepts only a crumb of the current trail. Nothing above `rootUrl` is reachable.
- Folders are listed first, then files, each group by name. Paging (20 per page) is client-side over the loaded level.
- Search filters the current folder by name through the API `keyword` parameter. Moving to another folder clears it. When nothing matches, the table says so instead of showing the empty-folder state.
- Copy link copies an absolute URL; a relative `url` from the API is resolved against the current origin.
- A root that does not exist yet (the API answers 404) shows as an empty folder. It is created by the first upload or new folder.
- A request that finishes after the user moved on is discarded, so a fast double click never shows the wrong folder.

## Table and grid view

The two buttons at the end of the bar switch between a table and a grid of cards. The choice is kept in `localStorage` under `VC_ASSETS_FOLDER_MANAGER_VIEW` (`"table"` or `"grid"`) and the blade opens in the table when nothing is stored or storage is blocked.

Both views show the same page of 20 entries, the same selection and the same row actions, so switching keeps the page and what is selected.

- A card shows a 4:3 preview (the image, a folder icon or the extension badge), the name and a line with the size, or "Folder", and the modified date.
- Clicking a card does what clicking a row does. Enter opens it, Space selects it when the user may delete.
- The checkbox (top left) and the actions menu (top right) show on hover and keyboard focus. While anything is selected every checkbox stays visible. On touch screens both are always visible.

## Details blade

Clicking a file opens `AssetsFolderEntryDetails` as a child blade. Clicking another file replaces it, the open file stays highlighted in the table or grid, and moving to another folder or searching closes it.

It shows a large preview and the fields Name, Type (`contentType` or the extension), Size, Dimensions (images only, measured once the image loads), Created, Modified and URL with a copy button. Rows from [`entryInfo`](#app-hooks) follow under a separator. The toolbar has Download, Copy link and Delete. Delete runs the folder blade's own delete, with the same confirmation and `beforeDelete` warning, and closes the details only when the file is gone.

The details follow the folder listing: after a reload they show the fresh entry, and they close when the file disappears. The blade options carry functions, so a page reload or a deep link to it opens nothing and the blade closes itself.

## App hooks

Two options let the opener add what only the app knows about a file.

```typescript
interface IAssetsFolderInfoItem {
  label: string;
  value: string;
}

entryInfo?: (entry: BlobEntry) => IAssetsFolderInfoItem[] | Promise<IAssetsFolderInfoItem[]>;
beforeDelete?: (entries: BlobEntry[]) => string | undefined | Promise<string | undefined>;
```

- `entryInfo` runs each time the details blade shows a file. Its rows appear under the built-in fields. A skeleton shows while it loads; if it throws, one muted line says the information could not be loaded and the rest of the blade works.
- `beforeDelete` gets exactly the entries being deleted, files and folders as selected. It runs before the confirmation; a returned string is added to the confirmation as a second paragraph. Return `undefined` for no warning. If it throws, the error is shown as a toast and nothing is deleted. What a folder's contents imply is up to the app.

Both texts are shown as plain text, never as HTML.

Example: a page builder that knows which pages use each file.

```typescript
openBlade({
  name: "AssetsFolderManager",
  options: {
    rootUrl: "/stores/1",
    entryInfo: async (entry) => {
      const pages = await pageApi.findPagesUsing(entry.url);
      return [{ label: "Used on", value: pages.length ? `${pages.length} pages` : "Not used" }];
    },
    beforeDelete: async (entries) => {
      const used = await pageApi.countPagesUsing(entries.map((entry) => entry.url));
      return used ? `These files are used on ${used} pages. The pages will show a broken image.` : undefined;
    },
  },
});
```

## Drag and drop

Files dropped anywhere on the blade upload into the current folder. Dropped on a folder row or card, they upload into that folder instead: the folder is highlighted while files are over it, the upload goes through the same collision check against that folder, and the current level reloads afterwards. Both need `platform:asset:create`. Dropping is a desktop feature; touch screens have no file drag.

## Collision behaviour

Before uploading, the blade re-reads the current level without the search filter. Each file whose name matches an existing entry (case-insensitive) opens a popup with three choices:

| Choice    | Result                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Overwrite | Uploads with `forceFileOverwrite=true`                                    |
| Rename    | Asks for a new name and checks it again, so a second collision asks again |
| Skip      | The file is not uploaded. Closing the popup also skips                    |

Files without a collision upload straight away. If some uploads fail, the level reloads and one toast reports how many failed.

## Delete confirmation

Toolbar Delete, the row or card action and the details blade Delete all ask for confirmation. The text names up to three selected items and shows a count past that. When a folder is selected, the text says everything inside it is deleted too. Deleting a folder removes its contents in storage. A [`beforeDelete`](#app-hooks) warning is added below the text.

## Folder actions

`folderActions` adds row actions to folder rows. The opener supplies them, there is no global registry.

```typescript
interface IAssetsFolderAction {
  id: string;
  title: string;
  icon?: string; // defaults to lucide-folder-cog
  permission?: string | string[]; // hidden when the user lacks it
  clickHandler: (folder: BlobEntry, ctx: { reload: () => Promise<void> }) => void | Promise<void>;
}
```

```typescript
openBlade({
  name: "AssetsFolderManager",
  options: {
    rootUrl: "/stores/1",
    folderActions: [
      {
        id: "publish-folder",
        title: "Publish folder",
        icon: "lucide-send",
        permission: "platform:asset:create",
        clickHandler: async (folder, { reload }) => {
          await publish(folder.url);
          await reload();
        },
      },
    ],
  },
});
```

An error thrown by `clickHandler` is shown as a toast.

## Recipe: open an entity's folder from a widget

A widget on a store blade that opens the store's folder:

```typescript
import { computed, type Ref } from "vue";
import { useBlade, useBladeWidgets } from "@vc-shell/framework";

export function useStoreWidgets(store: Ref<{ id: string; name: string } | undefined>) {
  const { openBlade } = useBlade();

  useBladeWidgets([
    {
      id: "StoreFilesWidget",
      icon: "lucide-folder",
      title: "Files",
      isVisible: computed(() => !!store.value?.id),
      onClick() {
        if (!store.value) return;
        openBlade({
          name: "AssetsFolderManager",
          options: { rootUrl: `/stores/${store.value.id}`, title: store.value.name },
        });
      },
    },
  ]);
}
```

## Related

- `framework/modules/assets-manager/components/assets-folder-manager/` -- the blade, the details blade, its internal composable, grid and popups
- [Assets Manager](./assets-manager.docs.md) -- the flat asset list blade for an entity's own assets
