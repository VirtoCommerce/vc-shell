# VcBlade

The core UI container in VirtoCommerce shell. Blades are stacked panels (similar to Azure Portal) that form the primary navigation paradigm -- each action opens a new blade to the right.

## When to Use

- Wrap every page-level view (list, detail, form) in a `VcBlade`.
- Use blade header for title, subtitle, icon, and close button.
- Use the toolbar zone for action buttons via `toolbarItems`.
- When NOT to use: for modal dialogs use `VcPopup`; for side panels use `VcSidebar`.

## Basic Usage

```vue
<template>
  <VcBlade
    title="Products"
    subtitle="Manage catalog"
    icon="lucide-package"
    :closable="true"
    :toolbar-items="toolbar"
    @close="closeBlade"
  >
    <div>Blade content here</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade } from "@vc-shell/framework";
import type { IBladeToolbar } from "@vc-shell/framework";

const toolbar: IBladeToolbar[] = [
  { id: "save", title: "Save", icon: "lucide-save", clickHandler: () => save() },
  { id: "delete", title: "Delete", icon: "lucide-trash-2", clickHandler: () => remove() },
];
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | -- | Blade header title. |
| `subtitle` | `string` | -- | Secondary text below the title. |
| `icon` | `string` | -- | Icon class displayed before the title. |
| `width` | `number \| string` | `"30%"` | Blade width (px or CSS value). |
| `expanded` | `boolean` | `false` | Expand blade to fill available space. |
| `closable` | `boolean` | `true` | Show close button in the header. |
| `toolbarItems` | `IBladeToolbar[]` | `[]` | Action buttons rendered in the toolbar zone. |
| `modified` | `boolean` | -- | Shows unsaved-changes indicator banner. |
| `loading` | `boolean` | `false` | Shows skeleton placeholders for header, toolbar, and content. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | -- | Emitted when close button is clicked. |
| `expand` | -- | Emitted when blade expands. |
| `collapse` | -- | Emitted when blade collapses. |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main blade content. |
| `actions` | Extra action buttons in the header (right side). |

## Common Patterns

**Loading state with skeleton:**

```vue
<VcBlade title="Product Details" :loading="isLoading">
  <ProductForm v-if="product" :data="product" />
</VcBlade>
```

**Unsaved changes indicator:**

```vue
<VcBlade title="Edit Product" :modified="hasChanges" @close="confirmClose">
  <!-- form content -->
</VcBlade>
```

## Accessibility

- Blade uses `role="region"` with `aria-labelledby` pointing to the title.
- When title is not available (loading), an `aria-label` fallback is provided.
- Close button is keyboard-accessible.

## Related Components

- **VcBladeNavigation** -- manages the blade stack and horizontal scroll.
- **useBladeContext()** -- composable for opening child blades, closing self, and parent communication.
- **useBlade()** -- composable providing blade ID and toolbar registration.
