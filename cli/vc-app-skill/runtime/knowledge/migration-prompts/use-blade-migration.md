---
name: use-blade-migration
description: AI transformation rules for useBladeNavigation → useBlade, resolveBladeByName removal, onParentCall → callParent.
---

# Blade Navigation Migration: useBladeNavigation → useBlade

Replace `useBladeNavigation()`, `useBladeContext()`, `resolveBladeByName()`, and `onParentCall()` with the unified `useBlade()` composable.

## RULE 1: Replace useBladeNavigation / useBladeContext with useBlade

Rename the import and call site. Merge destructured properties from both into a single `useBlade()` call.

**BEFORE:**

```typescript
import { useBladeNavigation } from "@vc-shell/framework";
const { openBlade, resolveBladeByName, onBeforeClose } = useBladeNavigation();
```

**AFTER:**

```typescript
import { useBlade } from "@vc-shell/framework";
const { openBlade, onBeforeClose } = useBlade();
```

If both `useBladeNavigation()` and `useBladeContext()` are used, merge into one `useBlade()`:

**BEFORE:**

```typescript
const blade = useBlade();
const { openBlade, onBeforeClose } = useBladeNavigation();
registerWidget(myWidget, blade?.value.id ?? "");
```

**AFTER:**

```typescript
const { id: bladeId, openBlade, onBeforeClose } = useBlade();
registerWidget(myWidget, bladeId.value);
```

## RULE 2: Remove resolveBladeByName

`resolveBladeByName` is no longer needed — pass the blade name directly to `openBlade`.

**BEFORE:**

```typescript
openBlade({ blade: resolveBladeByName("OrderDetails")!, param: orderId });
```

**AFTER:**

```typescript
openBlade({ name: "OrderDetails", param: orderId });
```

Also handle the pattern with options:

**BEFORE:**

```typescript
openBlade({
  blade: resolveBladeByName("ImportProcess")!,
  param: profileId,
  options: { title: profile.name, importJobId: jobId },
});
```

**AFTER:**

```typescript
openBlade({
  name: "ImportProcess",
  param: profileId,
  options: { title: profile.name, importJobId: jobId },
});
```

Remove the `resolveBladeByName` destructure from `useBlade()` since it's no longer used.

## RULE 3: Replace onParentCall with callParent

**BEFORE:**

```typescript
const { onParentCall } = useBladeNavigation();
onParentCall({ method: "reload" });
onParentCall({ method: "updateItem", args: newItem });
```

**AFTER:**

```typescript
const { callParent } = useBlade();
await callParent("reload");
await callParent("updateItem", newItem);
```

Note: `callParent` is async and returns a Promise.

## RULE 4: Invert onBeforeClose Boolean

The guard semantics are **inverted** in the new API:

| Legacy                         | New                           |
| ------------------------------ | ----------------------------- |
| `return false` → prevent close | `return true` → prevent close |
| `return true` → allow close    | `return false` → allow close  |

**BEFORE:**

```typescript
onBeforeClose(async () => {
  if (isModified.value) {
    return await showConfirmation(msg); // true = allow, false = prevent
  }
});
```

**AFTER:**

```typescript
onBeforeClose(async () => {
  if (isModified.value) {
    return !(await showConfirmation(msg)); // true = prevent, false = allow
  }
});
```

If `useBladeForm()` is used, `onBeforeClose` can be removed entirely — `useBladeForm` handles it automatically.

## RULE 5: Clean Up Unused Imports

After applying all rules, remove:

- `useBladeNavigation` import
- `useBladeContext` import
- `resolveBladeByName` import (if it was imported separately)
- Any unused destructured variables

## Verification

After migration:

1. Run `npx vue-tsc --noEmit` to verify no TypeScript errors
2. Confirm `openBlade` calls navigate correctly
3. Confirm blade close confirmation dialogs still appear when data is modified
4. Confirm no remaining imports of `useBladeNavigation`, `useBladeContext`, or `resolveBladeByName`
5. Confirm no remaining `onParentCall` calls
