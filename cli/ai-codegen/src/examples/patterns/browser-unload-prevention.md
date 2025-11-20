---
id: browser-unload-prevention
type: PATTERN
complexity: MODERATE
pattern_category: details
category: lifecycle
critical: true
related_rules: ["13"]
title: "Browser Unload Prevention"
description: "Use useBeforeUnload composable, not window.onbeforeunload"
---

# Browser Unload Prevention Pattern

## Overview

Use `useBeforeUnload()` composable to prevent browser refresh/close when there are unsaved changes.

**NEVER** use `window.onbeforeunload` manually!

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
import { useBeforeUnload } from '@vc-shell/framework';

const entity = ref({ name: '', description: '' });
const modified = ref(false);
const loading = ref(false);

// ✅ CORRECT: Use useBeforeUnload composable
// Pass ref directly, NOT a function!
useBeforeUnload(modified);

// Track modifications
watch(entity, () => {
  modified.value = true;
}, { deep: true });

// After save, reset modified flag
async function save() {
  loading.value = true;
  try {
    await saveEntity(entity.value);
    modified.value = false;  // ← Reset to allow close
  } finally {
    loading.value = false;
  }
}
</script>
```

## How It Works

When `modified.value = true`:
- ✅ Framework shows browser confirmation on refresh/close
- ✅ Automatically cleaned up on component unmount
- ✅ Works with blade navigation system
- ✅ No memory leaks

## ❌ Wrong Pattern

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const modified = ref(false);

// ❌ WRONG: Manual window.onbeforeunload
watch(modified, (isModified) => {
  if (isModified) {
    window.onbeforeunload = () => t("COMMON.UNSAVED_CHANGES");
  } else {
    window.onbeforeunload = null;
  }
});
// Problems:
// - Not cleaned up on unmount → memory leak
// - Not integrated with blade system
// - Manual management required
// - Can conflict with other blades
</script>
```

## Important Notes

### Pass Ref Directly

```typescript
// ✅ CORRECT: Pass the ref
useBeforeUnload(modified);

// ❌ WRONG: Don't pass a getter function
useBeforeUnload(() => modified.value);
```

### Reset After Save

```typescript
async function save() {
  await saveEntity(entity.value);
  modified.value = false;  // ← MUST reset!
}
```

### Works with onBeforeClose

Combine with `onBeforeClose` for complete protection:

```vue
<script setup lang="ts">
import { useBeforeUnload, onBeforeClose } from '@vc-shell/framework';
import { usePopup } from '@vc-shell/framework';

const { showConfirmation } = usePopup();
const modified = ref(false);

// Prevent browser refresh/close
useBeforeUnload(modified);

// Prevent blade close
onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    return await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
  }
});
</script>
```

## When to Use

- ✅ Details/edit blades with forms
- ✅ When tracking unsaved changes
- ✅ To prevent accidental data loss

## When NOT to Use

- ❌ List blades (no unsaved changes)
- ❌ Read-only views
- ❌ Modal dialogs (use onBeforeClose instead)

## See Also

- [Unsaved Changes Pattern](unsaved-changes.md) - Complete example with both hooks
- [useBeforeUnload API](../framework/composables/useBeforeUnload.md) - API reference
- [Modification Tracking](../compositions/details/modified-tracking.md) - Track changes
