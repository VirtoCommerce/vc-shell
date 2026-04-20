# Blade Widget Pattern

Blade widgets are sidebar items displayed alongside a details blade. They allow navigation to related child blades (e.g., "Children of this entity", "Associated items"). Each widget shows an icon, a title, and an optional reactive badge count.

Blade widgets use `useBladeWidgets()` — the headless widget API. No `.vue` component is needed per widget; the framework renders a standard `<VcWidget>` from the config object.

> **v1 note**: The generator does not produce blade widget files. This pattern is reference-only for developers extending the generated module manually.

---

## Quick Start — Inline in a blade

For simple cases, call `useBladeWidgets()` directly inside the details blade:

```ts
import { useBladeWidgets, useBlade } from "@vc-shell/framework";
import { computed } from "vue";

const { openBlade } = useBlade();
const childCount = ref(0);

useBladeWidgets([
  {
    id: "ChildListWidget",
    icon: "lucide-tag",
    title: "MODULE.WIDGETS.CHILD_LIST.TITLE",
    badge: computed(() => childCount.value),
    isVisible: computed(() => !!param.value),   // hide on "create new"
    onClick: () => openBlade({ name: "ChildEntityList", options: { entityId: entity.value.id } }),
    onRefresh: async () => {
      childCount.value = await loadChildCount(entity.value.id);
    },
  },
]);
```

---

## Composable Pattern — Extracted widget logic

For larger modules, extract widget declarations into a dedicated composable. This keeps the blade file clean and allows the widget logic to be tested independently.

### Composable

```ts
// composables/useXxxWidgets/index.ts
import { useBladeWidgets, useBlade } from "@vc-shell/framework";
import type { UseBladeWidgetsReturn } from "@vc-shell/framework";
import { computed, type Ref } from "vue";

interface UseXxxWidgetsOptions {
  item: Ref<XxxItem | undefined>;
  isVisible: Ref<boolean> | boolean;
}

export function useXxxWidgets(options: UseXxxWidgetsOptions): UseBladeWidgetsReturn {
  const { item, isVisible } = options;
  const { openBlade } = useBlade();

  const relatedCount = computed(() => item.value?.relatedItems?.length ?? 0);

  return useBladeWidgets([
    {
      id: "RelatedItemsWidget",
      icon: "lucide-link",
      title: "XXX.WIDGETS.RELATED_ITEMS.TITLE",
      badge: relatedCount,
      isVisible,
      onClick: () => openBlade({
        name: "RelatedItemsList",
        options: { parentId: item.value?.id },
      }),
    },
  ]);
}
```

### Usage in details blade

```ts
// In XxxDetails.vue <script setup>
import { useXxxWidgets } from "../composables/useXxxWidgets";

const { entity } = useXxx();
const isExisting = computed(() => !!param.value);

const { refreshAll } = useXxxWidgets({
  item: entity,
  isVisible: isExisting,
});
```

---

## `HeadlessWidgetDeclaration` type

```ts
interface HeadlessWidgetDeclaration {
  id: string;                                              // unique within the blade
  icon: string;                                            // lucide icon name
  title: string;                                           // i18n key or plain string
  badge?: Ref<number | string> | ComputedRef<number | string>;
  loading?: Ref<boolean> | ComputedRef<boolean>;
  disabled?: Ref<boolean> | ComputedRef<boolean> | boolean;
  isVisible?: ComputedRef<boolean> | Ref<boolean> | boolean;
  onClick?: () => void;
  onRefresh?: () => void | Promise<void>;
}
```

### `useBladeWidgets()` return

```ts
interface UseBladeWidgetsReturn {
  refresh: (widgetId: string) => void;   // trigger onRefresh for one widget
  refreshAll: () => void;                // trigger onRefresh for all widgets
}
```

Call `refreshAll()` from `onMounted` or after data loads to populate badge counts.

---

## Lifecycle

`useBladeWidgets()` automatically:
- Registers all widgets with the `WidgetService` on `onMounted`
- Unregisters all widgets from the `WidgetService` on `onUnmounted`

This means `useBladeWidgets()` must be called inside a blade component rendered by `VcBladeSlot` — it requires the `BladeDescriptorKey` injection context. Calling it outside a blade throws an error.

---

## Key Rules

1. **Must be called inside a blade** — `useBladeWidgets()` requires `BladeDescriptorKey` context. Calling from a plain component (not a blade) throws.
2. **`title` is an i18n key, not a computed** — unlike toolbar items, widget `title` is a plain string (the i18n key). The framework resolves it using `t()` internally.
3. **`badge` should be a `computed` or `ref`** — reactive so the count updates when data changes.
4. **`isVisible: computed(() => !!param.value)`** — hide widgets when creating a new entity (nothing to relate yet).
5. **Use `refreshAll()`** in `onMounted` or after entity loads to fetch initial badge counts.
6. **`id` must be unique within the blade** — two widgets with the same `id` registered to the same blade will cause conflicts in the widget service.
