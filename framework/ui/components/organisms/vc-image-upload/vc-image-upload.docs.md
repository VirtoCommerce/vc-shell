# VcImageUpload

A single-image upload organism that displays either a drag-and-drop upload zone or an image tile with preview and remove actions.

## When to use

- Use **VcImageUpload** for single-image fields (avatar, logo, thumbnail).
- For multi-image galleries with reorder support, use **VcGallery** instead.

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

## States

The component has three visual states:

1. **Upload zone** -- No image and not disabled. Shows a dropzone with icon and placeholder text.
2. **Image tile** -- An image is provided. Shows the image with optional preview/remove actions.
3. **Empty disabled** -- No image and disabled. Shows an empty hint message.

## Usage

```vue
<VcImageUpload
  :image="product.thumbnail"
  accept=".jpg,.png,.webp"
  :rules="{ fileWeight: 500 }"
  @upload="handleUpload"
  @remove="handleRemove"
/>
```
