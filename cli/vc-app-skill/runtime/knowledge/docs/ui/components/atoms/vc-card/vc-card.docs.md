# VcCard

A bordered container with an optional header, icon, action buttons, and collapsible body. VcCard groups related content into visually distinct sections on blades and detail views. It supports three color variants for semantic meaning and smooth animated collapse/expand.

## When to Use

| Scenario                                      | Component                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| Grouping form fields or content with a header | **VcCard**                                                                   |
| Scrollable content wrapper without a header   | [VcContainer](../vc-container/)                                              |
| Collapsible section with rich toggle behavior | [VcAccordion](../../molecules/vc-accordion/) (for multiple exclusive panels) |
| Alert or notification banner                  | [VcBanner](../vc-banner/)                                                    |

Use VcCard to visually separate content sections on a blade -- especially when you need a titled header, action buttons, or collapsible body. **Do not use** VcCard for dismissible alerts or status messages (use `VcBanner`), and avoid nesting VcCard when a simple `VcContainer` with padding would suffice.

## Quick Start

```vue
<template>
  <VcCard header="Product Details">
    <div class="tw-p-4">
      <p>Card body content goes here.</p>
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { VcCard } from "@vc-shell/framework";
</script>
```

## Header with Icon

Add an icon to the left of the header title for visual context:

```vue
<VcCard header="Shipping Information" icon="lucide-truck">
  <div class="tw-p-4">
    <!-- shipping form fields -->
  </div>
</VcCard>
```

The icon renders at `xl` size using the `VcIcon` component. It inherits the header's text color, which changes based on the variant.

## Variants

Three variants control the header's background and text color to communicate semantic meaning.

```vue
<VcCard header="Order Details" variant="default">
  <div class="tw-p-4">Standard content section</div>
</VcCard>

<VcCard header="Payment Confirmed" variant="success">
  <div class="tw-p-4">Order has been paid successfully</div>
</VcCard>

<VcCard header="Validation Errors" variant="danger">
  <div class="tw-p-4">
    <ul class="tw-list-disc tw-pl-4">
      <li>SKU is required</li>
      <li>Price must be positive</li>
    </ul>
  </div>
</VcCard>
```

| Variant   | Header Background                  | Header Text                   | Use Case                              |
| --------- | ---------------------------------- | ----------------------------- | ------------------------------------- |
| `default` | `var(--secondary-50)` (light gray) | `var(--secondary-950)` (dark) | Standard content grouping             |
| `success` | `var(--success-100)` (light green) | `var(--success-600)` (green)  | Positive state confirmation           |
| `danger`  | `var(--danger-100)` (light red)    | `var(--danger-600)` (red)     | Errors, warnings, destructive content |

## Collapsible Sections

Enable collapse/expand behavior by setting `is-collapsable`. The card header becomes clickable and shows a chevron indicator.

```vue
<VcCard header="Advanced Settings" is-collapsable>
  <div class="tw-p-4">
    <!-- advanced form fields, hidden by default until expanded -->
  </div>
</VcCard>
```

### Initially collapsed

Start in the collapsed state by adding `is-collapsed`:

```vue
<VcCard header="Additional Options" is-collapsable is-collapsed>
  <div class="tw-p-4">
    <!-- content hidden on initial render -->
  </div>
</VcCard>
```

### Controlled collapse state

Listen to the `state:collapsed` event to sync the collapse state with external logic:

```vue
<script setup lang="ts">
import { ref } from "vue";

const isAdvancedHidden = ref(true);
</script>

<template>
  <VcCard
    header="Advanced Settings"
    is-collapsable
    :is-collapsed="isAdvancedHidden"
    @state:collapsed="isAdvancedHidden = $event"
  >
    <div class="tw-p-4">
      <!-- advanced fields -->
    </div>
  </VcCard>
</template>
```

The collapse animation uses CSS `grid-template-rows` transitions (200ms ease-out) for smooth height animation without JavaScript measurement.

## Header Actions

Use the `#actions` slot to place buttons or controls on the right side of the header:

```vue
<VcCard header="Order Items">
  <template #actions>
    <VcButton variant="primary" size="sm" icon="lucide-plus" @click="addItem">
      Add Item
    </VcButton>
  </template>
  <div class="tw-p-4">
    <!-- order items table -->
  </div>
</VcCard>
```

Multiple actions are supported:

```vue
<VcCard header="Product Images">
  <template #actions>
    <VcButton variant="ghost" size="icon-sm" icon="lucide-upload" aria-label="Upload" @click="upload" />
    <VcButton variant="ghost" size="icon-sm" icon="lucide-trash-2" aria-label="Remove all" @click="clearAll" />
  </template>
  <div class="tw-p-4">
    <!-- image gallery -->
  </div>
</VcCard>
```

## Custom Header

Replace the entire header content using the `#header` slot. This overrides the default title + icon rendering:

```vue
<VcCard>
  <template #header>
    <div class="tw-flex tw-items-center tw-gap-2">
      <VcIcon icon="lucide-package" size="m" />
      <span class="tw-font-bold">Custom Header</span>
      <VcBadge variant="success">Active</VcBadge>
    </div>
  </template>
  <div class="tw-p-4">
    <!-- card body -->
  </div>
</VcCard>
```

> **Note:** The `header` prop must be set (even to an empty string) for the header section to render. If neither `header` prop nor `#header` slot is provided, no header is displayed.

## Fill Mode

When `fill` is `true`, the card body applies `display: flex` to allow child content to fill the available vertical space. Useful when the card is inside a flex container and the body content (like a table) should stretch:

```vue
<VcCard header="Product List" fill>
  <!-- Table fills the remaining card height -->
  <VcDataTable :items="products" :columns="columns" />
</VcCard>
```

## Recipes

### Form Section Layout

```vue
<template>
  <div class="tw-flex tw-flex-col tw-gap-4">
    <VcCard
      header="Basic Information"
      icon="lucide-file-text"
    >
      <div class="tw-p-4 tw-grid tw-grid-cols-2 tw-gap-4">
        <VcInput
          v-model="form.name"
          label="Product Name"
          required
        />
        <VcInput
          v-model="form.sku"
          label="SKU"
          required
        />
        <VcInput
          v-model="form.price"
          label="Price"
          type="number"
        />
        <VcSelect
          v-model="form.category"
          label="Category"
          :options="categories"
        />
      </div>
    </VcCard>

    <VcCard
      header="SEO Settings"
      icon="lucide-search"
      is-collapsable
      is-collapsed
    >
      <div class="tw-p-4 tw-grid tw-grid-cols-2 tw-gap-4">
        <VcInput
          v-model="form.metaTitle"
          label="Meta Title"
        />
        <VcInput
          v-model="form.metaDescription"
          label="Meta Description"
        />
        <VcInput
          v-model="form.slug"
          label="URL Slug"
        />
      </div>
    </VcCard>

    <VcCard
      header="Inventory"
      icon="lucide-warehouse"
      is-collapsable
    >
      <div class="tw-p-4">
        <!-- inventory fields -->
      </div>
    </VcCard>
  </div>
</template>
```

### Conditional Variant Based on Data State

```vue
<template>
  <VcCard
    :header="validationHeader"
    :variant="errors.length > 0 ? 'danger' : 'success'"
    :icon="errors.length > 0 ? 'lucide-alert-triangle' : 'lucide-check-circle'"
  >
    <div class="tw-p-4">
      <ul
        v-if="errors.length > 0"
        class="tw-list-disc tw-pl-4 tw-space-y-1"
      >
        <li
          v-for="error in errors"
          :key="error"
        >
          {{ error }}
        </li>
      </ul>
      <p v-else>All validations passed.</p>
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

const errors = ref<string[]>([]);
const validationHeader = computed(() => (errors.value.length > 0 ? `${errors.value.length} Validation Error(s)` : "Validation Passed"));
</script>
```

## Common Mistakes

### Forgetting padding on card body

```vue
<!-- Wrong -- content touches the card border with no spacing -->
<VcCard header="Details">
  <p>This text has no padding.</p>
</VcCard>

<!-- Correct -- add padding to the body content -->
<VcCard header="Details">
  <div class="tw-p-4">
    <p>This text has proper spacing.</p>
  </div>
</VcCard>
```

### Using VcCard for alert messages

```vue
<!-- Wrong -- VcCard is for content grouping, not alerts -->
<VcCard header="Error" variant="danger">
  <div class="tw-p-4">Something went wrong.</div>
</VcCard>

<!-- Correct -- use VcBanner for dismissible alert messages -->
<VcBanner variant="danger">Something went wrong.</VcBanner>
```

### Expecting collapse without is-collapsable

```vue
<!-- Wrong -- is-collapsed has no effect without is-collapsable -->
<VcCard header="Settings" is-collapsed>
  <div class="tw-p-4">This is always visible.</div>
</VcCard>

<!-- Correct -- both props are needed -->
<VcCard header="Settings" is-collapsable is-collapsed>
  <div class="tw-p-4">This starts collapsed.</div>
</VcCard>
```

## Props

| Prop            | Type                                 | Default     | Description                                               |
| --------------- | ------------------------------------ | ----------- | --------------------------------------------------------- |
| `header`        | `string`                             | --          | Title text displayed in the card header                   |
| `icon`          | `string`                             | --          | Icon identifier shown before the title                    |
| `variant`       | `"default" \| "success" \| "danger"` | `"default"` | Header color variant                                      |
| `isCollapsable` | `boolean`                            | `false`     | Enables collapse/expand on header click                   |
| `isCollapsed`   | `boolean`                            | `false`     | Controls the collapsed state (requires `isCollapsable`)   |
| `fill`          | `boolean`                            | `false`     | Makes body content fill available vertical space via flex |

## Events

| Event             | Payload   | Description                                                                  |
| ----------------- | --------- | ---------------------------------------------------------------------------- |
| `header:click`    | --        | Emitted when the header is clicked (always, regardless of collapsable state) |
| `state:collapsed` | `boolean` | Emitted when the collapsed state changes (`true` = collapsed)                |

## Slots

| Slot      | Description                                               |
| --------- | --------------------------------------------------------- |
| `default` | Card body content                                         |
| `header`  | Custom header content (replaces the default title + icon) |
| `actions` | Action buttons rendered on the right side of the header   |

## CSS Custom Properties

| Variable                           | Default                      | Description                        |
| ---------------------------------- | ---------------------------- | ---------------------------------- |
| `--card-background`                | `var(--additional-50)`       | Card body background               |
| `--card-border-color`              | `var(--neutrals-200)`        | Border color                       |
| `--card-border-radius`             | `6px`                        | Corner radius                      |
| `--card-header-background`         | `var(--secondary-50)`        | Default header background          |
| `--card-header-color`              | `var(--secondary-950)`       | Default header text color          |
| `--card-header-background-success` | `var(--success-100)`         | Success variant header background  |
| `--card-header-background-danger`  | `var(--danger-100)`          | Danger variant header background   |
| `--card-header-color-success`      | `var(--success-600)`         | Success variant header text        |
| `--card-header-color-danger`       | `var(--danger-600)`          | Danger variant header text         |
| `--card-header-padding-hor`        | `24px`                       | Header horizontal padding          |
| `--card-header-padding-vert`       | `17px`                       | Header vertical padding            |
| `--card-hover-shadow`              | `0 2px 8px rgba(0,0,0,0.06)` | Hover shadow                       |
| `--card-focus-ring-color`          | `var(--primary-300)`         | Focus ring for collapsable headers |

## Accessibility

- Collapsable headers render with `role="button"` and `tabindex="0"` for keyboard access
- `aria-expanded` reflects the current collapsed/expanded state
- `aria-controls` links the header to the body panel via a unique auto-generated ID
- Supports Enter and Space key activation for toggling collapse
- Focus ring appears on `:focus-visible` for keyboard navigation (inset ring, 2px)
- Non-collapsable headers have no role or tabindex (not interactive)

## Related Components

- [VcContainer](../vc-container/) -- scrollable content wrapper without header or collapsing
- [VcBanner](../vc-banner/) -- for alert/notification messages rather than content grouping
- [VcCol](../vc-col/) / [VcRow](../vc-row/) -- for grid-based layout within card bodies

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, VcCard shows a skeleton header (if the `header` prop is set) while its body content renders normally — child components self-skeletonize via their own `BladeLoadingKey` injection.
