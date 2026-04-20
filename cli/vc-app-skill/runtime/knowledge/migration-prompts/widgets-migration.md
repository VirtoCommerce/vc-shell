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
import ChildListWidget from "../widgets/ChildListWidget.vue";

const { registerWidget, clearBladeWidgets } = useWidgets();
const { openBlade } = useBlade();

onMounted(() => {
  registerWidget(
    {
      id: "ChildListWidget",
      component: ChildListWidget,
      props: {
        count: childCount,
        onClick: () => openBlade({ name: "ChildEntityList", options: { entityId: entity.value.id } }),
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
// widgets/useEntityWidgets.ts
import { useBladeWidgets, useBlade } from "@vc-shell/framework";
import type { UseBladeWidgetsReturn } from "@vc-shell/framework";
import { computed, type Ref } from "vue";

interface UseEntityWidgetsOptions {
  item: Ref<Entity | undefined>;
  isVisible: Ref<boolean> | boolean;
  childCount: Ref<number>;
}

export function useEntityWidgets(options: UseEntityWidgetsOptions): UseBladeWidgetsReturn {
  const { item, isVisible, childCount } = options;
  const { openBlade } = useBlade();

  return useBladeWidgets([
    {
      id: "ChildListWidget",
      icon: "lucide-tag",
      title: "MODULE.WIDGETS.CHILD_LIST.TITLE",
      badge: computed(() => childCount.value),
      isVisible,
      onClick: () =>
        openBlade({
          name: "ChildEntityList",
          options: { entityId: item.value?.id },
        }),
      onRefresh: async () => {
        // load child count logic here
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
import ChildListWidget from "../widgets/ChildListWidget.vue";
import RelatedItemsWidget from "../widgets/RelatedItemsWidget.vue";

const { registerWidget, clearBladeWidgets } = useWidgets();

onMounted(() => {
  registerWidget({ id: "ChildListWidget", component: ChildListWidget, props: { ... } }, bladeId);
  registerWidget({ id: "RelatedItemsWidget", component: RelatedItemsWidget, props: { ... } }, bladeId);
});

onUnmounted(() => {
  clearBladeWidgets(bladeId);
});
```

**AFTER:**

```typescript
// XxxDetails.vue <script setup>
import { useEntityWidgets } from "../widgets/useEntityWidgets";

const isExisting = computed(() => !!param.value);

const { refreshAll } = useEntityWidgets({
  item: entity,
  isVisible: isExisting,
  childCount,
});
```

If the old code used `updateActiveWidget()`, replace it with `refreshAll()` from the widget composable return:

```typescript
// BEFORE
const { updateActiveWidget } = useWidgets();
updateActiveWidget();

// AFTER
const { refreshAll } = useEntityWidgets({ item: entity, isVisible: isExisting, childCount });
refreshAll();
```

## RULE 3: Remove Widget .vue Components

Delete widget `.vue` files that only render a standard sidebar item (icon + title + badge + click handler). These are replaced by the declarative config in `useBladeWidgets()`.

**Keep** the `.vue` component only if it has custom rendering beyond the standard widget layout.

**Delete:**

- `widgets/ChildListWidget.vue` (if it only shows icon, title, badge, click)
- `widgets/RelatedItemsWidget.vue` (same)

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
import ChildListWidget from "../widgets/ChildListWidget.vue"; // deleted component
```

## RULE 5: `defineBladeContext` only for external widgets

Do not add `defineBladeContext()` by default in this migration.

Add it only if the blade hosts external widget components that use `injectBladeContext()`.

## Verification

After migration:

1. Run `npx tsc --noEmit` to verify no TypeScript errors
2. Confirm widgets appear in the blade sidebar
3. Confirm badge counts update reactively
4. Confirm clicking a widget opens the correct child blade
5. Confirm widgets are hidden when `isVisible` is false (e.g., on "create new" blades)
6. Confirm no console errors about widget registration/cleanup on blade close
7. Confirm `updateActiveWidget()` calls are removed and replaced with `refreshAll()` from `useEntityWidgets` return
