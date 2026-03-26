# 36. $isMobile / inject(IsMobileKey) → useResponsive()

## What Changed

A new `useResponsive()` composable replaces three different patterns for accessing breakpoint state:

| Old Pattern | Where | Replacement |
|-------------|-------|-------------|
| `$isMobile.value` / `$isDesktop.value` | template | `isMobile` / `isDesktop` (auto-unwrapped) |
| `inject(IsMobileKey, ref(false))` | script | `const { isMobile } = useResponsive()` |
| `inject("isMobile", ref(false))` | script (legacy v1.x) | `const { isMobile } = useResponsive()` |

The global properties (`$isMobile`, `$isDesktop`, `$isPhone`, `$isTablet`, `$isTouch`) and injection keys (`IsMobileKey`, `IsDesktopKey`, etc.) are now **deprecated** but continue to work.

## Why

1. **`$isMobile.value` in templates is confusing** — Vue auto-unwraps refs from `<script setup>` but NOT global properties, requiring explicit `.value` access
2. **Two APIs for the same thing** — templates used `$isMobile.value`, script used `inject(IsMobileKey)`
3. **Type errors** — global property type augmentations don't always resolve correctly in consumer projects

`useResponsive()` provides a single API that works everywhere. In templates, Vue auto-unwraps the refs, so no `.value` is needed.

## Migration

### Before

```vue
<template>
  <div :class="{ 'my-comp--mobile': $isMobile.value }">
    <span v-if="$isDesktop.value">Desktop</span>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from "vue";
import { IsMobileKey } from "@vc-shell/framework";

const isMobile = inject(IsMobileKey, ref(false));
// or legacy: const isMobile = inject("isMobile", ref(false));
</script>
```

### After

```vue
<template>
  <div :class="{ 'my-comp--mobile': isMobile }">
    <span v-if="isDesktop">Desktop</span>
  </div>
</template>
<script setup lang="ts">
import { useResponsive } from "@vc-shell/framework";

const { isMobile, isDesktop } = useResponsive();
</script>
```

## Available Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isMobile` | `Ref<boolean>` | `false` | Viewport < 1024px |
| `isDesktop` | `Ref<boolean>` | `true` | Viewport >= 1024px |
| `isPhone` | `Ref<boolean>` | `false` | Viewport < 480px |
| `isTablet` | `Ref<boolean>` | `false` | 480px <= Viewport < 1024px |
| `isTouch` | `boolean` | `false` | Touch device (not reactive) |

## Automated Migration

```bash
# Preview changes (dry run)
npx @vc-shell/migrate --to 2.0.0 --transform responsive-composable --dry-run

# Apply changes
npx @vc-shell/migrate --to 2.0.0 --transform responsive-composable
```

The codemod handles all three patterns:
- `$isMobile.value` / `$isDesktop.value` in templates → `isMobile` / `isDesktop`
- `inject(IsMobileKey, ...)` in script → `useResponsive()` destructure
- `inject("isMobile", ...)` in script → `useResponsive()` destructure
- Adds `useResponsive` import, removes unused injection key imports

## How to Find

```bash
# Template global properties (needs migration)
grep -rn '\$isMobile\|\$isDesktop\|\$isPhone\|\$isTablet\|\$isTouch' src/ --include="*.vue"

# Symbol inject (needs migration)
grep -rn 'inject(IsMobileKey\|inject(IsDesktopKey\|inject(IsPhoneKey\|inject(IsTabletKey\|inject(IsTouchKey' src/

# String inject (legacy, needs migration)
grep -rn 'inject("isMobile"\|inject("isDesktop"\|inject("isPhone"\|inject("isTablet"\|inject("isTouch"' src/

# Already migrated
grep -rn 'useResponsive' src/
```
