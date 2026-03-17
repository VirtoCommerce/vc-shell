# Headless Widgets

**Status:** Implemented
**Package:** `@vc-shell/framework`
**Since:** Stage 2 widget system

## Overview

Headless widgets allow blade-local widgets to be declared as **config objects** instead of Vue SFC components. The framework renders `<VcWidget>` directly from the config — no `.vue` file needed per widget.

This is the preferred approach for blade-local widgets (offers count, associations count, etc.) where each widget follows the same visual pattern: icon + title + badge + click handler.

External widgets from other modules (e.g., messenger widget) remain SFC-based.

## Quick Start

```ts
import { useBladeWidgets } from "@vc-shell/framework";

// Inside a blade's <script setup>
const { refreshAll } = useBladeWidgets([
  {
    id: "OffersWidget",
    icon: "lucide-tag",
    title: "PRODUCTS.WIDGETS.OFFERS.TITLE",
    badge: offersCount,           // Ref<number> — reactive badge
    onClick: () => openBlade({ name: "OffersList" }),
    onRefresh: loadOffers,
  },
  {
    id: "AssociationsWidget",
    icon: "lucide-link",
    title: "PRODUCTS.WIDGETS.ASSOCIATIONS.TITLE",
    badge: associationsCount,
    isVisible: computed(() => !isNew.value),
  },
]);
```

## API Reference

### `useBladeWidgets(widgets)`

Registers widgets for the current blade. Automatically registers on mount and unregisters on unmount. Must be called inside a blade component (requires `BladeDescriptorKey` context).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `widgets` | `HeadlessWidgetDeclaration[]` | Array of headless widget configs |

Alternatively accepts `ComponentWidgetDeclaration[]` for legacy SFC widgets.

**Returns:** `UseBladeWidgetsReturn`

| Property | Type | Description |
|----------|------|-------------|
| `refresh` | `(widgetId: string) => void` | Call `onRefresh` on a specific widget |
| `refreshAll` | `() => void` | Call `onRefresh` on all widgets that have it |

### `HeadlessWidgetDeclaration`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique widget identifier |
| `icon` | `string` | Yes | Lucide icon name (e.g. `"lucide-tag"`) |
| `title` | `string` | Yes | i18n key — translated by the framework |
| `badge` | `Ref<number \| string>` | No | Reactive badge value |
| `loading` | `Ref<boolean>` | No | Reactive loading state |
| `isVisible` | `ComputedRef<boolean> \| Ref<boolean> \| boolean` | No | Controls visibility |
| `onClick` | `() => void` | No | Click handler |
| `onRefresh` | `() => void \| Promise<void>` | No | Called by `refresh()`/`refreshAll()` |

## Architecture

### How it works

```
Blade setup                    WidgetContainer template
─────────────                  ────────────────────────
useBladeWidgets([              widget.kind === "headless"
  { id, icon, title, ... }       → <VcWidget :icon :title :value />
])                             widget.kind === "component"
  ↓                               → <component :is="widget.component" />
buildHeadlessWidget(decl)
  ↓
widgetService.registerWidget(
  { kind: "headless", headless: { icon, badge, ... } }
)
```

1. `useBladeWidgets` builds an `IWidget` object from your declaration
2. Sets `kind: "headless"` and groups icon/badge/loading/onClick into `headless` field
3. If `onRefresh` is provided, also wires it as `trigger.onRefresh`
4. Registers the widget in `WidgetService` for the current blade
5. `WidgetContainerDesktop`/`Mobile` reads widgets and branches on `kind`:
   - `"headless"` → renders `<VcWidget>` with props from `widget.headless`
   - `"component"` → renders `<component :is>` as before

### The `kind` field

`IWidget.kind` is an explicit discriminant (`"headless" | "component"`) used in templates:

```vue
<VcWidget v-if="widget.kind === 'headless'" ... />
<component v-else :is="widget.component" ... />
```

It could be inferred from the presence of `widget.headless` vs `widget.component`, but the explicit field provides:
- **Readability** — template intent is immediately clear
- **Safety** — no ambiguity if both fields are somehow present
- **Extensibility** — new kinds can be added without breaking existing checks

The field is auto-injected by the framework. You never set `kind` in your declarations — `useBladeWidgets` and `registerWidget` handle it.

### Widget title translation

Headless widget `title` is an **i18n key** (e.g. `"PRODUCTS.WIDGETS.OFFERS.TITLE"`). The framework calls `t(title)` when rendering. Component-based widgets handle their own translation internally.

### Widget ordering

In a blade, widgets appear in this order:
1. Blade-local widgets (headless or component) — in declaration order
2. External widgets — appended after local widgets

## Patterns

### Widget composable per module

For blades with multiple widgets, extract logic into a `widgets/` folder:

```
modules/products/
  composables/
    widgets/
      useOfferCount.ts        # API call + count ref
      useProductWidgets.ts    # combines all widgets
  components/
    ProductDetailsBase.vue    # calls useProductWidgets()
```

```ts
// useProductWidgets.ts
import { useBladeWidgets } from "@vc-shell/framework";
import { useOfferCount } from "./useOfferCount";

interface UseProductWidgetsOptions {
  item: Ref<SellerProduct>;
  disabled: ComputedRef<boolean>;
  openBlade: OpenBladeFn;
  isVisible: ComputedRef<boolean>;
}

export function useProductWidgets(options: UseProductWidgetsOptions) {
  const { item, disabled, openBlade, isVisible } = options;
  const { count: offersCount, refresh: refreshOffers } = useOfferCount(item);

  return useBladeWidgets([
    {
      id: "OffersWidget",
      icon: "lucide-tag",
      title: "PRODUCTS.WIDGETS.OFFERS.TITLE",
      badge: offersCount,
      onRefresh: refreshOffers,
      onClick: () => openBlade({ name: "OffersList" }),
      isVisible,
    },
  ]);
}
```

```ts
// ProductDetailsBase.vue
const { refreshAll } = useProductWidgets({
  item,
  disabled,
  openBlade,
  isVisible: computed(() => !isNew.value),
});
```

### Conditional visibility

```ts
useBladeWidgets([
  {
    id: "VideosWidget",
    icon: "lucide-video",
    title: "PRODUCTS.WIDGETS.VIDEOS.TITLE",
    badge: videoCount,
    isVisible: computed(() => hasRole("video-editor") && !isNew.value),
  },
]);
```

### Refreshing widgets after data reload

```ts
const { refreshAll } = useBladeWidgets([...]);

async function save() {
  await saveProduct();
  refreshAll(); // triggers onRefresh on all widgets that defined it
}
```

### Widget without click handler

Some widgets are display-only (no blade to open):

```ts
{
  id: "StatusWidget",
  icon: "lucide-info",
  title: "PRODUCTS.WIDGETS.STATUS.TITLE",
  badge: computed(() => product.value.status),
  // no onClick — widget renders but is not clickable
}
```

## Comparison: Headless vs Component Widgets

| | Headless | Component (SFC) |
|---|---|---|
| **Declaration** | Config object in `useBladeWidgets([...])` | `.vue` file + import |
| **Rendering** | Framework renders `<VcWidget>` | Widget renders own template |
| **Logic location** | Composable in `widgets/` folder | Inside `.vue` file |
| **Use case** | Blade-local, standard VcWidget visual | External modules, custom UI |
| **i18n** | Framework translates title key | Widget handles own translation |
| **Registration** | `useBladeWidgets([...])` | `registerExternalWidget(...)` |

## Exports

All public API is available from `@vc-shell/framework`:

```ts
import {
  useBladeWidgets,
  type HeadlessWidgetDeclaration,
  type ComponentWidgetDeclaration,
  type WidgetDeclaration,        // deprecated alias for ComponentWidgetDeclaration
  type UseBladeWidgetsReturn,
} from "@vc-shell/framework";
```
