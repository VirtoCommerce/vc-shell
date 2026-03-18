# VcLink

A clickable inline link element styled as a button, used for navigation or triggering actions within text or toolbars. Despite its link-like appearance, VcLink renders as a native `<button>` element, which provides correct keyboard behavior and avoids the need for an `href` attribute when the action is handled in JavaScript.

## When to Use

- Trigger navigation or actions inline with other content
- Build tab-like or breadcrumb-style navigation bars
- Secondary actions in toolbars or table cells
- When NOT to use: for primary call-to-action buttons (use [VcButton](../vc-button/) instead); for real URL navigation with `href` (use a plain `<a>` tag or router-link)

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

### Inline Action in a Table Cell

```vue
<VcColumn id="actions" header="Actions" :width="120">
  <template #default="{ row }">
    <div class="tw-flex tw-gap-3">
      <VcLink @click="editItem(row)">Edit</VcLink>
      <VcLink @click="duplicateItem(row)">Copy</VcLink>
    </div>
  </template>
</VcColumn>
```

### Breadcrumb Trail

```vue
<template>
  <nav class="tw-flex tw-items-center tw-gap-1 tw-text-sm">
    <VcLink @click="goTo('catalog')">Catalog</VcLink>
    <span class="tw-text-gray-400">/</span>
    <VcLink @click="goTo('category')">Electronics</VcLink>
    <span class="tw-text-gray-400">/</span>
    <span class="tw-font-medium">Laptop Model X</span>
  </nav>
</template>
```

## Recipe: Toggle Active Link from a List

```vue
<script setup lang="ts">
import { ref } from "vue";

const tabs = ["Overview", "Pricing", "SEO", "Properties"];
const activeTab = ref("Overview");
</script>

<template>
  <div class="tw-flex tw-gap-4 tw-border-b tw-pb-2">
    <VcLink
      v-for="tab in tabs"
      :key="tab"
      :active="activeTab === tab"
      @click="activeTab = tab"
    >
      {{ tab }}
    </VcLink>
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

## Tips

- VcLink resets all default button styles (`background`, `border`, `padding`) so it looks like a text link. If you need a visible button shape, use VcButton instead.
- The `active` state applies a darker color and removes the hover underline, making it suitable for indicating the currently selected item in a tab bar.
- Disabled links show `cursor: not-allowed` and reduced opacity. The `click` event is never emitted when disabled.
- Combine with Tailwind utility classes for font size or weight: `<VcLink class="tw-text-xs tw-font-semibold">`.

## Accessibility

- Renders as a native `<button>` element for keyboard operability
- `disabled` prop sets both the HTML `disabled` attribute and `aria-disabled`
- Focus-visible ring for keyboard navigation
- Underlines on hover for visual affordance

## Related Components

- [VcButton](../vc-button/) -- for primary actions and form submissions
