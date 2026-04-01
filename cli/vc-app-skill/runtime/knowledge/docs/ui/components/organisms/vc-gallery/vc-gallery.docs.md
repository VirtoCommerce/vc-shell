# VcGallery

A responsive multi-image gallery with drag-and-drop reorder, file upload, lightbox preview, and per-image actions. VcGallery renders images in a CSS grid that auto-fills based on the container width, with a built-in upload zone tile at the end of the grid. It is the standard component for managing collections of images such as product photos, media libraries, and document attachments.

## When to Use

- Use **VcGallery** for multi-image fields (product images, media libraries, banner collections).
- Use when you need drag-and-drop reordering of images.
- For single-image upload (avatar, logo), use **VcImageUpload** instead.
- When NOT to use: for non-image file lists; for single image fields.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `"filmstrip" \| "grid"` | `"filmstrip"` | Layout mode — filmstrip shows a single scrollable row with expand/collapse; grid shows the classic multi-row auto-fill layout. |
| `label` | `string` | `undefined` | Label text displayed in the gallery header. |
| `required` | `boolean` | `false` | Shows a required indicator (`*`) on the label. |
| `images` | `ICommonAsset[]` | `[]` | Array of image assets to display. |
| `disabled` | `boolean` | `false` | Disables all interactive actions. |
| `multiple` | `boolean` | `false` | Allow selecting multiple files in upload dialog. |
| `loading` | `boolean` | `false` | Shows a loading overlay with spinner on the gallery. |
| `itemActions` | `{ preview?: boolean; edit?: boolean; remove?: boolean }` | `{ preview: true, edit: true, remove: true }` | Per-tile action visibility. |
| `rules` | `IValidationRules` | `undefined` | Validation rules for uploaded files. |
| `name` | `string` | `"Gallery"` | Field name for validation messages. |
| `accept` | `string` | `undefined` | Accepted file extensions. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tile size preset. Sizes are smaller on mobile. |
| `gap` | `number` | `8` | Gap between tiles in pixels. |
| `imagefit` | `"contain" \| "cover"` | `"contain"` | How images fit within tiles. |
| `thumbnailSize` | `ThumbnailSize` | auto from `size` | Thumbnail size for tile images. Auto-mapped: sm→128x128, md→216x216, lg→348x348. Preview thumbnails use 64x64. |

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

- **Filmstrip layout (default)** -- Single-row scrollable strip powered by Swiper. Navigate with arrows, mouse wheel, or swipe. Click "Expand (N)" to show all images in a grid. "Collapse" returns to filmstrip.
- **Grid layout** -- Classic auto-fill grid that wraps images into multiple rows. Set `layout="grid"` to use this mode.
- **Drag-and-drop reorder** -- Drag tiles by the grip handle to reorder (powered by SortableJS). Works on both desktop and touch devices. In filmstrip mode, dragging to the edge auto-scrolls the strip. Emits `sort` with the new array.
- **External file drop** -- Drop files from the OS onto the gallery to upload. The dashed border acts as a visual drop zone indicator (desktop only). A full overlay appears during drag-over.
- **Fullscreen preview** -- Click the preview button to open a fullscreen carousel. Swipe or use arrow keys to navigate. Thumbnail strip at the bottom syncs with the main image.
- **Per-tile actions** -- Each tile shows preview, edit, and remove buttons. On desktop: visible on hover. On mobile: visible on tap. Tile name is shown in the top bar alongside the drag handle.
- **Loading state** -- When `loading` is true, a pulsing border and spinner overlay appear on the gallery. Upload button is disabled. Swiper navigation is frozen.
- **Mobile responsive** -- Smaller tile sizes, no drag-and-drop hints, no dashed borders, compact action buttons, tap-to-reveal overlays. Uses `useResponsive` throughout.
- **Lazy loading** -- Images use native `loading="lazy"` for deferred loading.

## Basic Usage

```vue
<VcGallery
  label="Product Images"
  required
  :images="product.images"
  imagefit="cover"
  @upload="handleUpload"
  @sort="handleSort"
  @edit="handleEdit"
  @remove="handleRemove"
/>
```

## Filmstrip Layout (Default)

```vue
<VcGallery
  label="Images"
  :images="product.images"
  imagefit="cover"
  @upload="handleUpload"
  @sort="handleSort"
  @remove="handleRemove"
/>
```

## Classic Grid Layout

```vue
<VcGallery
  layout="grid"
  label="Attachments"
  :images="product.images"
  @upload="handleUpload"
  @sort="handleSort"
/>
```

## Recipe: Product Image Gallery in a Blade

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { ICommonAsset } from "@vc-shell/framework";

const images = ref<ICommonAsset[]>([]);

async function handleUpload(files: FileList, startingSortOrder?: number) {
  for (const file of Array.from(files)) {
    const uploaded = await api.uploadImage(file);
    uploaded.sortOrder = startingSortOrder ?? images.value.length;
    images.value.push(uploaded);
  }
}

function handleSort(sorted: ICommonAsset[]) {
  images.value = sorted;
}

function handleEdit(image: ICommonAsset) {
  // Open an image editor blade
  openBlade({ component: ImageEditorBlade, param: image.id });
}

function handleRemove(image: ICommonAsset) {
  images.value = images.value.filter((i) => i.url !== image.url);
}
</script>

<template>
  <VcBlade title="Product Images">
    <VcGallery
      label="Product Images"
      required
      :images="images"
      multiple
      accept=".jpg,.png,.webp"
      :rules="{ fileWeight: 2000 }"
      size="lg"
      imagefit="cover"
      @upload="handleUpload"
      @sort="handleSort"
      @edit="handleEdit"
      @remove="handleRemove"
    />
    <VcHint class="tw-mt-2">
      Drag images to reorder. The first image is used as the primary thumbnail.
    </VcHint>
  </VcBlade>
</template>
```

## Recipe: Read-Only Gallery (Disabled)

```vue
<VcGallery
  :images="order.attachments"
  disabled
  :item-actions="{ preview: true, edit: false, remove: false }"
  size="sm"
>
  <template #empty>
    <div class="tw-text-center tw-text-gray-400 tw-py-8">
      No attachments for this order.
    </div>
  </template>
</VcGallery>
```

## Recipe: Custom Tile with Footer Info

```vue
<VcGallery :images="mediaLibrary" @upload="handleUpload" @remove="handleRemove">
  <template #footer="{ images }">
    <VcHint>{{ images.length }} image(s) uploaded</VcHint>
  </template>
</VcGallery>
```

## Common Mistakes

- **Not handling `sort` event** -- If you skip the `sort` handler, the visual reorder will not persist. Always update your data array in the `sort` handler.
- **Forgetting `multiple` prop** -- By default, the file picker allows only one file. Set `multiple` to let users select several files at once.
- **Large files without validation** -- Always set `rules` with a `fileWeight` limit (in KB) to prevent users from uploading oversized images that slow down the application.

## Tips

- The `size` prop controls tile dimensions: `"sm"` is good for compact grids (e.g., thumbnails in a sidebar), `"md"` is the standard, and `"lg"` works well for hero image management. Tiles are automatically smaller on mobile.
- Use `imagefit="cover"` for photo galleries where cropping is acceptable, and `"contain"` for logos or icons where the full image must be visible.
- The filmstrip layout is ideal for blades where vertical space is limited. Users can expand to see all images or scroll horizontally. The classic grid layout is better for dedicated media management pages.
- Use the `label` prop to display a header label integrated with the upload button. Add `required` to show a required indicator.
- The `startingSortOrder` parameter in the `upload` event tells you where the new files should be inserted in the sort order. Use it to maintain correct ordering when appending new images.
- On desktop, reorder by dragging the grip handle icon. In filmstrip mode, dragging to the strip edge auto-scrolls to reveal more tiles.
- On mobile, tap a tile to reveal action buttons and the image name. Drag-and-drop hints and dashed borders are hidden automatically.

## Accessibility

- Tiles are keyboard-navigable with Tab and action buttons are focusable
- Fullscreen preview supports keyboard navigation (arrow keys, Escape to close) and swipe gestures
- The upload button in the header is keyboard-accessible
- On mobile, tile actions are revealed via tap with click-outside to dismiss

## Related Components

- **VcImageUpload** -- single-image upload component
- **VcImageTile** -- the internal tile component used for each image (topbar with name + drag handle, bottom tray with actions)
- **VcFileUpload** -- the file upload drop zone used in empty gallery state
- **VcLabel** -- used internally when `label` prop is set
