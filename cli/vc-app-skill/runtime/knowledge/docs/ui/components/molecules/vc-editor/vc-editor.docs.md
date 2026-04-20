# VcEditor

A rich text editor built on TipTap that supports both Markdown and HTML content. Includes a customizable toolbar, multiple view modes (WYSIWYG, preview, source, split), fullscreen editing, image upload, character limits, and plugin-style custom toolbar buttons.

## When to Use

- Rich text content editing: product descriptions, blog posts, documentation
- Markdown or HTML authoring with live formatting and preview
- Content that requires image uploads alongside text
- Situations where authors need source-level control over markup

When NOT to use:

- Plain text input -- use [VcTextarea](../vc-textarea/)
- Short single-line values -- use [VcInput](../vc-input/)
- Code editing with syntax highlighting -- use a dedicated code editor

## Quick Start

```vue
<template>
  <VcEditor
    v-model="content"
    label="Description"
    placeholder="Start typing..."
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor } from "@vc-shell/framework";

const content = ref("");
</script>
```

## Features

### Editor Modes

The editor header provides four view modes plus a fullscreen toggle:

| Mode                 | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **Editor** (default) | WYSIWYG rich text editing with toolbar                     |
| **Preview**          | Read-only rendered HTML preview (sanitized via DOMPurify)  |
| **Source**           | Raw Markdown/HTML textarea for direct markup editing       |
| **Split**            | Side-by-side editor + source view for simultaneous editing |
| **Fullscreen**       | Any mode expanded to fill the entire viewport              |

The editor automatically detects whether content is Markdown or HTML based on pattern analysis and outputs in the same format. HTML content is auto-formatted with Prettier in source/split views.

### Custom Toolbar Configuration

Limit which toolbar buttons appear by passing a `toolbar` array. Only the specified buttons will render. Available toolbar names:

`"bold"`, `"italic"`, `"underline"`, `"strikethrough"`, `"heading1"`, `"heading2"`, `"heading3"`, `"bulletList"`, `"orderedList"`, `"blockquote"`, `"link"`, `"image"`, `"table"`, `"fontSize"`, `"separator"`

```vue
<VcEditor v-model="content" label="Simple editor" :toolbar="['bold', 'italic', 'separator', 'heading1', 'heading2', 'link']" />
```

When no `toolbar` prop is provided, all buttons are shown by default.

### Character Limit

The `maxlength` prop enforces a character limit. A counter is displayed in source and split modes, and the counter turns to a warning style when 90% of the limit is reached. Input beyond the limit is blocked.

```vue
<VcEditor v-model="content" label="Short description" :maxlength="500" placeholder="Maximum 500 characters..." />
```

### Image Upload

When `assetsFolder` is provided, the image toolbar button becomes functional. Clicking it opens a file picker for images. Selected files are uploaded via `POST /api/assets?folderUrl=/<assetsFolder>` and inserted at the cursor position.

```vue
<VcEditor v-model="content" label="Article body" assets-folder="articles/images" />
```

Multiple images can be selected at once. The upload accepts any image file type (`image/*`).

### Custom Toolbar Buttons (Plugin System)

Extend the toolbar with custom buttons or dropdowns. Each custom button specifies an `id`, `label`, `icon`, `action` callback, and optional `group`/`order` for positioning.

#### Button Plugin

```vue
<VcEditor
  v-model="content"
  :custom-buttons="[
    {
      id: 'clear-format',
      label: 'Clear Format',
      icon: 'lucide-remove-formatting',
      action: (editor) => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      isActive: () => false,
      group: 'format',
      order: 1,
    },
  ]"
/>
```

#### Dropdown Plugin

Dropdown plugins use `options` array instead of `action`, plus a `getValue` function to read the current state:

```ts
{
  id: 'text-align',
  label: 'Text Align',
  options: [
    { value: 'left', label: 'Left', action: (editor) => editor.chain().focus().setTextAlign('left').run() },
    { value: 'center', label: 'Center', action: (editor) => editor.chain().focus().setTextAlign('center').run() },
  ],
  getValue: (editor) => editor.getAttributes('paragraph').textAlign || 'left',
  group: 'align',
  order: 1,
}
```

#### Component Plugin

For fully custom toolbar UI, provide a `component` property. The component receives `editor` and `disabled` props.

### Additional TipTap Extensions

Pass extra TipTap extensions via the `extensions` prop to augment the built-in set (StarterKit, Underline, TextStyle, FontSize, Table, Link, Image, Placeholder, Markdown).

```vue
<VcEditor v-model="content" :extensions="[Highlight.configure({ multicolor: true })]" />
```

### Validation with vee-validate Field

Integrate with vee-validate's `Field` component for form-level validation.

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.description"
    name="description"
    rules="required"
  >
    <VcEditor
      v-model="form.description"
      label="Description"
      required
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field } from "vee-validate";
import { VcEditor } from "@vc-shell/framework";

const form = reactive({ description: "" });
</script>
```

> **Note:** VcEditor uses `errorMessage` directly (no separate `error` boolean prop needed). The error state is derived from the truthiness of `errorMessage`.

## Recipes

### Multilanguage Product Description

```vue
<VcEditor v-model="descriptions[currentLang]" label="Product description" multilanguage :current-language="currentLang" assets-folder="products/images" :maxlength="5000" required />
```

### Minimal Comment Editor

```vue
<VcEditor v-model="comment" placeholder="Write a comment..." :toolbar="['bold', 'italic', 'link']" :maxlength="1000" />
```

## Common Mistakes

### 1. Missing assetsFolder for image uploads

```vue
<!-- WRONG: image button appears in toolbar but upload silently fails -->
<VcEditor v-model="content" label="Article" />

<!-- CORRECT: provide the asset folder for the upload endpoint -->
<VcEditor v-model="content" label="Article" assets-folder="articles/images" />
```

### 2. Using error prop instead of errorMessage

```vue
<!-- WRONG: VcEditor does not have a separate `error` boolean prop -->
<VcEditor v-model="content" :error="true" error-message="Required" />

<!-- CORRECT: errorMessage alone controls the error state -->
<VcEditor v-model="content" error-message="Required" />
```

### 3. Expecting HTML output from Markdown content

```ts
// The editor auto-detects content format. If you pass Markdown, output is Markdown.
// If you need HTML, pass HTML content initially or convert after the fact.

// WRONG assumption: editor always outputs HTML
const content = ref("# Title");
// content.value after editing will be Markdown, not "<h1>Title</h1>"

// CORRECT: if you need HTML output, start with HTML
const content = ref("<h1>Title</h1>");
```

## Props

| Prop              | Type                  | Default     | Description                                                   |
| ----------------- | --------------------- | ----------- | ------------------------------------------------------------- |
| `modelValue`      | `string`              | `""`        | Content string via `v-model` (Markdown or HTML)               |
| `label`           | `string`              | --          | Label text above the editor                                   |
| `placeholder`     | `string`              | --          | Placeholder when editor is empty                              |
| `disabled`        | `boolean`             | `false`     | Disables all editing                                          |
| `required`        | `boolean`             | `false`     | Shows a required asterisk on the label                        |
| `tooltip`         | `string`              | --          | Tooltip text shown on label hover                             |
| `errorMessage`    | `string`              | --          | Error message below the editor (also activates error styling) |
| `name`            | `string`              | --          | Form field name attribute                                     |
| `toolbar`         | `ToolbarNames[]`      | all buttons | Array of toolbar button names to show                         |
| `maxlength`       | `number`              | --          | Character limit (counter shown in source/split mode)          |
| `assetsFolder`    | `string`              | --          | API folder path for image uploads                             |
| `extensions`      | `Extension[]`         | --          | Additional TipTap extensions                                  |
| `customButtons`   | `CustomToolbarItem[]` | --          | Plugin toolbar buttons or dropdowns                           |
| `multilanguage`   | `boolean`             | `false`     | Enables multilanguage indicator on the label                  |
| `currentLanguage` | `string`              | --          | Current language code for multilanguage mode                  |

## Events

| Event               | Payload               | Description                                                   |
| ------------------- | --------------------- | ------------------------------------------------------------- |
| `update:modelValue` | `string \| undefined` | Emitted when content changes (from WYSIWYG or source editing) |
| `upload-image`      | --                    | Emitted when image upload is triggered                        |

## Slots

| Slot    | Description                                           |
| ------- | ----------------------------------------------------- |
| `error` | Custom error message markup (replaces default VcHint) |

## CSS Variables

| Variable                          | Default                                                   | Description                                          |
| --------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `--vc-editor-border`              | `var(--neutrals-300)`                                     | Default border color                                 |
| `--vc-editor-background`          | `transparent`                                             | Editor background                                    |
| `--vc-editor-surface`             | `var(--additional-50)`                                    | Content area surface color                           |
| `--vc-editor-text-primary`        | `var(--neutrals-900)`                                     | Primary text color                                   |
| `--vc-editor-text-secondary`      | `var(--neutrals-500)`                                     | Secondary text color (char counter)                  |
| `--vc-editor-text-muted`          | `var(--neutrals-400)`                                     | Muted text color (placeholder)                       |
| `--vc-editor-text-disabled`       | `var(--neutrals-500)`                                     | Text color when disabled                             |
| `--vc-editor-background-disabled` | `var(--neutrals-200)`                                     | Background when disabled                             |
| `--vc-editor-focus-border`        | `var(--primary-500)`                                      | Border color on focus                                |
| `--vc-editor-focus-ring-color`    | `color-mix(in srgb, var(--primary-500) 30%, transparent)` | Focus ring color                                     |
| `--vc-editor-error-border`        | `var(--danger-500)`                                       | Border color on error                                |
| `--vc-editor-error-ring-color`    | `rgba(239, 68, 68, 0.2)`                                  | Error ring color                                     |
| `--vc-editor-error-text`          | `var(--danger-500)`                                       | Error message text color                             |
| `--vc-editor-separator`           | `var(--neutrals-200)`                                     | Divider lines (blockquote border, table borders, hr) |
| `--vc-editor-table-header`        | `var(--neutrals-100)`                                     | Table header cell background                         |

## Accessibility

- The root element has `aria-label` set from the `label` prop
- `aria-invalid` is set when `errorMessage` is truthy
- `aria-disabled` is set when the editor is disabled
- Toolbar buttons have descriptive `aria-label` attributes (e.g., "Preview", "Source code", "Fullscreen")
- Fullscreen toggle and view mode buttons are keyboard accessible
- The editor content area is a standard TipTap `contenteditable` region with full keyboard support; preview content is sanitized via DOMPurify

## Related Components

- [VcTextarea](../vc-textarea/) -- plain multi-line text input (no formatting)
- [VcInput](../vc-input/) -- single-line text input

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint. No additional props or configuration needed.
