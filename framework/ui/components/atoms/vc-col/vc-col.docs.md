# VcCol

A flexbox column layout primitive that stacks its children vertically. Designed to work with `VcRow` for proportional multi-column layouts.

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

## Accessibility

- Renders as a `<div>` with no semantic role; add appropriate ARIA attributes to content as needed
- Uses `min-width: 0` to allow content to shrink properly in flex layouts

## Related Components

- [VcRow](../vc-row/) — horizontal flex container; the natural parent for VcCol
- [VcContainer](../vc-container/) — scrollable wrapper for overflow content
- [VcCard](../vc-card/) — bordered section container often used inside columns
