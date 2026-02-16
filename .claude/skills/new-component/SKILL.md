---
name: new-component
description: Scaffold a new VC-Shell UI component with proper structure, types, barrel exports, and Storybook story
disable-model-invocation: true
---

# New Component Scaffolding

Scaffold a new VC-Shell framework UI component following all project conventions.

## Arguments

Parse the user's input for:
- **Component name** (required): e.g. `VcDatePicker`, `VcColorInput`
- **Atomic level** (required): `atom`, `molecule`, or `organism`
- **Has internal sub-components** (optional, default: no)

Example invocations:
- `/new-component VcRating atom`
- `/new-component VcTimeline organism --with-internals`

## Steps

### 1. Determine placement

Map atomic level to directory:
- `atom` → `framework/ui/components/atoms/`
- `molecule` → `framework/ui/components/molecules/`
- `organism` → `framework/ui/components/organisms/`

Convert component name to kebab-case for the directory name (e.g. `VcDatePicker` → `vc-date-picker`).

### 2. Create component directory and files

Create these files:

#### `{kebab-name}/{kebab-name}.vue`

```vue
<script setup lang="ts">
export interface Props {
  // Define component props here
}

withDefaults(defineProps<Props>(), {
  // Default values
});
</script>

<template>
  <div class="{kebab-name}">
    <slot />
  </div>
</template>

<style lang="scss">
.{kebab-name} {
  // Component styles - use tw- prefix for Tailwind classes
  // Use BEM: .{kebab-name}__element, .{kebab-name}--modifier
}
</style>
```

#### `{kebab-name}/index.ts`

```typescript
export { default as {PascalName} } from "./{kebab-name}.vue";
```

#### `{kebab-name}/{kebab-name}.stories.ts`

```typescript
import type { Meta, StoryObj } from "@storybook/vue3";
import {PascalName} from "./{kebab-name}.vue";

const meta = {
  title: "{AtomicLevel}/{PascalName}",
  component: {PascalName},
  args: {},
  parameters: {
    docs: {
      description: {
        component: "TODO: Add component description.",
      },
    },
  },
} satisfies Meta<typeof {PascalName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { {PascalName} },
    setup() {
      return { args };
    },
    template: `
      <div class="tw-p-4">
        <{PascalName} v-bind="args" />
      </div>
    `,
  }),
};
```

### 3. Create `_internal/` directory (if requested)

If the user specified `--with-internals`, create an empty `_internal/` subdirectory.

### 4. Register in parent barrel export

Add the export to the parent level `index.ts` barrel file (e.g. `molecules/index.ts`):
```typescript
export * from "./{kebab-name}";
```

### 5. Verify

Run: `cd framework && npx tsc --noEmit` to ensure the new component compiles.

## Conventions Reference

- Tailwind prefix: `tw-` (e.g. `tw-flex`, `tw-px-1`)
- CSS scoped styles use BEM: `.vc-component-name__element`
- Colors: CSS custom properties like `tw-bg-[var(--primary-500)]`
- Props: TypeScript interface, use `withDefaults`
- Responsive: `$isMobile.value` / `$isDesktop.value`, mobile variants in `mobile/` subdirectory
- Stories: use `satisfies Meta<typeof Component>` pattern
- Storybook title format: `"Atoms/VcButton"`, `"Molecules/VcInput"`, `"Organisms/VcTable"`
