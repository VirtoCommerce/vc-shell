# VcButton

A versatile button component supporting 9 style variants, 5 size options, loading state, and icon integration. VcButton is the primary interactive element for triggering actions throughout the application -- from toolbar buttons and form submissions to inline table actions and navigation.

## When to Use

| Scenario                                    | Component                                                 |
| ------------------------------------------- | --------------------------------------------------------- |
| Triggering an action (save, delete, submit) | **VcButton**                                              |
| Navigating to another URL or route          | `<router-link>` or `<a>` tag                              |
| Action inside a blade toolbar               | `IBladeToolbar` items (rendered as buttons automatically) |
| Inline text-style link within a paragraph   | Native `<a>` or `<router-link>`                           |

Use VcButton for any user-initiated action that does not navigate to a URL. **Do not use** VcButton for navigation -- the `link` variant looks like a link but calls `preventDefault()`, so actual URL navigation will not work. For toolbar actions, define `IBladeToolbar` objects instead of placing VcButton manually.

## Quick Start

```vue
<template>
  <VcButton
    variant="primary"
    @click="handleSave"
    >Save Changes</VcButton
  >
</template>

<script setup lang="ts">
import { VcButton } from "@vc-shell/framework";
</script>
```

## Variants

VcButton provides 9 visual variants organized into three emphasis levels.

### Filled Variants (High Emphasis)

Solid background colors for primary and prominent actions.

```vue
<VcButton variant="primary">Primary Action</VcButton>
<VcButton variant="danger">Delete</VcButton>
<VcButton variant="warning">Caution</VcButton>
<VcButton variant="success">Approve</VcButton>
<VcButton variant="info">Learn More</VcButton>
```

| Variant   | Use Case                               | Text Color          |
| --------- | -------------------------------------- | ------------------- |
| `primary` | Main CTA -- save, submit, confirm      | White               |
| `danger`  | Destructive actions -- delete, remove  | White               |
| `warning` | Caution actions -- override, force     | Dark (for contrast) |
| `success` | Positive actions -- approve, publish   | White               |
| `info`    | Informational actions -- details, help | White               |

### Structural Variants (Medium Emphasis)

Bordered or transparent backgrounds for secondary actions.

```vue
<VcButton variant="secondary">Cancel</VcButton>
<VcButton variant="outline">Export</VcButton>
```

| Variant     | Use Case                              | Hover Behavior                                   |
| ----------- | ------------------------------------- | ------------------------------------------------ |
| `secondary` | Cancel, dismiss, secondary actions    | Background changes to primary-50                 |
| `outline`   | Alternative actions alongside primary | Background changes to primary-50, border darkens |

### Minimal Variants (Low Emphasis)

No border or background, used for inline or de-emphasized actions.

```vue
<VcButton variant="ghost">Settings</VcButton>
<VcButton variant="link">View Documentation</VcButton>
```

| Variant | Use Case                           | Hover Behavior        |
| ------- | ---------------------------------- | --------------------- |
| `ghost` | Toolbar icons, inline actions      | Light background tint |
| `link`  | Text-like navigation, inline links | Underline on text     |

## Sizes

Five size options cover all common use cases from toolbar icons to prominent CTAs.

```vue
<VcButton size="sm">Small</VcButton>
<VcButton size="default">Default</VcButton>
<VcButton size="lg">Large</VcButton>
<VcButton size="icon" icon="lucide-settings" aria-label="Settings" />
<VcButton size="icon-sm" icon="lucide-pencil" aria-label="Edit" />
```

| Size      | Height  | Padding                       | Typical Use                         |
| --------- | ------- | ----------------------------- | ----------------------------------- |
| `sm`      | 32px    | 12px horizontal               | Compact form actions, table footers |
| `default` | 36px    | 16px horizontal, 8px vertical | Standard blade actions              |
| `lg`      | 40px    | 24px horizontal               | Prominent CTAs, dialog actions      |
| `icon`    | 36x36px | 0 (square)                    | Toolbar icon buttons                |
| `icon-sm` | 24x24px | 0 (square)                    | Table cell actions, inline controls |

> **Note:** Legacy aliases `xs` (maps to `sm`) and `base` (maps to `default`) are supported for backward compatibility.

## Icons

VcButton supports icons via the `icon` prop. Icons appear to the left of the button text, or centered for icon-only buttons.

```vue
<!-- Icon + text -->
<VcButton variant="primary" icon="lucide-plus">Add Item</VcButton>

<!-- Icon only (requires aria-label) -->
<VcButton variant="ghost" size="icon" icon="lucide-settings" aria-label="Settings" />

<!-- Custom icon size -->
<VcButton icon="lucide-download" icon-size="m">Download</VcButton>
```

The `icon` prop accepts a string (icon identifier like `lucide-plus`) or a Vue component.

## Loading State

When `loading` is `true`, the button shows a spinner in place of its icon and becomes non-interactive:

```vue
<VcButton variant="primary" :loading="isSaving" @click="save">
  Save Changes
</VcButton>
```

During loading:

- The icon is replaced with a spinning `lucide-loader-2`
- The button is disabled (`pointer-events: none`)
- The cursor changes to `wait`
- `aria-busy="true"` is set for assistive technologies

## Selected State

The `selected` prop applies a visual highlight. Useful for toggle buttons or active states:

```vue
<VcButton variant="ghost" :selected="isGridView" icon="lucide-grid" aria-label="Grid view" @click="isGridView = true" />
```

When selected, `aria-pressed="true"` is set on the button element.

## Text Modifier

The `text` prop renders the button with no background or border, showing only the text in the variant's color. Useful for inline actions:

```vue
<VcButton variant="primary" text @click="viewAll">View All</VcButton>
<VcButton variant="danger" text @click="clearAll">Clear</VcButton>
```

## Button Groups

VcButton integrates with `VcButtonGroup` via provide/inject. The group can set a shared `size` for all child buttons:

```vue
<VcButtonGroup size="sm">
  <VcButton variant="outline">Left</VcButton>
  <VcButton variant="outline">Center</VcButton>
  <VcButton variant="outline">Right</VcButton>
</VcButtonGroup>
```

## Recipes

### Toolbar Save / Cancel Pair

```vue
<template>
  <div class="tw-flex tw-gap-2">
    <VcButton
      variant="secondary"
      @click="cancel"
      >Cancel</VcButton
    >
    <VcButton
      variant="primary"
      :loading="isSaving"
      @click="save"
    >
      Save
    </VcButton>
  </div>
</template>
```

### Confirmation Dialog Actions

```vue
<template>
  <div class="tw-flex tw-justify-end tw-gap-3 tw-p-4">
    <VcButton
      variant="outline"
      @click="dismiss"
      >Cancel</VcButton
    >
    <VcButton
      variant="danger"
      :loading="isDeleting"
      icon="lucide-trash-2"
      @click="confirmDelete"
    >
      Delete Permanently
    </VcButton>
  </div>
</template>
```

## Common Mistakes

### Missing aria-label on icon-only buttons

```vue
<!-- Wrong -- no accessible name for screen readers -->
<VcButton size="icon" icon="lucide-trash-2" @click="remove" />

<!-- Correct -->
<VcButton size="icon" icon="lucide-trash-2" aria-label="Remove item" @click="remove" />
```

### Using link variant for actual navigation

```vue
<!-- Wrong -- VcButton prevents default on click, navigation will not work -->
<VcButton variant="link" @click="router.push('/orders')">Orders</VcButton>

<!-- Correct -- use a router-link or <a> for URL navigation -->
<router-link to="/orders" class="tw-text-primary-700">Orders</router-link>
```

### Relying on disabled instead of loading

```vue
<!-- Wrong -- user sees a frozen button with no feedback -->
<VcButton :disabled="isSaving" @click="save">Save</VcButton>

<!-- Correct -- loading shows a spinner and communicates progress -->
<VcButton :loading="isSaving" @click="save">Save</VcButton>
```

## Props

| Prop        | Type                                                                                                         | Default     | Description                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------- |
| `variant`   | `"primary" \| "secondary" \| "danger" \| "warning" \| "success" \| "info" \| "outline" \| "ghost" \| "link"` | `"primary"` | Visual style variant                                            |
| `size`      | `"sm" \| "default" \| "lg" \| "icon" \| "icon-sm"`                                                           | `"default"` | Button size                                                     |
| `icon`      | `string \| Component`                                                                                        | --          | Icon identifier or Vue component                                |
| `iconClass` | `string`                                                                                                     | --          | Additional CSS class for the icon element                       |
| `iconSize`  | `IconSize`                                                                                                   | `"s"`       | Size of the icon (`"xs"`, `"s"`, `"m"`, `"l"`, `"xl"`, `"xxl"`) |
| `loading`   | `boolean`                                                                                                    | `false`     | Shows spinner, disables interaction, sets `aria-busy`           |
| `disabled`  | `boolean`                                                                                                    | `false`     | Disables the button                                             |
| `selected`  | `boolean`                                                                                                    | `false`     | Applies selected/active visual state, sets `aria-pressed`       |
| `text`      | `boolean`                                                                                                    | `false`     | Renders as borderless text in the variant's color               |
| `type`      | `"button" \| "submit" \| "reset"`                                                                            | `"button"`  | HTML button type                                                |
| `ariaLabel` | `string`                                                                                                     | --          | Accessible label (required for icon-only buttons)               |

## Events

| Event   | Payload | Description                                                              |
| ------- | ------- | ------------------------------------------------------------------------ |
| `click` | `Event` | Emitted when the button is clicked (suppressed when disabled or loading) |

## Slots

| Slot      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `default` | Button text content. When empty, the button renders as icon-only. |

## CSS Custom Properties

All visual properties are customizable through CSS custom properties. Each variant has three property sets (normal, hover, disabled) for background, text, and border colors.

| Pattern                                     | Example                                   | Description                   |
| ------------------------------------------- | ----------------------------------------- | ----------------------------- |
| `--button-{variant}-background-color`       | `--button-primary-background-color`       | Normal background             |
| `--button-{variant}-background-color-hover` | `--button-primary-background-color-hover` | Hover background              |
| `--button-{variant}-text-color`             | `--button-primary-text-color`             | Normal text color             |
| `--button-{variant}-border-color`           | `--button-primary-border-color`           | Normal border color           |
| `--button-border-radius`                    | `6px`                                     | Corner radius for all buttons |
| `--button-focus-ring-color`                 | `var(--primary-300)`                      | Focus ring color              |
| `--button-focus-ring-width`                 | `2px`                                     | Focus ring thickness          |
| `--button-{size}-height`                    | `--button-default-height: 36px`           | Height per size               |

## Accessibility

- Focus ring appears on `:focus-visible` only (keyboard navigation), not on mouse click
- Touch target is expanded to 44px minimum via a `::after` pseudo-element (WCAG 2.5.8)
- `aria-busy` is set to `true` during loading state
- `aria-pressed` reflects the `selected` prop for toggle buttons
- Icon-only buttons **must** include `ariaLabel` for screen reader users
- Disabled buttons use `pointer-events: none` and `opacity: 0.5` to prevent interaction
- The `click` event calls `e.preventDefault()` -- use `type="submit"` for form submissions

## Related Components

- [VcIcon](../vc-icon/) -- used internally for button icons
- [VcBadge](../vc-badge/) -- can wrap a button to show notification counts
- [VcButtonGroup](./vc-button-group.vue) -- groups buttons with shared size context
