---
title: Assets Module
category: reference
group: modules
slug: assets
---

# Assets Details Module

A built-in child blade for editing a single asset's metadata: display name, alt text (images only), and description. Opened by `AssetsManager` when the user clicks a table row, but also usable standalone from any parent blade that needs single-asset editing.

## Overview

The blade reads an `AssetLike` instance from `options.asset`, exposes a form pre-populated from it, and delegates persistence back to the caller through two callbacks (`assetEditHandler`, `assetRemoveHandler`). The blade itself never mutates the original asset and never talks to the network — the caller decides what saving and removing means.

The module is registered as `AssetsDetailsModule` and exposes the `AssetsDetails` blade (registered globally under the name `"AssetsDetails"`).

## Module Registration

```typescript
import { AssetsDetailsModule } from "@vc-shell/framework";

// Registered automatically when the framework loads
// Exposes: AssetsDetails blade component
```

## Options (via `useBlade`)

The blade reads its configuration from `options` via `useBlade<AssetsDetailsOptions>()` (not props):

| Option               | Type                                          | Description                                                                                                                                   |
| -------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `asset`              | `AssetLike`                                   | The asset to edit. The blade clones it into local state — the source object is never mutated until `assetEditHandler` is called.              |
| `disabled`           | `boolean?`                                    | When true, every input is read-only and the toolbar Save/Delete buttons are disabled.                                                         |
| `hiddenFields`       | `string[]?`                                   | Field names to hide. Supported values: `"name"`, `"altText"`, `"description"`. The header (preview, size, created date, URL) is always shown. |
| `assetEditHandler`   | `(asset: AssetLike) => void \| Promise<void>` | Called by the toolbar Save button with the edited copy. The blade closes itself after the handler resolves.                                   |
| `assetRemoveHandler` | `(asset: AssetLike) => Promise<void>`         | Called by the toolbar Delete button. The blade closes itself after the handler resolves.                                                      |

## Usage

### Direct invocation

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

### Used by AssetsManager

When `AssetsManager` opens this blade on row click, it wires the manager's mutation methods into the handlers automatically:

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

## Header

The header is always rendered above the editable form and is not configurable through `hiddenFields`:

| Element      | Source                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Preview      | `VcImage` thumbnail for image extensions (png/jpg/jpeg/svg/gif), colored extension badge otherwise |
| Size         | `readableSize(asset.size)` — formatted as `KB`/`MB`/`GB`                                           |
| Created date | `asset.createdDate` rendered with `type="date-ago"`                                                |
| URL          | `asset.url` displayed as a copyable link with `asset.name` as the visible label                    |

## Form fields

All fields are bound to a local clone of `asset`. They can be hidden individually via `hiddenFields`.

| Field         | Visibility                                        | Notes                                                                                                                          |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | Hidden if `hiddenFields` includes `"name"`        | Required. Edits the **base name only** — the original extension is preserved on save (e.g. editing `report.pdf` keeps `.pdf`). |
| `altText`     | Image assets only; hide via `"altText"`           | Plain string. Shown only when `asset.typeId === "Image"`.                                                                      |
| `description` | Hidden if `hiddenFields` includes `"description"` | Multiline textarea.                                                                                                            |

## Toolbar

| Button | Disabled condition                                                                                                  | Action                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Save   | `disabled === true`, the form is invalid, or the form is not dirty (vee-validate `useIsFormValid`/`useIsFormDirty`) | `await assetEditHandler(editedAsset)`, then `closeSelf()`   |
| Delete | `disabled === true`                                                                                                 | `await assetRemoveHandler(editedAsset)`, then `closeSelf()` |

## Tips

- **Extension is locked.** The `name` input only edits the base name; the original extension is reattached on save. Renaming `photo.png` to `cover` produces `cover.png`.
- **Required name validation** uses vee-validate's `required` rule. The Save button stays disabled until validation passes.
- **`assetEditHandler`** is invoked with the edited clone — the original `options.asset` reference is never mutated. Callers should treat the argument as the new state.
- **`disabled` makes the blade fully read-only:** inputs are disabled and toolbar Save/Delete are disabled regardless of dirtiness.
- **`hiddenFields` does not enforce required-ness.** Hiding `"name"` skips the validated `<Field>`, so the Save button only depends on form dirtiness.

## Related

- `framework/modules/assets-manager/` -- parent `AssetsManager` blade that opens `AssetsDetails` on row click
- `framework/core/composables/useAssetsManager/` -- `AssetLike` type definition
- `framework/core/utilities/assets.ts` -- `isImage`, `readableSize`, `getExtensionColor`, `getExtensionLabel`
- `framework/ui/components/molecules/vc-field/` -- `VcField` used by the header for size/date/url
