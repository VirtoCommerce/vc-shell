# 12. replaceWith / coverWith

## What Changed

| Before | After | Behavior |
|--------|-------|----------|
| `replaceWith(event)` | `replaceWith(event)` | **Changed:** Truly replaces blade — destroys old, creates new at same index |
| _(no equivalent)_ | `coverWith(event)` | **New:** Old `replaceWith` behavior — hides current blade, opens new on top |
| `openBlade({ replaceCurrentBlade: true })` | _(unchanged)_ | Legacy adapter maps to `coverCurrentBlade` |

## When to Use Which

**`replaceWith`** — True replacement (create → edit after save):
```typescript
const { replaceWith } = useBlade();
if (!props.param && order.value.id) {
  await replaceWith({ name: "OrderDetails", param: order.value.id });
}
```

**`coverWith`** — Keep old blade alive underneath (preview, sub-editing):
```typescript
const { coverWith } = useBlade();
await coverWith({ name: "OrderPreview", param: order.value.id });
```

## Migration

1. If your `replaceWith` was a true replacement (create→edit) — **no changes needed**
2. If you relied on the hidden blade staying alive — change `replaceWith` → `coverWith`
3. `openBlade({ replaceCurrentBlade: true })` — no changes needed (uses cover behavior)
