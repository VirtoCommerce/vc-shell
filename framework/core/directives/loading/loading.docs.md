# v-loading Directive

Displays a loading overlay with a spinner on any element. Supports size variants, custom color, blur backdrop, fullscreen mode, and z-index control.

## Overview

When the bound value is truthy, the directive adds CSS classes and custom properties that activate a spinner overlay. When falsy, all loading state is removed. Styles are imported from `./styles.css`.

## API

| Binding | Type | Description |
|---------|------|-------------|
| `v-loading="true"` | `boolean` | Show/hide the loading overlay |
| `v-loading="options"` | `LoadingOptions` | Show with configuration (see below) |
| `v-loading:1000="true"` | `arg: string` | Set custom z-index (default: `9999`) |

### LoadingOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | `"small" \| "medium" \| "large"` | -- | Spinner size via `data-loading-size` attribute |
| `color` | `string` | -- | Custom spinner color (sets `--v-loading-spinner-color`) |
| `blur` | `boolean` | `true` | Enable backdrop blur; `false` adds `v-loading--no-blur` |
| `fullscreen` | `boolean` | `false` | Fullscreen overlay via `v-loading--fullscreen` |

## Usage Examples

```vue
<template>
  <!-- Simple boolean toggle -->
  <div v-loading="isLoading">Content</div>

  <!-- With options -->
  <div v-loading="{ size: 'small', blur: false }">Content</div>

  <!-- Custom z-index via arg -->
  <div v-loading:500="isLoading">Content</div>
</template>
```

## Related

- `framework/core/directives/autofocus/` -- `v-autofocus` directive
