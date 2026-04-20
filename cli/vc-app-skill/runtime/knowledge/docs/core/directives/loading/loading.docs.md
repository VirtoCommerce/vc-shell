# v-loading Directive

Displays a loading overlay with a spinner on any element. Supports size variants, custom color, blur backdrop, fullscreen mode, and z-index control.

## Overview

Many blade and widget views need to indicate that data is being fetched or an operation is in progress. The `v-loading` directive provides a declarative way to show a spinner overlay on any DOM element without adding conditional rendering logic to your template.

When the bound value is truthy, the directive adds CSS classes and custom properties that activate a spinner overlay rendered via CSS pseudo-elements. When the value becomes falsy, all loading state is cleanly removed. The visual styles are defined in `./styles.css` and imported automatically when the directive is used.

The directive is registered globally by the framework, so no manual import is needed in templates.

Unlike a standalone loading component, `v-loading` scopes the overlay to the element it is applied to, making it easy to show loading states on individual sections, cards, or panels without affecting the rest of the page.

## API

| Binding                 | Type             | Description                          |
| ----------------------- | ---------------- | ------------------------------------ |
| `v-loading="true"`      | `boolean`        | Show/hide the loading overlay        |
| `v-loading="options"`   | `LoadingOptions` | Show with configuration (see below)  |
| `v-loading:1000="true"` | `arg: string`    | Set custom z-index (default: `9999`) |

### LoadingOptions

| Property     | Type                             | Default | Description                                             |
| ------------ | -------------------------------- | ------- | ------------------------------------------------------- |
| `size`       | `"small" \| "medium" \| "large"` | --      | Spinner size via `data-loading-size` attribute          |
| `color`      | `string`                         | --      | Custom spinner color (sets `--v-loading-spinner-color`) |
| `blur`       | `boolean`                        | `true`  | Enable backdrop blur; `false` adds `v-loading--no-blur` |
| `fullscreen` | `boolean`                        | `false` | Fullscreen overlay via `v-loading--fullscreen`          |

## How It Works

The directive manipulates CSS classes and custom properties on the target element:

1. **Truthy value**: adds `v-loading` class, sets `--v-loading-z-index`, and optionally sets size/color/blur/fullscreen attributes.
2. **Falsy value**: removes all `v-loading` classes, attributes, and custom properties.
3. The CSS in `styles.css` uses `::before` and `::after` pseudo-elements on `.v-loading` to render the backdrop and spinner animation.

Because the directive modifies the element directly (not through Vue reactivity), it works on both mount and update hooks. Toggling the bound value at any time updates the overlay immediately.

## Usage Examples

### Simple boolean toggle

```vue
<template>
  <div
    v-loading="isLoading"
    class="tw-min-h-[200px]"
  >
    <p>Order details will appear here</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isLoading = ref(true);

async function loadOrder() {
  isLoading.value = true;
  try {
    // ... fetch data
  } finally {
    isLoading.value = false;
  }
}
</script>
```

### With size and color options

```vue
<template>
  <!-- Small spinner with brand color, no blur -->
  <div v-loading="{ size: 'small', color: 'var(--primary-500)', blur: false }">
    <img
      :src="thumbnailUrl"
      alt="Product thumbnail"
    />
  </div>
</template>
```

### Fullscreen loading overlay

```vue
<template>
  <!-- Covers the entire viewport during initial app load -->
  <div v-loading="{ fullscreen: true, size: 'large' }">
    <RouterView />
  </div>
</template>
```

### Custom z-index via directive argument

```vue
<template>
  <!-- Use a lower z-index so popups can render above the spinner -->
  <div v-loading:500="isLoading">Content</div>

  <!-- Default z-index is 9999 -->
  <div v-loading="isLoading">Content</div>
</template>
```

### Blade content area

```vue
<template>
  <VcBlade
    title="Products"
    :closable="true"
  >
    <div
      v-loading="loading"
      class="tw-p-4"
    >
      <VcDataTable
        :items="products"
        :columns="columns"
      />
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { useAsync } from "@vc-shell/framework";

const { loading, action: loadProducts } = useAsync(async () => {
  // fetch products...
});
</script>
```

## Tip: Ensure the element has dimensions

The loading overlay is positioned absolutely within the target element. If the element has no height (e.g., an empty `<div>`), the spinner will not be visible. Always ensure the loading container has a minimum height:

```vue
<!-- Good: min-height ensures the spinner is visible even when content is empty -->
<div v-loading="isLoading" class="tw-min-h-[200px]">...</div>

<!-- Bad: empty div collapses to 0px height, spinner invisible -->
<div v-loading="isLoading"></div>
```

## Common Mistake

Passing an options object when you want to hide the spinner does not work as expected because an object is always truthy:

```vue
<!-- Bug: this always shows the spinner because {} is truthy -->
<div v-loading="isLoading ? { size: 'small' } : {}">...</div>

<!-- Fix: use false when not loading -->
<div v-loading="isLoading ? { size: 'small' } : false">...</div>
```

## CSS Classes Reference

| Class                   | Applied When       | Effect                             |
| ----------------------- | ------------------ | ---------------------------------- |
| `v-loading`             | Value is truthy    | Shows the spinner overlay          |
| `v-loading--no-blur`    | `blur: false`      | Disables backdrop blur filter      |
| `v-loading--fullscreen` | `fullscreen: true` | Overlay covers the entire viewport |

## Related

- `framework/core/directives/autofocus/` -- `v-autofocus` directive
- `framework/core/composables/useLoading/` -- composable for managing loading state reactively
