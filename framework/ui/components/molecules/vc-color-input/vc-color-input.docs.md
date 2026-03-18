# VcColorInput

A color input that combines a text field for hex values with a clickable color swatch that opens the native browser color picker. Accepts hex codes and CSS color names.

## Overview

Color selection is needed in various admin scenarios: configuring brand colors, setting category badges, defining product attribute colors, or customizing theme variables. The native HTML `<input type="color">` provides a color picker but lacks text entry, validation, and consistent styling.

`VcColorInput` combines the best of both approaches: a text field where users can type hex codes or CSS color names directly, and a color swatch button that opens the native browser color picker for visual selection. Changes from either input method synchronize in real time.

The component follows the same prop interface as other vc-shell form fields (`ITextFieldProps`), so it integrates seamlessly with form layouts, validation, and error display.

> **Note:** `VcInput` with `type="color"` automatically delegates to this component. You can also use `VcColorInput` directly.

## When to Use

- Selecting a color value (brand colors, theme settings, product attributes)
- When both manual hex entry and visual picking are desired
- When NOT to use: general text input (use [VcInput](../vc-input/))

## Basic Usage

```vue
<template>
  <VcColorInput v-model="color" label="Brand color" placeholder="Enter hex color..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcColorInput } from "@vc-shell/framework";

const color = ref<string | null>(null);
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| null` | `undefined` | Color value via `v-model` (hex string or CSS color name) |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | -- | Placeholder text |
| `clearable` | `boolean` | `false` | Shows a clear button when a value is present |
| `size` | `"default" \| "small"` | `"default"` | Field height variant |
| `error` / `errorMessage` | `boolean` / `string` | -- | Error styling and validation message |
| `disabled` | `boolean` | `false` | Disables the input and color picker |

## Common Patterns

### With Validation

```vue
<template>
  <VcColorInput
    v-model="color"
    label="Background color"
    required
    :error="!color"
    error-message="Please select a color"
    clearable
  />
</template>
```

### Pre-filled Value

```vue
<template>
  <VcColorInput v-model="color" label="Accent color" />
  <!-- Accepts "#3b82f6", "#fff", "red", "cornflowerblue", etc. -->
</template>

<script setup lang="ts">
import { ref } from "vue";
const color = ref("#3b82f6");
</script>
```

### In a Form with Other Fields

```vue
<template>
  <div class="tw-flex tw-flex-col tw-gap-4">
    <VcInput v-model="category.name" label="Category Name" rules="required" />
    <VcColorInput v-model="category.badgeColor" label="Badge Color" clearable />
    <VcInput v-model="category.description" label="Description" />
  </div>
</template>
```

### Via VcInput Type Delegation

You can use `VcInput` with `type="color"` instead of importing `VcColorInput` directly:

```vue
<template>
  <!-- These are equivalent -->
  <VcInput type="color" v-model="color" label="Theme Color" />
  <VcColorInput v-model="color" label="Theme Color" />
</template>
```

### Multiple Color Pickers in a Theme Editor

```vue
<template>
  <h3>Theme Colors</h3>
  <div class="tw-grid tw-grid-cols-2 tw-gap-4">
    <VcColorInput v-model="theme.primary" label="Primary" />
    <VcColorInput v-model="theme.secondary" label="Secondary" />
    <VcColorInput v-model="theme.accent" label="Accent" />
    <VcColorInput v-model="theme.background" label="Background" />
    <VcColorInput v-model="theme.text" label="Text" />
    <VcColorInput v-model="theme.error" label="Error" />
  </div>
</template>
```

## How It Works

1. Type a hex value (e.g., `#ff5733`) or a CSS color name (e.g., `red`) in the text field
2. The color swatch updates in real-time to reflect the entered color
3. Click the color swatch to open the native browser color picker
4. Selecting from the picker updates both the swatch and the text field

## Accessibility

- Label linked via `aria-labelledby`
- Hint/error linked via `aria-describedby`
- `aria-invalid` set in error state
- Color swatch button has descriptive `aria-label` (e.g., "Pick color: #ff5733")
- Clear button has `aria-label="Clear color"`
- Focus ring on both the text input and the color swatch button

## CSS Variables

Uses the same `--input-*` variables as VcInput, plus:

- `--color-input-swatch-size` -- swatch square size (default 20px)
- `--color-input-swatch-border-radius`, `--color-input-swatch-border-color`

## Tip: CSS Color Names

The component accepts any valid CSS color name in addition to hex codes. Common names like `red`, `blue`, `green`, `coral`, `steelblue`, and `cornflowerblue` all work. However, the native color picker always returns hex values, so the text field will switch to hex format after a picker selection.

## Common Mistake

The native color picker does not support alpha/transparency. If you need RGBA color selection, you will need a custom color picker component. `VcColorInput` works with opaque RGB hex values only (`#RRGGBB` or `#RGB` shorthand).

## Related Components

- [VcInput](../vc-input/) -- general-purpose input (delegates to VcColorInput for `type="color"`)
- [VcField](../vc-field/) -- read-only field display (for showing a color value without editing)
