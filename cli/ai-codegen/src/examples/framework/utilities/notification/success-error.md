---
id: framework-notification
type: API
complexity: SIMPLE
category: framework
tags: [utility, framework]
title: "notification"
description: "notification utility API"
---

# notification - Success and Error Messages

**Capability:** `success-notification`, `error-notification`
**When to use:** Show user feedback after actions (save, delete, API calls)
**Source:** `apps/vendor-portal` - used throughout all modules

---

## Description

Display toast notifications for user feedback. Non-blocking messages that appear briefly and auto-dismiss. Framework provides `success`, `error`, `warning`, and `info` variants.

---

## Required Imports

```typescript
import { notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
```

---

## Complete Examples

### Example 1: Success After Save
```typescript
import { notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

async function onSave() {
  try {
    await saveItem(item.value);

    // ✅ Show success notification
    notification.success(t("COMMON.SAVE_SUCCESS"));
  } catch (error) {
    // ❌ Show error notification
    notification.error(t("COMMON.SAVE_ERROR"));
    console.error("Save error:", error);
  }
}
```

### Example 2: CRUD Operations
```typescript
import { notification } from "@vc-shell/framework";

async function onCreate() {
  try {
    const created = await createItem(newItem.value);
    notification.success("Item created successfully");
    return created;
  } catch (error) {
    notification.error("Failed to create item");
    throw error;
  }
}

async function onUpdate() {
  try {
    await updateItem(item.value);
    notification.success("Item updated successfully");
  } catch (error) {
    notification.error("Failed to update item");
  }
}

async function onDelete() {
  try {
    await deleteItem(item.value.id);
    notification.success("Item deleted successfully");
    closeBlade();
  } catch (error) {
    notification.error("Failed to delete item");
  }
}
```

### Example 3: With Validation
```typescript
import { notification } from "@vc-shell/framework";

async function onSave() {
  // Validation before save
  if (!meta.value.valid) {
    notification.warning(t("COMMON.VALIDATION_ERRORS"));
    return;
  }

  try {
    await saveItem(item.value);
    notification.success(t("COMMON.SAVE_SUCCESS"));
  } catch (error) {
    notification.error(t("COMMON.SAVE_ERROR"));
  }
}
```

### Example 4: Different Variants
```typescript
import { notification } from "@vc-shell/framework";

// Success - Green checkmark
notification.success("Operation completed successfully");

// Error - Red X
notification.error("Operation failed");

// Warning - Yellow exclamation
notification.warning("Please review your input");

// Info - Blue info icon
notification.info("New updates available");
```

---

## Usage Patterns

### Pattern 1: Save with Feedback (Recommended)
```typescript
const { t } = useI18n({ useScope: "global" });

async function onSave() {
  try {
    if (item.value.id) {
      await updateItem(item.value);
      notification.success(t("MODULE.SAVE_SUCCESS"));
    } else {
      await createItem(item.value);
      notification.success(t("MODULE.CREATE_SUCCESS"));
    }
  } catch (error) {
    console.error("Error:", error);
    notification.error(t("MODULE.SAVE_ERROR"));
  }
}
```

### Pattern 2: Delete with Confirmation
```typescript
const { showConfirmation } = usePopup();

async function onDelete() {
  if (await showConfirmation(t("COMMON.CONFIRM_DELETE"))) {
    try {
      await deleteItem(item.value.id);
      notification.success(t("COMMON.DELETE_SUCCESS"));
      closeBlade();
    } catch (error) {
      notification.error(t("COMMON.DELETE_ERROR"));
    }
  }
}
```

### Pattern 3: Validation Warnings
```typescript
function validateAndSave() {
  // Client-side validation
  if (!item.value.name) {
    notification.warning("Name is required");
    return;
  }

  if (!item.value.price || item.value.price < 0) {
    notification.warning("Price must be a positive number");
    return;
  }

  save();
}
```

### Pattern 4: API Error with Details
```typescript
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to load data";
    notification.error(message);
    console.error("API error:", error);
  }
}
```

---

## Related APIs

- **usePopup.showConfirmation()** - Blocking confirmation dialogs
- **usePopup.showError()** - Blocking error modals
- **useI18n** - Internationalization for messages

---

## Important Notes

1. ✅ **Always use i18n** - Localize all messages
2. ✅ **Keep messages short** - One line, clear action
3. ✅ **Use in try-catch** - Show errors to user
4. ✅ **Show success** - Confirm action completed
5. ❌ **Don't overuse** - Only for important actions

---

## Common Mistakes

### ❌ WRONG - Hardcoded Strings
```typescript
// DON'T DO THIS!
notification.success("Saved!");  // ❌ Not localized
notification.error("Error");     // ❌ Too vague
```

### ❌ WRONG - No Error Handling
```typescript
// DON'T DO THIS!
async function onSave() {
  await saveItem();  // ❌ No try-catch, no feedback
}
```

### ❌ WRONG - Too Many Notifications
```typescript
// DON'T DO THIS!
notification.info("Loading...");
notification.info("Processing...");
notification.success("Done!");  // ❌ Notification spam
```

### ✅ CORRECT
```typescript
import { notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

async function onSave() {
  try {
    await saveItem(item.value);

    // ✅ Localized, clear, one notification
    notification.success(t("OFFERS.SAVE_SUCCESS"));
  } catch (error) {
    console.error("Save error:", error);

    // ✅ Show error to user
    notification.error(t("OFFERS.SAVE_ERROR"));
  }
}
```

---

## Real Production Examples

### From vendor-portal - Save Handler
```typescript
async function saveChangesAsync() {
  // Validation
  if (!meta.value.valid) {
    notification.warning(t("COMMON.VALIDATION_ERRORS"));
    return;
  }

  try {
    loading.value = true;

    // Save
    if (offer.value.id) {
      await updateOffer(offer.value);
    } else {
      const created = await createOffer(offer.value);
      offer.value = created;
    }

    // Success feedback
    notification.success(t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.SAVED"));

    modified.value = false;
  } catch (e) {
    console.error(e);
    notification.error(t("OFFERS.PAGES.DETAILS.NOTIFICATIONS.SAVE_ERROR"));
  } finally {
    loading.value = false;
  }
}
```

### From vendor-portal - Delete Handler
```typescript
async function onDelete() {
  if (
    !(await showConfirmation(
      t("OFFERS.PAGES.ALERTS.DELETE_CONFIRMATION")
    ))
  ) {
    return;
  }

  try {
    await deleteOffers(selectedOfferIds.value);

    notification.success(
      t("OFFERS.PAGES.NOTIFICATIONS.DELETED")
    );

    selectedOfferIds.value = [];
    await reload();
  } catch (e) {
    console.error(e);
    notification.error(
      t("OFFERS.PAGES.NOTIFICATIONS.DELETE_ERROR")
    );
  }
}
```

### From vendor-portal - Notification Handler (WebSocket)
```typescript
import { useNotifications, notification } from "@vc-shell/framework";

const { markAsRead, setNotificationHandler } = useNotifications(
  "OfferDeletedDomainEvent"
);

setNotificationHandler((message) => {
  if (message.title) {
    notification.success(message.title, {
      onClose() {
        markAsRead(message);
      },
    });
  }
});
```

---

## API Reference

```typescript
interface Notification {
  success(message: string, options?: NotificationOptions): void;
  error(message: string, options?: NotificationOptions): void;
  warning(message: string, options?: NotificationOptions): void;
  info(message: string, options?: NotificationOptions): void;
}

interface NotificationOptions {
  duration?: number;      // Auto-dismiss delay (ms)
  onClose?: () => void;   // Callback when dismissed
}
```

---

## Visual Examples

### Success Toast
```
┌─────────────────────────────────┐
│ ✓  Item saved successfully      │
└─────────────────────────────────┘
```

### Error Toast
```
┌─────────────────────────────────┐
│ ✗  Failed to save item          │
└─────────────────────────────────┘
```

### Warning Toast
```
┌─────────────────────────────────┐
│ ⚠  Please fill all required    │
│    fields                        │
└─────────────────────────────────┘
```

---

## Best Practices

1. **Use i18n for all messages** - `t("MODULE.KEY")`
2. **Show success after actions** - Confirm completion
3. **Show errors to users** - Don't just console.error
4. **Keep messages concise** - One line if possible
5. **Use appropriate variant** - success/error/warning/info
6. **Always try-catch async** - Handle API errors
7. **Console.error for debugging** - In addition to notification

---

## When to Use Each Variant

| Variant | Use Case | Example |
|---------|----------|---------|
| `success` | Action completed | Save, delete, create |
| `error` | Action failed | API error, save failed |
| `warning` | User input issue | Validation error, missing field |
| `info` | Informational | New updates, tips |

---

This is the standard pattern for user feedback in VC Shell applications.
