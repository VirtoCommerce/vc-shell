# VcCol

A flexbox column layout primitive that stacks its children vertically. Designed to work with `VcRow` for proportional multi-column layouts. The `size` prop maps directly to `flex-grow`, so columns with higher values consume more horizontal space relative to their siblings.

## When to Use

- Create vertical stacking layouts within a row-based grid
- Control proportional column widths using the `size` prop
- Stack form fields, images, or content blocks vertically
- When NOT to use: for horizontal layouts, use [VcRow](../vc-row/); for scrollable content areas, use [VcContainer](../vc-container/)

## Basic Usage

```vue
<VcRow>
  <VcCol :size="1">Sidebar</VcCol>
  <VcCol :size="3">Main content</VcCol>
</VcRow>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `1` | Flex-grow value controlling how much space the column occupies relative to siblings |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--col-gap` | `0` | Vertical gap between child elements |

## Common Patterns

### Proportional Two-Column Layout

```vue
<VcRow class="tw-gap-4">
  <VcCol :size="1">
    <VcImage :src="product.imageUrl" size="xl" />
  </VcCol>
  <VcCol :size="2">
    <h3>{{ product.name }}</h3>
    <p>{{ product.description }}</p>
  </VcCol>
</VcRow>
```

### Three-Column Grid with Equal Widths

```vue
<VcRow class="tw-gap-4">
  <VcCol v-for="item in items" :key="item.id">
    <VcCard :header="item.title">
      <div class="tw-p-4">{{ item.summary }}</div>
    </VcCard>
  </VcCol>
</VcRow>
```

### Stacked Form Fields with Gap

```vue
<VcCol class="tw-gap-4">
  <VcInput label="First Name" v-model="form.firstName" />
  <VcInput label="Last Name" v-model="form.lastName" />
  <VcInput label="Email" v-model="form.email" />
</VcCol>
```

## Recipe: Blade Detail Form with Sidebar

A common blade layout places metadata in a narrow sidebar column and form fields in the wider main column:

```vue
<template>
  <VcRow class="tw-gap-6">
    <VcCol :size="3" class="tw-gap-4">
      <VcInput label="Name" v-model="form.name" required />
      <VcTextarea label="Description" v-model="form.description" />
      <VcSelect label="Category" v-model="form.category" :options="categories" />
    </VcCol>
    <VcCol :size="1" class="tw-gap-4">
      <VcStatusIcon :status="form.isPublished" />
      <VcHint>Created: {{ form.createdDate }}</VcHint>
      <VcHint>Modified: {{ form.modifiedDate }}</VcHint>
    </VcCol>
  </VcRow>
</template>
```

## Recipe: Nested Columns

VcCol can be nested inside another VcCol for complex sub-layouts:

```vue
<VcRow class="tw-gap-4">
  <VcCol :size="1">
    <VcRow class="tw-gap-2">
      <VcCol :size="1">
        <VcInput label="Width" v-model="dimensions.width" type="number" />
      </VcCol>
      <VcCol :size="1">
        <VcInput label="Height" v-model="dimensions.height" type="number" />
      </VcCol>
    </VcRow>
  </VcCol>
  <VcCol :size="1">
    <VcInput label="Weight" v-model="dimensions.weight" type="number" />
  </VcCol>
</VcRow>
```

## Tips

- The `size` prop sets `flex-grow` on the element. Two columns with `size="1"` share space equally; `size="1"` next to `size="3"` gives a 25/75 split.
- VcCol uses `flex-basis: 0` and `min-width: 0`, which means columns shrink to fit even if their content is wider. This prevents overflow in tight layouts.
- For vertical spacing between child elements, use the Tailwind `tw-gap-*` utility on the VcCol directly (e.g., `class="tw-gap-4"`), which is more ergonomic than the `--col-gap` CSS variable.
- VcCol can be used standalone (without VcRow) as a simple vertical stack container.

## Accessibility

- Renders as a `<div>` with no semantic role; add appropriate ARIA attributes to content as needed
- Uses `min-width: 0` to allow content to shrink properly in flex layouts

## Related Components

- [VcRow](../vc-row/) -- horizontal flex container; the natural parent for VcCol
- [VcContainer](../vc-container/) -- scrollable wrapper for overflow content
- [VcCard](../vc-card/) -- bordered section container often used inside columns
