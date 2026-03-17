# VcEditor

A rich text editor built on TipTap that supports both Markdown and HTML content. Includes a customizable toolbar, preview mode, source code view, side-by-side editing, fullscreen mode, and image upload.

## When to Use

- Rich text content editing: product descriptions, blog posts, documentation
- Markdown or HTML authoring with live formatting
- When NOT to use: plain text (use [VcTextarea](../vc-textarea/)), short single-line values (use [VcInput](../vc-input/))

## Basic Usage

```vue
<template>
  <VcEditor v-model="content" label="Description" placeholder="Start typing..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const content = ref("");
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `""` | Content string via `v-model` (Markdown or HTML) |
| `label` | `string` | -- | Label text above the editor |
| `placeholder` | `string` | -- | Placeholder when editor is empty |
| `disabled` | `boolean` | `false` | Disables editing |
| `errorMessage` | `string` | -- | Error message below the editor |
| `toolbar` | `ToolbarNames[]` | all buttons | Customize which toolbar buttons to show |
| `maxlength` | `number` | -- | Character limit (shown in source/split mode) |
| `assetsFolder` | `string` | -- | API folder path for image uploads |
| `extensions` | `Extension[]` | -- | Additional TipTap extensions |
| `customButtons` | `CustomToolbarItem[]` | -- | Plugin toolbar buttons or dropdowns |

### Available Toolbar Names

`"bold"`, `"italic"`, `"underline"`, `"strikethrough"`, `"heading1"`, `"heading2"`, `"heading3"`, `"bulletList"`, `"orderedList"`, `"blockquote"`, `"link"`, `"image"`, `"table"`, `"fontSize"`, `"separator"`

## Common Patterns

### With Custom Toolbar

```vue
<VcEditor
  v-model="content"
  label="Simple editor"
  :toolbar="['bold', 'italic', 'separator', 'heading1', 'heading2', 'link']"
/>
```

### With Character Limit

```vue
<VcEditor
  v-model="content"
  label="Short description"
  :maxlength="500"
  placeholder="Maximum 500 characters..."
/>
```

### With Image Upload

```vue
<VcEditor
  v-model="content"
  label="Article body"
  assets-folder="articles/images"
/>
```

Images are uploaded via `POST /api/assets?folderUrl=/articles/images` and inserted at the cursor position.

### With Custom Toolbar Buttons

```vue
<VcEditor
  v-model="content"
  :custom-buttons="[
    {
      id: 'clear-format',
      label: 'Clear Format',
      icon: 'lucide-remove-formatting',
      action: (editor) => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      group: 'format',
      order: 1,
    },
  ]"
/>
```

## Editor Modes

The editor header provides four view modes:

1. **Editor** (default) -- WYSIWYG rich text editing
2. **Preview** -- read-only rendered HTML preview
3. **Source** -- raw Markdown/HTML textarea editing
4. **Split** -- side-by-side editor + source view
5. **Fullscreen** -- any mode expanded to fill the viewport

## Slots

| Slot | Description |
|------|-------------|
| `error` | Custom error message markup |

## Accessibility

- `aria-label` set from the `label` prop
- `aria-invalid` and `aria-disabled` set when applicable
- Toolbar buttons have descriptive `aria-label` attributes
- Fullscreen toggle and view mode buttons are keyboard accessible

## CSS Variables

- `--vc-editor-border`, `--vc-editor-focus-border`, `--vc-editor-error-border`
- `--vc-editor-surface`, `--vc-editor-background`
- `--vc-editor-text-primary`, `--vc-editor-text-secondary`, `--vc-editor-text-muted`
- `--vc-editor-focus-ring-color`, `--vc-editor-error-ring-color`
- `--vc-editor-separator`, `--vc-editor-table-header`

## Related Components

- [VcTextarea](../vc-textarea/) -- plain multi-line text input
- [VcInput](../vc-input/) -- single-line text input
