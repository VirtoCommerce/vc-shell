---
id: component-VcButton-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","button","action","interactive"]
title: "VcButton Demo"
description: "Button component for actions"
componentRole: action
bladeContext: ["details","list","general"]
---

# VcButton Demo

Real-world button examples from vendor-portal.

## Basic Buttons

```vue
<template>
  <!-- Primary button -->
  <VcButton
    variant="primary"
    :disabled="!hasFilterChanges"
    @click="applyFilters"
  >
    {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.APPLY") }}
  </VcButton>

  <!-- Secondary button -->
  <VcButton
    variant="secondary"
    :disabled="!hasFiltersApplied"
    @click="resetFilters"
  >
    {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.RESET") }}
  </VcButton>

  <!-- Default button -->
  <VcButton @click="handleClick">
    {{ $t("COMMON.SUBMIT") }}
  </VcButton>
</template>
```

## Button Variants

```vue
<template>
  <div class="tw-flex tw-gap-2">
    <!-- Primary -->
    <VcButton variant="primary" @click="save">
      {{ $t("COMMON.SAVE") }}
    </VcButton>

    <!-- Secondary -->
    <VcButton variant="secondary" @click="cancel">
      {{ $t("COMMON.CANCEL") }}
    </VcButton>

    <!-- Danger -->
    <VcButton variant="danger" @click="deleteItem">
      {{ $t("COMMON.DELETE") }}
    </VcButton>

    <!-- Warning -->
    <VcButton variant="warning" @click="warn">
      {{ $t("COMMON.WARNING") }}
    </VcButton>
  </div>
</template>
```

## Disabled States

```vue
<template>
  <!-- Disabled based on condition -->
  <VcButton
    variant="primary"
    :disabled="!hasFilterChanges"
    @click="applyFilters"
  >
    {{ $t("COMMON.APPLY") }}
  </VcButton>

  <!-- Disabled during loading -->
  <VcButton
    variant="primary"
    :disabled="loading || !meta.valid"
    @click="submit"
  >
    {{ loading ? $t("COMMON.SAVING") : $t("COMMON.SAVE") }}
  </VcButton>
</template>
```

## Filter Controls Pattern

```vue
<template>
  <div class="tw-flex tw-gap-2 tw-mt-4">
    <VcButton
      variant="primary"
      :disabled="!hasFilterChanges"
      @click="applyFilters"
    >
      {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.APPLY") }}
    </VcButton>

    <VcButton
      variant="secondary"
      :disabled="!hasFiltersApplied"
      @click="resetFilters"
    >
      {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.RESET") }}
    </VcButton>
  </div>
</template>
```

## Key Points

- **Variants**: `primary`, `secondary`, `danger`, `warning`
- **Disabled state**: Use `:disabled` with computed or reactive values
- **Text**: Always use i18n with `$t()`
- **Click handler**: Use `@click` for async or sync functions
- **Spacing**: Use Tailwind classes for layout (`tw-flex`, `tw-gap-2`, etc.)

## Common Patterns

### Filter Buttons
```vue
<VcButton variant="primary" :disabled="!hasChanges" @click="apply">
  Apply
</VcButton>
<VcButton variant="secondary" :disabled="!hasFilters" @click="reset">
  Reset
</VcButton>
```

### Form Actions
```vue
<VcButton variant="primary" :disabled="!meta.valid || !modified" @click="save">
  Save
</VcButton>
<VcButton variant="secondary" @click="cancel">
  Cancel
</VcButton>
```

### Destructive Actions
```vue
<VcButton variant="danger" @click="deleteItem">
  Delete
</VcButton>
```
