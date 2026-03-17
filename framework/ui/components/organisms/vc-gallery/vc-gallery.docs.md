# VcGallery

A responsive multi-image gallery with drag-and-drop reorder, file upload, lightbox preview, and per-image actions.

## When to use

- Use **VcGallery** for multi-image fields (product images, media libraries).
- For single-image upload (avatar, logo), use **VcImageUpload** instead.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `ICommonAsset[]` | `[]` | Array of image assets to display. |
| `disabled` | `boolean` | `false` | Disables all interactive actions. |
| `multiple` | `boolean` | `false` | Allow selecting multiple files in upload dialog. |
| `loading` | `boolean` | `false` | Shows a loading spinner on the upload zone. |
| `itemActions` | `{ preview?: boolean; edit?: boolean; remove?: boolean }` | `{ preview: true, edit: true, remove: true }` | Per-tile action visibility. |
| `rules` | `IValidationRules` | `undefined` | Validation rules for uploaded files. |
| `name` | `string` | `"Gallery"` | Field name for validation messages. |
| `accept` | `string` | `undefined` | Accepted file extensions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tile size preset. |
| `gap` | `number` | `8` | Gap between tiles in pixels. |
| `imagefit` | `"contain" \| "cover"` | `"contain"` | How images fit within tiles. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `upload` | `(files: FileList, startingSortOrder?: number)` | Emitted when files are selected or dropped. |
| `sort` | `ICommonAsset[]` | Emitted after drag-and-drop reorder with the new order. |
| `edit` | `ICommonAsset` | Emitted when the edit action is triggered. |
| `remove` | `ICommonAsset` | Emitted when the remove action is triggered. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `item` | `{ image, index, actions }` | Custom tile rendering. |
| `empty` | -- | Custom empty state when disabled with no images. |
| `footer` | `{ images }` | Content below the grid. |

## Features

- **Drag-and-drop reorder** -- Drag tiles to reorder. Emits `sort` with the new array.
- **External file drop** -- Drop files from the OS onto the gallery to upload.
- **Lightbox preview** -- Click a tile to open a full-screen preview carousel.
- **Responsive grid** -- Auto-fill grid adapts to container width using CSS grid.

## Usage

```vue
<VcGallery
  :images="product.images"
  size="md"
  imagefit="cover"
  :item-actions="{ preview: true, edit: true, remove: true }"
  @upload="handleUpload"
  @sort="handleSort"
  @edit="handleEdit"
  @remove="handleRemove"
/>
```
