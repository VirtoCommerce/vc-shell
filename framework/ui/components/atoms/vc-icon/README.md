# VcIcon Component

The `VcIcon` component is a versatile icon component that supports multiple icon libraries:

- Font Awesome
- Material Symbols
- Bootstrap Icons
- Lucide Icons
- Custom SVG Components

## Installation

Before using specific icon types, make sure to install the corresponding libraries:

### Font Awesome

```bash
npm install @fortawesome/fontawesome-free
```

Add to your main.js/ts:
```js
import '@fortawesome/fontawesome-free/css/all.css';
```

### Material Icons

```bash
npm install material-symbols
```

Add to your main.js/ts:
```js
import 'material-symbols';
```

### Bootstrap Icons

```bash
npm install bootstrap-icons
```

Add to your main.js/ts:
```js
import 'bootstrap-icons/font/bootstrap-icons.css';
```

### Lucide Icons

```bash
npm install lucide-vue-next
```

Register the icons you need:
```js
// For local component usage
import { HomeIcon, UserIcon } from 'lucide-vue-next';

// For global registration
import { createApp } from 'vue';
import { LucideVue } from 'lucide-vue-next';
import App from './App.vue';

const app = createApp(App);
app.use(LucideVue, { 
  componentPrefix: '' // optional - default is 'Lucide'
});
```

## Basic Usage

### New Unified Syntax (Recommended)

Use a consistent naming approach with library prefix for all icon types:

```vue
<template>
  <!-- Font Awesome Icon (unchanged, already has prefix) -->
  <VcIcon icon="fas fa-home" />
  
  <!-- Material Icon with prefix -->
  <VcIcon icon="material-home" />
  
  <!-- Bootstrap Icon (unchanged, already has prefix) -->
  <VcIcon icon="bi-house" />
  
  <!-- Lucide Icon with prefix -->
  <VcIcon icon="lucide-home" />
  
  <!-- Direct component usage (for tree-shaking) -->
  <VcIcon :icon="HomeIcon" />
</template>

<script setup lang="ts">
import { HomeIcon } from 'lucide-vue-next';
import VcIcon from 'path/to/vc-icon.vue';
</script>
```

### Legacy Syntax (Still Supported)

```vue
<template>
  <!-- Font Awesome Icon -->
  <VcIcon icon="fas fa-home" />
  
  <!-- Material Icon (no prefix needed) -->
  <VcIcon icon="home" />
  
  <!-- Bootstrap Icon -->
  <VcIcon icon="bi-house" />
  
  <!-- Lucide Icon with explicit type parameter -->
  <VcIcon icon="HomeIcon" type="lucide" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string \| Component` | `"fas fa-square-full"` | The icon to display. Can be a string identifier or a component instance |
| `size` | `"xs" \| "s" \| "m" \| "l" \| "xl" \| "xxl" \| "xxxl"` | `"m"` | Size of the icon |
| `variant` | `"warning" \| "danger" \| "success"` | `undefined` | Color variant |
| `type` | `"fontawesome" \| "material" \| "bootstrap" \| "lucide" \| "custom" \| "auto"` | `"auto"` | Icon library type. Use `auto` for automatic detection (legacy) |
| `materialIconType` | `"outlined" \| "rounded" \| "sharp"` | `"outlined"` | Type of Material icon |
| `materialIconFill` | `number` | `0` | Fill property for Material icons |
| `materialIconWeight` | `number` | `400` | Weight property for Material icons |
| `materialIconGrade` | `number` | `0` | Grade property for Material icons |
| `strokeWidth` | `number` | `2` | Stroke width for Lucide icons |

## Auto Detection

The component automatically detects the icon type based on the icon name:

- **Prefixed approach (recommended):**
  - `material-name` → Material icon 
  - `lucide-name` → Lucide icon
  - `bi-name` → Bootstrap icon
  - `fa-name` or `fas fa-name` → Font Awesome icon

- **Legacy approach (still supported):**
  - Strings containing `fa-` are treated as Font Awesome icons
  - Strings starting with `bi-` are treated as Bootstrap icons
  - Strings ending with `Icon` are treated as Lucide icons
  - Other strings without these patterns are treated as Material icons
  - Component instances are treated as custom SVG components

## Size Mapping

The component maps the size prop to pixel values:

- `xs`: 12px
- `s`: 14px
- `m`: 18px
- `l`: 20px
- `xl`: 22px
- `xxl`: 30px
- `xxxl`: 64px

> **Note about icon sizing:** 
> 
> Different icon libraries have naturally different sizing characteristics:
> - **Font Awesome** icons are used as the base sizes (reference standard)
> - **Bootstrap Icons** require a slight reduction (factor 0.95)
> - **Material Icons** require a slight increase (factor 1.1)
> - **Lucide Icons** (SVG) require a significant increase (factor 1.2)
>
> The `VcIcon` component automatically applies the necessary adjustments for visual consistency across all icon types. Thanks to this, developers can specify the same size (`size="m"`) for all icons and achieve a visually consistent result.

## Examples

### Font Awesome

```vue
<VcIcon icon="fas fa-home" />
<VcIcon icon="far fa-user" />
<VcIcon icon="fas fa-cog" size="xl" />
<VcIcon icon="fas fa-exclamation-triangle" variant="warning" />
```

### Material Icons

```vue
<!-- Legacy syntax -->
<VcIcon icon="home" />
<VcIcon icon="settings" materialIconType="rounded" />

<!-- New syntax with prefix -->
<VcIcon icon="material-home" />
<VcIcon icon="material-settings" materialIconType="rounded" />
<VcIcon icon="material-warning" variant="warning" size="xl" />
```

### Bootstrap Icons

```vue
<VcIcon icon="bi-house" />
<VcIcon icon="bi-person" />
<VcIcon icon="bi-gear" size="xl" />
<VcIcon icon="bi-exclamation-triangle" variant="warning" />
```

### Lucide Icons

```vue
<template>
  <!-- Legacy syntax with type parameter -->
  <VcIcon icon="HomeIcon" type="lucide" />
  
  <!-- New syntax with prefix -->
  <VcIcon icon="lucide-home" />
  <VcIcon icon="lucide-settings" size="xl" />
  <VcIcon icon="lucide-alert-triangle" variant="warning" />
  
  <!-- Direct component usage (preferred for tree-shaking) -->
  <VcIcon :icon="HomeIcon" />
</template>

<script setup>
import { HomeIcon, SettingsIcon, AlertTriangle } from 'lucide-vue-next';
</script>
```

## Migration Guide

### From Custom SVG Components to Material Icons

```vue
<!-- Before -->
<VcIcon icon="SearchIcon" />
<VcIcon icon="HomeIcon" />

<!-- After (legacy) -->
<VcIcon icon="search" />
<VcIcon icon="home" />

<!-- After (new syntax) -->
<VcIcon icon="material-search" />
<VcIcon icon="material-home" />
```

### From Font Awesome to Bootstrap Icons

```vue
<!-- Before -->
<VcIcon icon="fas fa-home" />
<VcIcon icon="fas fa-user" />
<VcIcon icon="fas fa-cog" />

<!-- After -->
<VcIcon icon="bi-house" />
<VcIcon icon="bi-person" />
<VcIcon icon="bi-gear" />
```

### From Material Icons to Lucide Icons

```vue
<!-- Before -->
<VcIcon icon="home" />
<VcIcon icon="settings" />

<!-- After (legacy) -->
<VcIcon icon="HomeIcon" type="lucide" />
<VcIcon icon="SettingsIcon" type="lucide" />

<!-- After (new syntax) -->
<VcIcon icon="lucide-home" />
<VcIcon icon="lucide-settings" />

<!-- Or with direct components (preferred for tree-shaking) -->
<template>
  <VcIcon :icon="HomeIcon" />
  <VcIcon :icon="SettingsIcon" />
</template>

<script setup>
import { HomeIcon, SettingsIcon } from 'lucide-vue-next';
</script>
```

## Icon Picker Tool

To help developers choose the right icon name from each library, we recommend using these resources:

- **Font Awesome**: [https://fontawesome.com/icons](https://fontawesome.com/icons)
- **Material Symbols**: [https://fonts.google.com/icons](https://fonts.google.com/icons)
- **Bootstrap Icons**: [https://icons.getbootstrap.com/](https://icons.getbootstrap.com/)
- **Lucide Icons**: [https://lucide.dev/icons/](https://lucide.dev/icons/)

## Material Icon Documentation
For a complete list of available Material icons, visit:
- [Material Symbols Documentation](https://fonts.google.com/icons)
- [Material Symbols Demo](https://marella.github.io/material-symbols/demo/) 
