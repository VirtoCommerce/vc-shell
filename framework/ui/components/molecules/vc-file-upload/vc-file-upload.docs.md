# VcFileUpload

Drag-and-drop file upload zone with file type filtering, validation, loading state, and error display. Provides both drag-and-drop and click-to-browse interactions in a single drop zone.

## When to Use

- Uploading images, documents, or other files within forms
- When drag-and-drop UX is preferred alongside a traditional browse button
- Collecting one or more files before processing or sending to a server

**Alternatives:**

- For image gallery management with preview, reorder, and delete capabilities, use [VcGallery](../../organisms/vc-gallery/)
- For a simple file input without the drag-and-drop zone, use a native `<input type="file">` wrapped in your own UI

## Quick Start

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

## File Type Filtering

Control which file types are accepted with the `accept` prop. This sets the native HTML `accept` attribute on the hidden file input, filtering the file browser dialog and providing a hint for drag-and-drop:

```vue
<!-- Images only (default) -->
<VcFileUpload accept=".jpg, .png, .jpeg, .webp, .heic, .svg" />

<!-- Documents only -->
<VcFileUpload accept=".pdf, .doc, .docx, .xls, .xlsx" />

<!-- CSV files for data import -->
<VcFileUpload accept=".csv" />

<!-- Any file type -->
<VcFileUpload accept="*" />
```

> **Note:** The `accept` prop filters the file browser dialog but does not prevent all invalid files from being dropped. For strict validation, combine `accept` with the `rules` prop.

## Multiple File Selection

Allow selecting several files at once:

```vue
<VcFileUpload accept=".jpg, .png" :multiple="true" @upload="handleUpload" />
```

When `multiple` is `false` (default), only one file can be selected per interaction.

## Validation with Rules

Integrate with vee-validate for file validation rules such as size limits:

```vue
<VcFileUpload
  accept=".pdf, .doc, .docx"
  name="documents"
  :rules="{ size: 5 }"
  @upload="uploadDocuments"
/>
```

When validation fails, the error is displayed below the drop zone using the built-in `VcHint` component. The `upload` event is only emitted when validation passes.

## Loading State

Show a loading overlay while files are being processed or uploaded:

```vue
<VcFileUpload :loading="isUploading" @upload="onUpload" />
```

Set `isUploading` to `true` before the upload and reset in a `finally` block. The loading overlay uses the `v-loading` directive and displays a spinner centered over the drop zone.

## Custom Text and Icon

Override the default drag-and-drop instructions and icon:

```vue
<VcFileUpload
  icon="lucide-image-plus"
  :custom-text="{
    dragHere: 'Drop product images here',
    browse: 'Select from computer',
  }"
  @upload="handleUpload"
/>
```

The default icon is `"lucide-cloud-upload"`. The default text is pulled from the `COMPONENTS.MOLECULES.VC_FILE_UPLOAD.DRAG_HERE` and `COMPONENTS.MOLECULES.VC_FILE_UPLOAD.BROWSE` locale keys.

## Error Display

Errors can come from three sources (by priority): the `errorMessage` prop, vee-validate `rules`, or the `error` slot for fully custom rendering.

```vue
<!-- External error message -->
<VcFileUpload accept=".csv" error-message="Maximum file size exceeded (5 MB)" />

<!-- Custom error slot -->
<VcFileUpload @upload="handleUpload">
  <template #error>
    <div class="tw-text-red-500 tw-mt-2 tw-text-sm">Only PNG files under 2 MB.</div>
  </template>
</VcFileUpload>
```

When any error is present, the drop zone border changes to the error color and a ring appears.

## Disabled State

Disable all interactions (drag, drop, click, keyboard):

```vue
<VcFileUpload disabled />
```

The disabled state reduces opacity and applies `pointer-events: none`.

## Recipe: Product Image Upload in a Form

```vue
<template>
  <VcForm @submit="saveProduct">
    <VcInput v-model="product.name" label="Product Name" required />
    <VcFileUpload
      accept=".jpg, .png, .webp"
      :multiple="true"
      name="product-images"
      label="Product Images"
      required
      :loading="isUploading"
      icon="lucide-image-plus"
      :custom-text="{ dragHere: 'Drop images here', browse: 'Select images' }"
      @upload="onImagesSelected"
    />
    <VcButton type="submit">Save Product</VcButton>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isUploading = ref(false);

async function onImagesSelected(files: FileList) {
  isUploading.value = true;
  try {
    for (const file of files) {
      await uploadFileToServer(file);
    }
  } finally {
    isUploading.value = false;
  }
}
</script>
```

## Recipe: CSV Data Import

```vue
<VcFileUpload
  accept=".csv"
  icon="lucide-file-spreadsheet"
  :custom-text="{ dragHere: 'Drop CSV file here', browse: 'Browse files' }"
  :error-message="importError"
  :loading="isImporting"
  @upload="importCsv"
/>
```

```ts
const isImporting = ref(false);
const importError = ref("");

async function importCsv(files: FileList) {
  importError.value = "";
  isImporting.value = true;
  try {
    await parseCsvAndImport(files[0]);
  } catch (e) {
    importError.value = `Import failed: ${e.message}`;
  } finally {
    isImporting.value = false;
  }
}
```

## Common Mistakes

**Not handling the FileList correctly -- treating it like an Array**

```
// Wrong -- FileList is not an array, Array methods do not work directly
function handleUpload(files: FileList) {
  files.map(f => f.name); // TypeError: files.map is not a function
}
```

```
// Correct -- convert to array first
function handleUpload(files: FileList) {
  Array.from(files).map(f => f.name);
}
```

**Expecting the upload event to fire when validation fails**

```
// Wrong -- the upload event only fires when validation passes
<VcFileUpload :rules="{ size: 1 }" @upload="processFile" />
// If a 5 MB file is dropped, processFile is never called
```

```
// Correct -- handle both success and error states
<VcFileUpload
  :rules="{ size: 1 }"
  error-message="Files must be under 1 MB"
  @upload="processFile"
/>
```

**Forgetting to reset the loading state on error**

```
// Wrong -- spinner stays forever if upload fails
async function onUpload(files: FileList) {
  isUploading.value = true;
  await uploadToServer(files); // Throws, loading never resets
}
```

```
// Correct -- use try/finally
async function onUpload(files: FileList) {
  isUploading.value = true;
  try {
    await uploadToServer(files);
  } finally {
    isUploading.value = false;
  }
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `".jpg, .png, .jpeg, .webp, .heic, .svg"` | Accepted file types (HTML accept attribute format) |
| `multiple` | `boolean` | `false` | Allow selecting multiple files |
| `loading` | `boolean` | `false` | Show loading spinner overlay |
| `icon` | `string` | `"lucide-cloud-upload"` | Icon displayed in the upload zone |
| `customText` | `{ dragHere: string; browse: string }` | -- | Override default drag/browse instruction text |
| `rules` | `IValidationRules` | -- | Vee-validate validation rules (e.g., `{ size: 5 }`) |
| `name` | `string` | `"Gallery"` | Form field name attribute |
| `label` | `string` | -- | Field label text |
| `tooltip` | `string` | -- | Tooltip on the label |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `required` | `boolean` | `false` | Mark field as required |
| `error` | `boolean` | `false` | External error flag |
| `errorMessage` | `string` | -- | Error message text (sets error state when truthy) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `upload` | `FileList` | Emitted when valid files are selected or dropped. Only fires after validation passes |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `error` | -- | Custom error content. Replaces the default `VcHint` error display |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--file-upload-border-color` | `var(--neutrals-200)` | Default border color |
| `--file-upload-border-color-hover` | `var(--neutrals-400)` | Hover border color |
| `--file-upload-border-color-dragover` | `var(--primary-500)` | Border color while dragging over |
| `--file-upload-border-color-error` | `var(--danger-500)` | Error state border color |
| `--file-upload-border-radius` | `6px` | Corner radius |
| `--file-upload-drag-bg` | `var(--neutrals-100)` | Background color during drag-over |
| `--file-upload-background-color` | `transparent` | Default background color |
| `--file-upload-icon-color` | `var(--neutrals-400)` | Upload icon color |
| `--file-upload-text-color` | `var(--neutrals-400)` | Instruction text color |
| `--file-upload-error-color` | `var(--danger-500)` | Error text color |
| `--file-upload-focus-ring-color` | `var(--primary-100)` | Focus ring color |
| `--file-upload-error-ring-color` | `var(--danger-100)` | Error state ring color |

## Accessibility

- The drop zone has `role="button"` with `tabindex="0"` for keyboard focus.
- `aria-label` describes the upload action (uses `customText.dragHere` or the default "Upload files").
- `aria-describedby` links to error messages and any parent form group context.
- `aria-disabled` is set when the field is disabled.
- `aria-required` is set when the field is required.
- Enter and Space keys trigger the file browser dialog.
- The disabled state applies `pointer-events: none` and reduced opacity.
## Related Components

- [VcGallery](../../organisms/vc-gallery/) -- Full image gallery with preview, reorder, drag-and-drop sorting, and upload
- [VcImageTile](../vc-image-tile/) -- Image display tile used inside galleries
- [VcHint](../../atoms/vc-hint/) -- Used internally for error message display

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint. No additional props or configuration needed.

