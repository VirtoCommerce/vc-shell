---
id: framework-usePopup
type: API
complexity: MODERATE
category: framework
tags: [composable, framework]
critical: true
title: "usePopup"
description: "usePopup composable API"
---

# usePopup - Show Confirmation

**Capability:** `confirmation-dialog`
**When to use:** Confirm destructive actions (delete, discard changes)
**Source:** `apps/vendor-portal/src/modules/offers/pages/offers-list.vue`

---

## Description

Shows a confirmation dialog for destructive operations. Returns `true` if user confirms, `false` if cancelled. Framework provides consistent modal styling.

---

## Required Imports

```typescript
import { usePopup } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
```

---

## Complete Example (from vendor-portal)

```vue
<script setup lang="ts">
import { usePopup, notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });

// Confirm before delete
async function onDelete(item: { id: string }) {
  // Show confirmation dialog
  const confirmed = await showConfirmation(
    t("OFFERS.PAGES.ALERTS.DELETE_CONFIRMATION")
  );

  if (!confirmed) {
    return;  // User cancelled
  }

  try {
    await deleteItem(item.id);
    notification.success(t("COMMON.DELETE_SUCCESS"));
  } catch (error) {
    notification.error(t("COMMON.DELETE_ERROR"));
  }
}

// Confirm before discarding changes
async function onClose() {
  if (modified.value) {
    const confirmed = await showConfirmation(
      t("COMMON.UNSAVED_CHANGES")
    );

    if (!confirmed) {
      return;  // Stay on blade
    }
  }

  emit("close:blade");
}

// Bulk delete with confirmation
async function onBulkDelete(ids: string[]) {
  const confirmed = await showConfirmation(
    t("COMMON.CONFIRM_DELETE_MULTIPLE", { count: ids.length })
  );

  if (confirmed) {
    await deleteMultiple(ids);
    notification.success(t("COMMON.DELETE_SUCCESS"));
  }
}
</script>
```

---

## Usage Patterns

### Pattern 1: Simple Delete Confirmation
```typescript
const { showConfirmation } = usePopup();

async function onDelete() {
  if (await showConfirmation("Are you sure you want to delete this item?")) {
    await deleteItem();
    notification.success("Item deleted");
  }
}
```

### Pattern 2: With i18n (Recommended)
```typescript
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });

async function onDelete() {
  const confirmed = await showConfirmation(
    t("COMMON.CONFIRM_DELETE")
  );

  if (confirmed) {
    await deleteItem();
  }
}
```

### Pattern 3: Unsaved Changes Warning
```typescript
async function onClose() {
  if (modified.value) {
    const shouldClose = await showConfirmation(
      t("COMMON.UNSAVED_CHANGES_PROMPT")
    );

    if (!shouldClose) return;
  }

  emit("close:blade");
}
```

### Pattern 4: With onBeforeClose Hook
```typescript
import { onBeforeClose, usePopup } from "@vc-shell/framework";

const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    return await showConfirmation(
      t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION")
    );
  }
});
```

---

## Related APIs

- **showError()** - Show error message popup
- **notification** - Toast notifications (non-blocking)
- **onBeforeClose()** - Blade close interceptor

---

## Important Notes

1. ✅ **Returns Promise<boolean>** - true = confirmed, false = cancelled
2. ✅ **Always await** - Don't forget async/await
3. ✅ **Check result** - Handle both confirm and cancel
4. ✅ **Use i18n** - Localize all messages
5. ❌ **Don't use window.confirm()** - Use framework popup

---

## Common Mistakes

### ❌ WRONG - Not Awaiting
```typescript
// DON'T DO THIS!
function onDelete() {
  showConfirmation("Delete?");  // ❌ Not awaited!
  deleteItem();  // Always executes!
}
```

### ❌ WRONG - Using Browser Confirm
```typescript
// DON'T DO THIS!
if (window.confirm("Delete?")) {  // ❌ Browser native dialog
  deleteItem();
}
```

### ❌ WRONG - Not Checking Result
```typescript
// DON'T DO THIS!
await showConfirmation("Delete?");
deleteItem();  // ❌ Always executes even if cancelled!
```

### ✅ CORRECT
```typescript
const { showConfirmation } = usePopup();

async function onDelete() {
  const confirmed = await showConfirmation(
    t("COMMON.CONFIRM_DELETE")
  );

  if (!confirmed) {
    return;  // ✅ User cancelled
  }

  await deleteItem();  // ✅ Only executes if confirmed
}
```

---

## Real Production Examples

### From offers-list.vue (Bulk Delete)
```typescript
const { showConfirmation } = usePopup();

async function onDelete() {
  if (
    !(await showConfirmation(
      allSelected.value
        ? t("OFFERS.PAGES.ALERTS.ALL_DELETE_CONFIRMATION")
        : t("OFFERS.PAGES.ALERTS.DELETE_CONFIRMATION")
    ))
  ) {
    return;
  }

  try {
    const ids = allSelected.value ? [] : selectedOfferIds.value;
    await deleteOffers(ids);

    selectedOfferIds.value = [];
    allSelected.value = false;

    await reload();
  } catch (e) {
    console.error(e);
  }
}
```

### From offers-details.vue (Unsaved Changes)
```typescript
onBeforeClose(async () => {
  if (!isDisabled.value && modified.value && !loading.value) {
    return await showConfirmation(
      t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION")
    );
  }
});
```

### From assets handler (Image Delete)
```typescript
async remove(files: IImage) {
  if (await showConfirmation(
    t("OFFERS.PAGES.ALERTS.IMAGE_DELETE_CONFIRMATION")
  )) {
    const remainingImages = remove([files], offer.value?.images ?? []);
    offer.value.images = remainingImages.map((x) => new Image(x));
  }
}
```

---

## API Reference

```typescript
interface UsePopup {
  showConfirmation(message: string): Promise<boolean>;
  showError(message: string): Promise<void>;
}
```

### showConfirmation

```typescript
showConfirmation(message: string): Promise<boolean>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | Confirmation message to display |

**Returns:** `Promise<boolean>` - `true` if confirmed, `false` if cancelled

---

## UI Example

```
┌─────────────────────────────────────────┐
│  ⚠️  Confirmation                       │
│                                         │
│  Are you sure you want to delete       │
│  this offer?                            │
│                                         │
│          [Cancel]  [Delete]             │
└─────────────────────────────────────────┘
```

---

## Best Practices

1. **Always use i18n** - `t("MODULE.CONFIRMATION_KEY")`
2. **Await the result** - `const confirmed = await showConfirmation(...)`
3. **Check the result** - `if (!confirmed) return;`
4. **Use in onBeforeClose** - For unsaved changes
5. **Show success notification** - After confirmed action completes
6. **Handle errors** - Wrap in try-catch

---

This is the standard pattern for confirmations in VC Shell applications.
