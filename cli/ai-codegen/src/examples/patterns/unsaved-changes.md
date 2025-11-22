---
id: unsaved-changes
type: PATTERN
complexity: MODERATE
pattern_category: details
category: lifecycle
critical: true
related_rules: ["14"]
title: "Unsaved Changes Confirmation"
description: "Use onBeforeClose hook with showConfirmation"
---

# Unsaved Changes Confirmation Pattern

## Overview

Use `onBeforeClose` hook with `showConfirmation` for blade close confirmation.

**NEVER** use manual `confirm()` in close handler!

## ✅ Correct Pattern

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <VcForm v-model="entity">
      <!-- Form fields -->
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeClose, useBeforeUnload } from '@vc-shell/framework';
import { usePopup } from '@vc-shell/framework';

const { t } = useI18n({ useScope: 'global' });
const { showConfirmation } = usePopup();

const entity = ref({ name: '', description: '' });
const modified = ref(false);
const loading = ref(false);

// ✅ Prevent browser refresh/close
useBeforeUnload(modified);

// ✅ CORRECT: Prevent blade close with async confirmation
onBeforeClose(async () => {
  // Only show confirmation if:
  // 1. There are unsaved changes (modified = true)
  // 2. Not currently saving (loading = false)
  if (modified.value && !loading.value) {
    const confirmed = await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
    // onBeforeClose return value:
    // - Return true to PREVENT closing (user clicked "Cancel")
    // - Return false to ALLOW closing (user clicked "OK")
    // showConfirmation returns true when user confirms (wants to close)
    // So we need to INVERT the value: return !confirmed
    return !confirmed;
  }

  // If no changes or currently saving:
  // Return false to allow blade to close
  return false;
});

// Track modifications
watch(entity, () => {
  modified.value = true;
}, { deep: true });

// After save, reset modified flag
async function save() {
  loading.value = true;
  try {
    await saveEntity(entity.value);
    modified.value = false;  // ← Reset flag
    emit("close:blade");     // Close blade after save
  } finally {
    loading.value = false;
  }
}
</script>
```

## How It Works

`onBeforeClose` runs **BEFORE** blade close:
- Return `true` or `undefined` → allow close
- Return `false` → prevent close
- Can be `async` → use `await` for confirmations

## ❌ Wrong Pattern

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const modified = ref(false);

// ❌ WRONG: Manual confirm() in onClose handler
function onClose() {
  if (modified.value) {
    // Synchronous confirm - blocks UI
    const confirmed = confirm(t("COMMON.UNSAVED_CHANGES"));
    if (!confirmed) {
      return;  // Stay on blade
    }
  }
  emit("close:blade");
}
// Problems:
// - confirm() is synchronous, blocks UI
// - Ugly browser dialog instead of VcModal
// - Cannot make async API calls
// - Not integrated with blade navigation
// - Poor UX
</script>
```

## Advantages of onBeforeClose

| `onBeforeClose` | Manual `confirm()` |
|-----------------|-------------------|
| ✅ Async (can make API calls) | ❌ Synchronous only |
| ✅ Beautiful UI (VcModal) | ❌ Ugly browser dialog |
| ✅ Integrated with framework | ❌ No integration |
| ✅ i18n support | ❌ Limited i18n |
| ✅ Complex logic possible | ❌ Simple boolean only |

## Complete Example with Save

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeClose, useBeforeUnload } from '@vc-shell/framework';
import { usePopup, notification } from '@vc-shell/framework';

const { t } = useI18n({ useScope: 'global' });
const { showConfirmation } = usePopup();

const entity = ref({ name: '', description: '' });
const modified = ref(false);
const loading = ref(false);

// Prevent browser unload
useBeforeUnload(modified);

// Prevent blade close with confirmation
onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    const confirmed = await showConfirmation(
      t("COMMON.UNSAVED_CHANGES"),
      t("COMMON.SAVE_OR_DISCARD")
    );

    if (!confirmed) {
      return false;  // User cancelled, stay on blade
    }

    // User confirmed, allow close
    return true;
  }
});

// Track modifications
watch(entity, () => {
  modified.value = true;
}, { deep: true });

// Save handler
async function save() {
  loading.value = true;
  try {
    await api.saveEntity(entity.value);
    modified.value = false;
    notification.success(t("COMMON.SAVED"));

    // Close blade after successful save
    emit("close:blade");
  } catch (error) {
    notification.error(t("COMMON.SAVE_ERROR"));
  } finally {
    loading.value = false;
  }
}

// Toolbar with save button
const bladeToolbar = computed(() => [
  {
    id: "save",
    title: t("COMMON.SAVE"),
    icon: "fas fa-save",
    disabled: !modified.value || loading.value,
    async clickHandler() {
      await save();
    },
  },
]);
</script>
```

## Important Notes

### Don't Manually Emit close:blade

```typescript
// ❌ WRONG: Don't emit close in the hook
onBeforeClose(async () => {
  if (modified.value) {
    const confirmed = await showConfirmation("...");
    if (confirmed) {
      emit("close:blade");  // ❌ DON'T DO THIS!
    }
    return !confirmed;
  }
});

// ✅ CORRECT: Return boolean, framework handles close
onBeforeClose(async () => {
  if (modified.value) {
    return await showConfirmation("...");
  }
});
```

### Handle Loading State

```typescript
// ✅ Don't show confirmation while saving
onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    return await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
  }
  // Allow close if saving or no changes
});
```

## When to Use

- ✅ Details/edit blades with forms
- ✅ When there might be unsaved changes
- ✅ To prevent accidental data loss

## When NOT to Use

- ❌ List blades (no unsaved changes)
- ❌ Read-only views
- ❌ After successful save (reset modified flag)

## See Also

- [Browser Unload Prevention](browser-unload-prevention.md) - Prevent browser close
- [onBeforeClose API](../framework/composables/onBeforeClose.md) - API reference
- [usePopup API](../framework/composables/usePopup.md) - Confirmation dialogs
- [Modification Tracking](../compositions/details/modified-tracking.md) - Track changes
