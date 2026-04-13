---
name: widgets-migration
description: AI transformation rules for useWidgets→useBladeWidgets migration.
---

# Widget Migration: useWidgets → useBladeWidgets

Migrate blade widgets from the imperative `useWidgets()` + `registerWidget()` API to the declarative `useBladeWidgets()` composable. The new API eliminates manual registration/cleanup and removes the need for per-widget `.vue` components when they only render a standard sidebar item.

## RULE 1: Create Widget Composable

For each blade that calls `registerWidget()`, create a `widgets/useXxxWidgets.ts` composable.

**BEFORE:**

```typescript
// In XxxDetails.vue <script setup>
import { useWidgets, useBlade } from "@vc-shell/framework";
import type { BladeInstance } from "@vc-shell/framework";
import { onMounted, onUnmounted } from "vue";
import OffersWidget from "../widgets/OffersWidget.vue";

const { registerWidget, clearBladeWidgets } = useWidgets();
const { openBlade } = useBlade();

onMounted(() => {
  registerWidget(
    {
      id: "OffersWidget",
      component: OffersWidget,
      props: {
        count: offersCount,
        onClick: () => openBlade({ name: "OffersList", options: { productId: entity.value.id } }),
      },
    },
    bladeContext.id,
  );
});

onUnmounted(() => {
  clearBladeWidgets(bladeContext.id);
});
```

**AFTER:**

```typescript
// widgets/useProductWidgets.ts
import { useBladeWidgets, useBlade } from "@vc-shell/framework";
import type { UseBladeWidgetsReturn } from "@vc-shell/framework";
import { computed, type Ref } from "vue";

interface UseProductWidgetsOptions {
  item: Ref<Product | undefined>;
  isVisible: Ref<boolean> | boolean;
  offersCount: Ref<number>;
}

export function useProductWidgets(options: UseProductWidgetsOptions): UseBladeWidgetsReturn {
  const { item, isVisible, offersCount } = options;
  const { openBlade } = useBlade();

  return useBladeWidgets([
    {
      id: "OffersWidget",
      icon: "lucide-tag",
      title: "PRODUCTS.WIDGETS.OFFERS.TITLE",
      badge: computed(() => offersCount.value),
      isVisible,
      onClick: () =>
        openBlade({
          name: "OffersList",
          options: { productId: item.value?.id },
        }),
      onRefresh: async () => {
        // load offers count logic here
      },
    },
  ]);
}
```

## RULE 2: Replace Usage in Blade Page

Import the new composable and destructure `{ refreshAll }`.

**BEFORE:**

```typescript
// XxxDetails.vue <script setup>
import { useWidgets } from "@vc-shell/framework";
import OffersWidget from "../widgets/OffersWidget.vue";
import AssociationsWidget from "../widgets/AssociationsWidget.vue";

const { registerWidget, clearBladeWidgets } = useWidgets();

onMounted(() => {
  registerWidget({ id: "OffersWidget", component: OffersWidget, props: { ... } }, bladeId);
  registerWidget({ id: "AssociationsWidget", component: AssociationsWidget, props: { ... } }, bladeId);
});

onUnmounted(() => {
  clearBladeWidgets(bladeId);
});
```

**AFTER:**

```typescript
// XxxDetails.vue <script setup>
import { useProductWidgets } from "../widgets/useProductWidgets";

const isExisting = computed(() => !!param.value);

const { refreshAll } = useProductWidgets({
  item: entity,
  isVisible: isExisting,
  offersCount,
});
```

## RULE 3: Remove Widget .vue Components

Delete widget `.vue` files that only render a standard sidebar item (icon + title + badge + click handler). These are replaced by the declarative config in `useBladeWidgets()`.

**Keep** the `.vue` component only if it has custom rendering beyond the standard widget layout.

**Delete:**
- `widgets/OffersWidget.vue` (if it only shows icon, title, badge, click)
- `widgets/AssociationsWidget.vue` (same)

**Keep:**
- `widgets/CustomChartWidget.vue` (has custom chart rendering)

## RULE 4: Remove Old Imports

Remove these imports that are no longer needed:

```typescript
// REMOVE all of these:
import { useWidgets } from "@vc-shell/framework";
import type { BladeInstance } from "@vc-shell/framework"; // if only used for widgets
import { registerWidget, unregisterWidget, clearBladeWidgets } from "...";
import { onUnmounted } from "vue"; // if only used for widget cleanup
import OffersWidget from "../widgets/OffersWidget.vue"; // deleted component
```

## Verification

After migration:

1. Run `npx tsc --noEmit` to verify no TypeScript errors
2. Confirm widgets appear in the blade sidebar
3. Confirm badge counts update reactively
4. Confirm clicking a widget opens the correct child blade
5. Confirm widgets are hidden when `isVisible` is false (e.g., on "create new" blades)
6. Confirm no console errors about widget registration/cleanup on blade close
