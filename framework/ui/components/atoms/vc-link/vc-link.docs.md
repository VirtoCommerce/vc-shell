# VcLink

A clickable inline link element styled as a button, used for navigation or triggering actions within text or toolbars.

## When to Use

- Trigger navigation or actions inline with other content
- Build tab-like or breadcrumb-style navigation bars
- When NOT to use: for primary call-to-action buttons (use [VcButton](../vc-button/) instead)

## Basic Usage

```vue
<template>
  <VcLink @click="openDetails">View details</VcLink>
</template>

<script setup lang="ts">
import { VcLink } from "@vc-shell/framework";

function openDetails() {
  // handle navigation
}
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | `false` | Highlights the link as currently selected |
| `disabled` | `boolean` | `false` | Prevents interaction and applies muted styling |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | none | Fired when the link is clicked (suppressed when `disabled`) |

## Common Patterns

### Navigation Bar

```vue
<template>
  <div class="tw-flex tw-gap-4">
    <VcLink :active="currentTab === 'home'" @click="currentTab = 'home'">Home</VcLink>
    <VcLink :active="currentTab === 'products'" @click="currentTab = 'products'">Products</VcLink>
    <VcLink disabled>Admin</VcLink>
  </div>
</template>
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--link-text-color` | `var(--primary-500)` | Default text color |
| `--link-text-color-hover` | `var(--primary-400)` | Text color on hover |
| `--link-text-color-active` | `var(--primary-700)` | Text color in active state |
| `--link-text-color-disabled` | `var(--neutrals-300)` | Text color when disabled |
| `--link-focus-ring-color` | `primary-500 at 30%` | Focus ring color |

## Accessibility

- Renders as a native `<button>` element for keyboard operability
- `disabled` prop sets both the HTML `disabled` attribute and `aria-disabled`
- Focus-visible ring for keyboard navigation
- Underlines on hover for visual affordance

## Related Components

- [VcButton](../vc-button/) -- for primary actions and form submissions
