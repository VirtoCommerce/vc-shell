# VcFileUpload

Drag-and-drop file upload zone with file type filtering, validation, loading state, and error display.

## When to Use

- Uploading images, documents, or other files in forms
- When drag-and-drop UX is preferred alongside a browse button
- When NOT to use: for image gallery management with preview/reorder, use `VcGallery`

## Basic Usage

```vue
<template>
  <VcFileUpload
    accept=".jpg, .png, .pdf"
    :multiple="true"
    @upload="handleUpload"
  />
</template>

<script setup lang="ts">
import { VcFileUpload } from "@vc-shell/framework";

function handleUpload(files: FileList) {
  for (const file of files) {
    console.log("Uploading:", file.name, file.size);
  }
}
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `".jpg, .png, .jpeg, .webp, .heic, .svg"` | Accepted file types |
| `multiple` | `boolean` | `false` | Allow selecting multiple files |
| `loading` | `boolean` | `false` | Show loading spinner overlay |
| `icon` | `string` | `"lucide-cloud-upload"` | Icon displayed in the upload zone |
| `customText` | `{ dragHere: string; browse: string }` | — | Override default drag/browse text |
| `rules` | `IValidationRules` | — | Vee-validate validation rules |
| `name` | `string` | `"Gallery"` | Form field name |
| `label` | `string` | — | Field label |
| `tooltip` | `string` | — | Tooltip on label |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `required` | `boolean` | `false` | Mark field as required |
| `error` | `boolean` | `false` | External error flag |
| `errorMessage` | `string` | — | Error message (sets error state when truthy) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `upload` | `FileList` | Emitted when valid files are selected or dropped |

## Slots

| Slot | Description |
|------|-------------|
| `error` | Custom error content (replaces default VcHint error) |

## Common Patterns

### Image Upload with Type Restriction

```vue
<VcFileUpload
  accept=".jpg, .png, .webp"
  :multiple="true"
  icon="lucide-image-plus"
  :custom-text="{ dragHere: 'Drop images here', browse: 'Select images' }"
  @upload="uploadImages"
/>
```

### Document Upload with Validation

```vue
<VcFileUpload
  accept=".pdf, .doc, .docx"
  name="documents"
  :rules="{ size: 5 }"
  @upload="uploadDocuments"
/>
```

### With External Error Message

```vue
<VcFileUpload
  accept=".csv"
  error-message="Maximum file size exceeded (5 MB)"
  @upload="uploadCsv"
/>
```

### In a Form Context

```vue
<VcForm @submit="saveProduct">
  <VcInput v-model="product.name" label="Product Name" required />
  <VcFileUpload
    accept=".jpg, .png"
    :multiple="true"
    name="product-images"
    label="Product Images"
    required
    @upload="onImagesSelected"
  />
  <VcButton type="submit">Save</VcButton>
</VcForm>
```

### Custom Error Slot

```vue
<VcFileUpload @upload="handleUpload">
  <template #error>
    <div class="tw-text-red-500 tw-mt-2 tw-text-sm">
      Custom error: Only PNG files under 2MB are accepted.
    </div>
  </template>
</VcFileUpload>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--file-upload-border-color` | `var(--neutrals-200)` | Border color |
| `--file-upload-border-color-hover` | `var(--neutrals-400)` | Hover border color |
| `--file-upload-border-color-dragover` | `var(--primary-500)` | Drag-over border color |
| `--file-upload-border-color-error` | `var(--danger-500)` | Error border color |
| `--file-upload-border-radius` | `6px` | Corner radius |
| `--file-upload-drag-bg` | `var(--neutrals-100)` | Drag-over background |
| `--file-upload-icon-color` | `var(--neutrals-400)` | Upload icon color |
| `--file-upload-text-color` | `var(--neutrals-400)` | Instruction text color |
| `--file-upload-error-color` | `var(--danger-500)` | Error text color |
| `--file-upload-focus-ring-color` | `var(--primary-100)` | Focus ring color |

## Accessibility

- The drop zone has `role="button"` with `tabindex="0"` for keyboard focus
- `aria-label` describes the upload action
- `aria-describedby` links to error messages and group context
- `aria-disabled` is set when the field is disabled
- `aria-required` is set when the field is required
- Enter and Space keys trigger the file browser
- Disabled state applies `pointer-events: none` and reduced opacity

## Related Components

- [VcGallery](../../organisms/vc-gallery/) — full image gallery with preview, reorder, and upload
- [VcImageTile](../vc-image-tile/) — image display tile used in galleries
