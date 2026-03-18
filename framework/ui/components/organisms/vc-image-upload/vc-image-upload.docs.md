# VcImageUpload

A single-image upload organism that displays either a drag-and-drop upload zone or an image tile with preview and remove actions. VcImageUpload manages three visual states automatically: an interactive dropzone when no image is set, an image tile with action overlays when an image is provided, and a disabled empty state with a hint message. It integrates with vee-validate for file validation (size, format) and supports lightbox preview via the built-in VcImageTile component.

## When to Use

- Use **VcImageUpload** for single-image fields (avatar, logo, thumbnail, hero image).
- Use when you need drag-and-drop file selection with validation.
- For multi-image galleries with reorder support, use **VcGallery** instead.
- When NOT to use: for multiple images (use VcGallery); for non-image file uploads (build a custom uploader).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `ICommonAsset` | `undefined` | The currently displayed image asset. |
| `disabled` | `boolean` | `false` | Disables upload and remove actions. |
| `loading` | `boolean` | `false` | Shows a loading spinner on the upload zone. |
| `accept` | `string` | `.jpg,.png,.jpeg,.webp,.heic,.svg` | Accepted file extensions. |
| `rules` | `IValidationRules` | `undefined` | Validation rules (e.g. `{ fileWeight: 300 }`). |
| `name` | `string` | `"Image"` | Field name for validation messages. |
| `icon` | `string` | `"lucide-cloud-upload"` | Upload zone placeholder icon. |
| `placeholder` | `{ text: string; link: string }` | `undefined` | Custom text for the upload zone. |
| `previewable` | `boolean` | `true` | Enables lightbox preview on click. |
| `removable` | `boolean` | `true` | Shows the remove action on the image tile. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `upload` | `FileList` | Emitted when files are selected or dropped. |
| `remove` | `ICommonAsset` | Emitted when the remove button is clicked. |

## Visual States

The component has three visual states:

1. **Upload zone** -- No image and not disabled. Shows a dropzone with icon, placeholder text, and a clickable link. Accepts drag-and-drop or click to open the file picker.
2. **Image tile** -- An image is provided. Shows the image with optional preview (lightbox) and remove action buttons on hover.
3. **Empty disabled** -- No image and disabled. Shows an empty hint message indicating that uploading is not available.

## Basic Usage

```vue
<VcImageUpload
  :image="product.thumbnail"
  accept=".jpg,.png,.webp"
  :rules="{ fileWeight: 500 }"
  @upload="handleUpload"
  @remove="handleRemove"
/>
```

## Recipe: Avatar Upload in a User Profile Blade

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { ICommonAsset } from "@vc-shell/framework";

const avatar = ref<ICommonAsset | undefined>();

async function handleUpload(files: FileList) {
  const file = files[0];
  const uploaded = await uploadAvatar(file);
  avatar.value = uploaded;
}

function handleRemove() {
  avatar.value = undefined;
}
</script>

<template>
  <VcBlade title="User Profile">
    <VcLabel>Profile Picture</VcLabel>
    <VcImageUpload
      :image="avatar"
      accept=".jpg,.png,.webp"
      :rules="{ fileWeight: 200 }"
      name="Avatar"
      icon="lucide-user"
      :placeholder="{ text: 'Drop your photo here or', link: 'browse' }"
      @upload="handleUpload"
      @remove="handleRemove"
    />
    <VcHint>Recommended size: 200x200px, max 200KB</VcHint>
  </VcBlade>
</template>
```

## Recipe: Conditional Upload with Loading State

```vue
<script setup lang="ts">
const isUploading = ref(false);

async function handleUpload(files: FileList) {
  isUploading.value = true;
  try {
    product.value.thumbnail = await api.uploadImage(files[0]);
  } finally {
    isUploading.value = false;
  }
}
</script>

<template>
  <VcImageUpload
    :image="product.thumbnail"
    :loading="isUploading"
    :disabled="!canEdit"
    :removable="canEdit"
    @upload="handleUpload"
    @remove="handleRemove"
  />
</template>
```

## Common Mistakes

- **Forgetting to handle the `upload` event** -- VcImageUpload does not upload files itself. You must handle the `upload` event, send the file to your API, and update the `image` prop with the result.
- **Using watch URL instead of asset object** -- The `image` prop expects an `ICommonAsset` object (with `url`, `name`, etc.), not a plain URL string.
- **Not setting validation rules** -- Without `rules`, any file size or format is accepted. Always set `{ fileWeight: <maxKB> }` to prevent oversized uploads.

## Tips

- The `accept` prop is passed directly to the underlying `<input type="file">` element. Use comma-separated extensions (`.jpg,.png`) or MIME types (`image/jpeg,image/png`).
- Set `previewable` to `false` if the image tile should not open a lightbox on click (e.g., when the image is an icon or logo that does not benefit from full-screen preview).
- The upload zone supports both click-to-browse and drag-and-drop. The drag feedback is automatic (the zone highlights on dragover).
- When `loading` is true, a spinner replaces the upload zone icon. Use this while your API call is in progress.

## Related Components

- **VcGallery** -- multi-image gallery with drag-and-drop reorder
- **VcImageTile** -- the internal tile component that renders the image preview and action buttons
- **VcLabel** / **VcHint** -- use alongside VcImageUpload for field labeling and helper text
