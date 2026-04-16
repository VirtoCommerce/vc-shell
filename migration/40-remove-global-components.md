# 40. Remove Global Component Registration

## What Changed

The framework no longer registers `Vc*` UI components and directives globally via `app.component()` / `app.directive()` during plugin installation. All 64 UI components and 2 directives (`v-loading`, `v-autofocus`) must now be explicitly imported in every file that uses them.

## Why

- **Tree-shaking**: bundlers can now eliminate unused components from production builds
- **Explicit dependencies**: each file declares what it uses — easier to understand, refactor, and review
- **Better IDE support**: autocomplete, go-to-definition, and rename refactoring work without global type augmentations

## Automated Migration

```bash
npx @vc-shell/migrate --transform remove-global-components
```

The codemod scans every `.vue` file and:

1. Detects `<VcButton>`, `<vc-button>`, `v-loading`, etc. in `<template>`
2. Adds `import { VcButton } from "@vc-shell/framework/ui"` to `<script setup>`
3. Moves existing component imports from `@vc-shell/framework` to `@vc-shell/framework/ui`

## Before

```vue
<template>
  <VcButton @click="save">Save</VcButton>
  <VcInput v-model="name" label="Name" />
  <div v-loading="isLoading">...</div>
</template>

<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
import { ref } from "vue";

const name = ref("");
const isLoading = ref(false);
const save = () => {};
</script>
```

## After

```vue
<template>
  <VcButton @click="save">Save</VcButton>
  <VcInput v-model="name" label="Name" />
  <div v-loading="isLoading">...</div>
</template>

<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
import { VcButton, VcInput, vLoading } from "@vc-shell/framework/ui";
import { ref } from "vue";

const name = ref("");
const isLoading = ref(false);
const save = () => {};
</script>
```

## Manual Steps

The automated codemod handles most cases. These patterns require manual migration:

### Dynamic components

```ts
// Before — resolveComponent won't work without global registration:
const comp = resolveComponent("VcButton");

// After — import directly:
import { VcButton } from "@vc-shell/framework/ui";
```

### Component `:is` with string names

```vue
<!-- Before -->
<component :is="'VcButton'" />

<!-- After — use imported reference -->
<component :is="VcButton" />
```

### Custom module components

If your module registered components via `app.component()` in a Vue plugin, remove the registration and export the component for direct import instead.
