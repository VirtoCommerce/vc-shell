# 13. Widget System

## What Changed

| Old | New |
|-----|-----|
| `registerWidget()` + `unregisterWidget()` + manual `onUnmounted` | `useBladeWidgets([...])` — auto lifecycle |
| `useBlade().id` for blade ID | Auto-detected from context |
| Widget `.vue` files for standard sidebar items | Headless config objects |
| `defineExpose({ updateFn })` + `updateFunctionName` | `onRefresh` callback |
| `useWidgets()` | Internal API (deprecated re-export) |

## Backward Compatibility

Old `registerWidget()` + `unregisterWidget()` continue to work. Migration is gradual.

## Migration

**Before:**
```typescript
const { registerWidget, unregisterWidget } = useWidgets();
const { id: bladeId } = useBlade();

registerWidget({ id: "OffersWidget", component: OffersWidget, props: { item },
  updateFunctionName: "updateCount" }, bladeId.value);

onUnmounted(() => { unregisterWidget("OffersWidget", bladeId.value); });
```

**After:**
```typescript
import { useBladeWidgets } from "@vc-shell/framework";

const { refresh, refreshAll } = useBladeWidgets([
  {
    id: "OffersWidget",
    icon: "lucide-tag",
    title: "PRODUCTS.WIDGETS.OFFERS.TITLE",
    badge: offersCount,
    loading: offersLoading,
    isVisible: computed(() => !!props.param),
    onClick: () => openBlade({ name: "OffersList" }),
    onRefresh: loadOffers,
  },
]);

// After save
async function reload() {
  await fetchProduct();
  refreshAll();
}
```

## External Widget Context

**Before:**
```typescript
const { provideBladeData } = useBlade();
provideBladeData(computed(() => ({ id: item.value?.id })));
// Widget: const props = defineProps<{ id: string }>();
```

**After:**
```typescript
// Blade side
import { defineBladeContext } from "@vc-shell/framework";
defineBladeContext({ item });

// Widget side
import { injectBladeContext } from "@vc-shell/framework";
const ctx = injectBladeContext();
const bladeItem = computed(() => ctx.value.item);
```

## How to Find
```bash
grep -rn "registerWidget\|unregisterWidget\|useWidgets\|updateFunctionName\|provideBladeData" src/
```
