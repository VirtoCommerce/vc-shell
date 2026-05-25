---
title: VcContainer
category: components
group: layout
---

# VcContainer

A scrollable content wrapper that fills its parent, provides configurable padding, and optionally shows an inset shadow to indicate overflow. The standard building block for blade body content.

::storybook id="layout-vccontainer--default"

## When to Use

- Wrap blade body content that may exceed the visible area
- Create scrollable panels within fixed-height layouts
- Indicate scrollable content with a subtle shadow cue
- When NOT to use: for grouped/titled sections, use [VcCard](../vc-card/); for simple column stacking, use [VcCol](../vc-col/)

## Basic Usage

The most common form is a bare `<VcContainer>` wrapping the blade's body — it fills the parent, scrolls when content overflows, and applies a 16px default padding.

```vue
<VcContainer>
  <p>Scrollable content goes here...</p>
</VcContainer>
```

When the contained child already manages its own padding (a `VcDataTable`, for example), set `:no-padding="true"` so the wrapper does not stack extra space around it:

```vue
<VcContainer :no-padding="true">
  <VcDataTable :items="items">
    <VcColumn id="name" title="Name" />
  </VcDataTable>
</VcContainer>
```

The `shadow` prop adds an inset shadow as a scroll cue. Use it for content that genuinely overflows by a long way (long forms, free-text editors); the default no-shadow rendering is preferable everywhere else.

::storybook id="layout-vccontainer--with-shadow" height="300"

```vue
<VcContainer shadow>
  <p>Long-form content that benefits from a scroll cue...</p>
</VcContainer>
```

## Key Props

| Prop        | Type      | Default | Description                                                              |
| ----------- | --------- | ------- | ------------------------------------------------------------------------ |
| `shadow`    | `boolean` | `false` | Shows an inset shadow when content overflows                             |
| `noPadding` | `boolean` | `false` | Removes the default 16px inner padding                                   |
| `ariaLabel` | `string`  | —       | When provided, renders as `<section>` with this label instead of `<div>` |

## CSS Variables

| Variable                    | Default       | Description                          |
| --------------------------- | ------------- | ------------------------------------ |
| `--container-padding`       | `16px`        | Inner padding of the scrollable area |
| `--container-bg`            | `transparent` | Background color                     |
| `--container-border-radius` | `0`           | Border radius                        |
| `--container-gap`           | `0`           | Gap between child elements           |

## Exposed Methods

| Method        | Description                                      |
| ------------- | ------------------------------------------------ |
| `scrollTop()` | Programmatically scroll the container to the top |
| `component`   | Ref to the inner scrollable DOM element          |

## Events

| Event    | Payload | Description                   |
| -------- | ------- | ----------------------------- |
| `scroll` | `Event` | Emitted on every scroll event |

## Common Patterns

### Blade Body with Scroll Shadow

```vue
<template>
  <VcBlade title="Product Details">
    <VcContainer shadow>
      <!-- form fields, cards, etc. -->
    </VcContainer>
  </VcBlade>
</template>
```

### Edge-to-Edge Content (No Padding)

```vue
<VcContainer no-padding>
  <div class="tw-bg-neutrals-100 tw-p-4">
    Full-width section with custom background
  </div>
  <div class="tw-p-4">
    Content with its own padding
  </div>
</VcContainer>
```

### Programmatic Scroll to Top

```vue
<script setup lang="ts">
import { ref } from "vue";

const containerRef = ref();

function scrollToTop() {
  containerRef.value?.scrollTop();
}
</script>

<template>
  <VcContainer
    ref="containerRef"
    shadow
  >
    <!-- long content -->
  </VcContainer>
  <VcButton @click="scrollToTop">Back to Top</VcButton>
</template>
```

### Semantic Section Landmark

```vue
<VcContainer aria-label="Order history" shadow>
  <!-- renders as <section aria-label="Order history"> -->
</VcContainer>
```

## Accessibility

- When `ariaLabel` is provided, renders as a `<section>` landmark for screen readers
- Without `ariaLabel`, renders as a neutral `<div>`
- Scroll shadow provides a visual-only overflow cue; screen readers access all content normally

## Related Components

- [VcCard](../vc-card/) — bordered container with header and collapsing
- [VcCol](../vc-col/) — column layout primitive for flex grids
