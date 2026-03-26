# useResponsive

Reactive breakpoint state for building responsive blade UIs. Returns refs that indicate the current viewport category (phone, tablet, mobile, desktop) and whether the device supports touch input. Replaces the legacy `$isMobile.value` global properties in templates and `inject(IsMobileKey)` in script setup with a single, consistent API.

## When to Use

- Conditionally render desktop vs. mobile layouts in blade pages and components
- Apply responsive CSS classes based on viewport size
- Toggle behavior (e.g., disable drag-and-drop on touch devices, switch column visibility)
- When NOT to use: for CSS-only responsive changes, prefer Tailwind breakpoint prefixes (`md:`, `lg:`) instead of JavaScript-driven conditionals

## Quick Start

```vue
<script setup lang="ts">
import { useResponsive } from "@vc-shell/framework";

const { isMobile, isDesktop } = useResponsive();
</script>

<template>
  <VcBlade title="Orders">
    <!-- Vue auto-unwraps refs from script setup — no .value needed -->
    <div v-if="isDesktop" class="tw-flex tw-gap-4">
      <OrdersTable />
      <OrdersSummary />
    </div>
    <OrdersTable v-else />
  </VcBlade>
</template>
```

## API

### Parameters

None. The composable reads breakpoint state from the framework's provide/inject context, which is set up automatically by `VcApp`.

### Returns (`UseResponsiveReturn`)

| Property | Type | Default | Description |
|---|---|---|---|
| `isMobile` | `Ref<boolean>` | `false` | `true` when viewport width < 1024px |
| `isDesktop` | `Ref<boolean>` | `true` | `true` when viewport width >= 1024px |
| `isPhone` | `Ref<boolean>` | `false` | `true` when viewport width < 480px |
| `isTablet` | `Ref<boolean>` | `false` | `true` when 480px <= viewport width < 1024px |
| `isTouch` | `boolean` | `false` | `true` on touch-capable devices (not reactive — set once at app init) |

Breakpoint thresholds: phone < 480px, tablet 480–1023px, desktop >= 1024px. These match the framework's `setupBreakpoints()` configuration.

Note: `isMobile` is the union of `isPhone` and `isTablet` — it covers all viewports below the desktop threshold.

## How It Works

Under the hood, `useResponsive()` calls `inject()` for each breakpoint key (`IsMobileKey`, `IsDesktopKey`, etc.) with sensible defaults. The framework's root `VcApp` component provides these refs during app initialization using VueUse's `useBreakpoints`. Because the return values are the same `Ref<boolean>` instances provided at the app level, they are reactive and shared across all components.

The defaults ensure the composable works even outside the VcApp provider tree (e.g., in unit tests or Storybook), defaulting to desktop mode.

## Recipe: Responsive Blade with Mobile Card Layout

```vue
<script setup lang="ts">
import { useResponsive, useBlade } from "@vc-shell/framework";

const { isMobile, isDesktop } = useResponsive();
const { openBlade } = useBlade();
</script>

<template>
  <VcBlade title="Products">
    <VcDataTable
      :items="products"
      :total-count="totalCount"
      @row-click="({ data }) => openBlade({ name: 'ProductDetails', param: data.id })"
    >
      <VcColumn
        id="image"
        title=""
        type="image"
        :width="60"
        :always-visible="true"
        mobile-role="image"
      />
      <VcColumn
        id="name"
        :title="t('NAME')"
        :sortable="true"
        :always-visible="true"
        mobile-role="title"
      />
      <!-- Extra columns visible only on desktop -->
      <VcColumn id="sku" :title="t('SKU')" :sortable="true" />
      <VcColumn id="price" :title="t('PRICE')" type="money" :sortable="true" />
      <VcColumn id="createdDate" :title="t('DATE')" type="date-ago" :sortable="true" />
    </VcDataTable>
  </VcBlade>
</template>
```

## Recipe: Touch-Aware Drag and Drop

```vue
<script setup lang="ts">
import { useResponsive } from "@vc-shell/framework";

const { isTouch } = useResponsive();
</script>

<template>
  <VcDataTable
    :items="items"
    :reorderable-rows="!isTouch"
    @reorder="onReorder"
  >
    <!-- columns -->
  </VcDataTable>
</template>
```

## Common Mistakes

**Wrong: using `$isMobile.value` in template (deprecated)**
```vue
<template>
  <!-- $isMobile is a global property — requires .value, no auto-unwrap -->
  <div v-if="$isMobile.value">Mobile</div>
</template>
```

**Correct: using `useResponsive()` destructure**
```vue
<script setup lang="ts">
import { useResponsive } from "@vc-shell/framework";
const { isMobile } = useResponsive();
</script>
<template>
  <!-- Vue auto-unwraps refs from script setup — clean and type-safe -->
  <div v-if="isMobile">Mobile</div>
</template>
```

---

**Wrong: using `inject(IsMobileKey)` directly**
```vue
<script setup lang="ts">
import { inject, ref } from "vue";
import { IsMobileKey } from "@vc-shell/framework";
// Verbose, requires importing both inject and the key
const isMobile = inject(IsMobileKey, ref(false));
</script>
```

**Correct: using `useResponsive()`**
```vue
<script setup lang="ts">
import { useResponsive } from "@vc-shell/framework";
// One import, one line, all breakpoints available
const { isMobile } = useResponsive();
</script>
```

## Tips

- **Destructure only what you need.** `const { isMobile } = useResponsive()` is fine — unused refs have no overhead since they already exist at the app level.
- **Prefer CSS breakpoints for styling.** Use `useResponsive()` for structural changes (different component trees), but for spacing/sizing tweaks use Tailwind responsive prefixes (`md:tw-px-4`).
- **`isTouch` is not reactive.** It's determined once at app startup based on `ontouchstart` / `maxTouchPoints`. It won't change if a user connects a mouse to a tablet mid-session.
- **Works in tests without providers.** Defaults to desktop mode (`isDesktop: true`, `isMobile: false`), so most component tests don't need to provide breakpoint keys unless testing mobile-specific behavior.

## Migration

See [migration guide #36](../../../../migration/36-use-responsive.md) for automated codemod and manual migration instructions.

## Related

- `VcApp` — provides the breakpoint refs that `useResponsive()` reads
- `VcBlade` — uses `isMobile` internally for mobile blade layout
- `VcDataTable` — uses `isMobile` for mobile card rendering and pull-to-refresh
