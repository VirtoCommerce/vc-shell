# VcImageTile

Square image tile with skeleton loading, fade-in transition, and a slide-up action tray on hover (desktop) or tap (touch devices).

## When to Use

- Displaying image thumbnails in galleries or upload previews
- Any grid of images that need preview, edit, or delete actions
- When NOT to use: for the full gallery experience with upload/reorder, use `VcGallery` (which uses VcImageTile internally)

## Basic Usage

```vue
<template>
  <div style="width: 160px;">
    <VcImageTile
      src="/images/product-photo.jpg"
      name="product-photo.jpg"
      :actions="{ preview: true, remove: true }"
      @preview="openPreview"
      @remove="deleteImage"
    />
  </div>
</template>

<script setup lang="ts">
import { VcImageTile } from "@vc-shell/framework";

function openPreview() { /* open lightbox */ }
function deleteImage() { /* remove from list */ }
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image source URL |
| `alt` | `string` | — | Image alt text |
| `name` | `string` | — | File name displayed in the tray |
| `imageFit` | `"contain" \| "cover"` | `"contain"` | How the image fits within the tile |
| `actions` | `VcImageTileActions` | — | Which built-in action buttons to show |

## VcImageTileActions Interface

```ts
interface VcImageTileActions {
  preview?: boolean;  // Fullscreen/maximize button (default visible)
  edit?: boolean;     // Pencil edit button
  remove?: boolean;   // Trash delete button
}
```

## Events

| Event | Description |
|-------|-------------|
| `preview` | Preview button clicked |
| `edit` | Edit button clicked |
| `remove` | Remove button clicked |

## Slots

| Slot | Description |
|------|-------------|
| `overlay` | Overlay content on top of the image (e.g., drag handle) |
| `actions` | Additional action buttons in the tray |

## Common Patterns

### Image Grid

```vue
<div class="tw-grid tw-gap-2" style="grid-template-columns: repeat(3, 140px);">
  <VcImageTile
    v-for="img in images"
    :key="img.id"
    :src="img.url"
    :name="img.filename"
    :actions="{ preview: true, remove: true }"
    @preview="preview(img)"
    @remove="remove(img)"
  />
</div>
```

### All Actions Enabled

```vue
<VcImageTile
  src="/img/photo.jpg"
  name="photo.jpg"
  :actions="{ preview: true, edit: true, remove: true }"
  @preview="onPreview"
  @edit="onEdit"
  @remove="onRemove"
/>
```

### Cover Fit for Photos

```vue
<!-- Use "cover" to fill the entire tile (cropping edges) -->
<VcImageTile src="/img/landscape.jpg" image-fit="cover" />
```

### With Drag Handle Overlay

```vue
<VcImageTile :src="img.url" :actions="{ preview: true, remove: true }">
  <template #overlay>
    <div class="tw-absolute tw-top-1 tw-left-1 tw-cursor-move">
      <VcIcon icon="lucide-grip-vertical" size="s" />
    </div>
  </template>
</VcImageTile>
```

### Skeleton State

When `src` is not provided or the image is still loading, a shimmer animation skeleton is displayed automatically. No additional configuration is needed.

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--image-tile-radius` | `8px` | Corner radius |
| `--image-tile-border` | `var(--secondary-200)` | Border color |
| `--image-tile-shadow` | `0 1px 2px rgb(0 0 0 / 0.05)` | Default shadow |
| `--image-tile-shadow-hover` | `0 4px 12px rgb(0 0 0 / 0.1)` | Hover shadow |
| `--image-tile-tray-bg` | `rgba(255, 255, 255, 0.85)` | Tray background |
| `--image-tile-tray-blur` | `12px` | Tray backdrop blur |
| `--image-tile-skeleton-from` | `var(--secondary-100)` | Skeleton gradient start |
| `--image-tile-skeleton-to` | `var(--secondary-200)` | Skeleton gradient end |
| `--image-tile-action-color` | `var(--secondary-600)` | Action button color |
| `--image-tile-action-hover` | `var(--primary-500)` | Action button hover color |
| `--image-tile-action-danger` | `var(--danger-500)` | Danger action hover color |

## Accessibility

- Tile is inherently square via `aspect-ratio: 1`
- On touch devices, tap toggles the action tray (click-outside closes it)
- On desktop, hover reveals the tray with a slide-up animation
- The tile lifts slightly on hover for visual feedback
- Action buttons have localized `title` attributes for tooltip descriptions

## Related Components

- [VcGallery](../../organisms/vc-gallery/) — full gallery organism with upload, reorder, and preview
- [VcFileUpload](../vc-file-upload/) — file upload drop zone
