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

## Directives

Directives follow the same explicit-import rule as components. `v-loading` and `v-autofocus` are no longer auto-registered globally.

```ts
// <script setup> — Vue auto-binds locally-scoped variables whose name starts with `v`
// to the same-named template directive (`vLoading` → `v-loading`).
import { vLoading, vAutofocus } from "@vc-shell/framework/ui";
```

Both directives are re-exported from `@vc-shell/framework/ui` as `vLoading` / `vAutofocus` aliases (the underlying symbols are `loading` / `autofocus` from `@vc-shell/framework/core/directives`).

If you cannot use `<script setup>`, register them at bootstrap instead:

```ts
import { createApp } from "vue";
import { vLoading, vAutofocus } from "@vc-shell/framework/ui";

const app = createApp(App);
app.directive("loading", vLoading);
app.directive("autofocus", vAutofocus);
```

### v-loading default z-index changed

The `v-loading` default z-index was lowered from **9999** to **9000** in v2.0 so popups and modals render above the spinner without extra overrides. If your code relied on the overlay sitting above a custom modal layer, pass an explicit z-index via the directive argument:

```vue
<template>
  <!-- Directive argument sets --v-loading-z-index on the host element -->
  <div v-loading:9999="isLoading">...</div>
</template>
```

You can also override globally via the CSS custom property `--v-loading-z-index` on the host element.

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
