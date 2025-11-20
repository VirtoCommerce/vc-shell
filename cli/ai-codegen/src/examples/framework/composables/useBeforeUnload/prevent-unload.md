---
id: framework-useBeforeUnload
type: API
complexity: MODERATE
category: framework
tags: [composable, framework]
critical: true
title: "useBeforeUnload"
description: "useBeforeUnload composable API"
---

# useBeforeUnload - Prevent Page Unload

**Capability:** `prevent-unload`
**When to use:** Warn user when leaving page with unsaved changes
**Source:** `apps/vendor-portal/src/modules/offers/pages/offers-details.vue:705`

---

## Description

Prevents accidental page close/refresh when there are unsaved changes. Shows browser's native confirmation dialog. Framework composable that automatically handles setup and cleanup.

---

## Required Imports

```typescript
import { useBeforeUnload } from "@vc-shell/framework";
import { computed } from "vue";
```

---

## Complete Example (from vendor-portal)

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useBeforeUnload } from "@vc-shell/framework";
import { useModificationTracker } from "@vc-shell/framework";

// Track form modifications
const item = ref({ name: '', price: 0 });
const { modified } = useModificationTracker(item);

// Conditionally prevent unload when modified
useBeforeUnload(computed(() => modified.value));

// That's it! Framework handles:
// - window.beforeunload event registration
// - Browser confirmation dialog
// - Cleanup on component unmount
</script>
```

---

## Usage Patterns

### Pattern 1: Simple - Always Prevent (Details Blade)
```typescript
import { useBeforeUnload } from "@vc-shell/framework";

// Always warn on page close (e.g., during loading)
useBeforeUnload();
```

### Pattern 2: Conditional - Based on Modified State
```typescript
import { computed } from "vue";
import { useBeforeUnload } from "@vc-shell/framework";

const modified = ref(false);
const loading = ref(false);

// Only prevent when modified and not loading
useBeforeUnload(computed(() => modified.value && !loading.value));
```

### Pattern 3: With useModificationTracker (Recommended)
```typescript
import { computed } from "vue";
import { useBeforeUnload, useModificationTracker } from "@vc-shell/framework";

const formData = ref({ name: '', email: '' });
const { modified } = useModificationTracker(formData);

// Automatically tracks changes and prevents unload
useBeforeUnload(computed(() => modified.value));
```

### Pattern 4: Real vendor-portal Pattern
```typescript
// From offers-details.vue:705
const { modified } = useOfferDetails();
const isDisabled = computed(() => !offer.value?.id);

// Don't prevent unload if blade is disabled (view-only mode)
useBeforeUnload(computed(() => !isDisabled.value && modified.value));
```

---

## Related APIs

- **useModificationTracker** - Track form modifications
- **onBeforeClose** - Prevent blade close (different from page close)
- **showConfirmation** - Custom confirmation dialogs

---

## Important Notes

1. ✅ **Use framework composable** - Handles cleanup automatically
2. ✅ **Pass computed()** - For reactive condition
3. ✅ **Combine with useModificationTracker** - Best practice
4. ❌ **NEVER use window.addEventListener** - Framework handles it
5. ❌ **Don't manipulate window.onbeforeunload** - Use composable

---

## Common Mistakes

### ❌ WRONG - Manual Event Listener
```typescript
// DON'T DO THIS!
window.addEventListener('beforeunload', (e) => {
  if (modified.value) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// Problems:
// - No cleanup on unmount
// - Not reactive
// - Duplicates framework logic
```

### ❌ WRONG - Non-reactive Condition
```typescript
// DON'T DO THIS!
useBeforeUnload(modified.value);  // ❌ Not reactive!
```

### ✅ CORRECT
```typescript
import { computed } from "vue";
import { useBeforeUnload } from "@vc-shell/framework";

const modified = ref(false);

// ✅ Reactive with computed()
useBeforeUnload(computed(() => modified.value));

// OR for simple cases
useBeforeUnload();  // ✅ Always prevent
```

---

## Complete Real-World Example

From `apps/vendor-portal/src/modules/offers/pages/offers-details.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import {
  useBeforeUnload,
  useModificationTracker,
  onBeforeClose,
  usePopup,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
const { showConfirmation } = usePopup();

// Composable provides modification tracking
const { offer, modified, loading } = useOfferDetails();

// Determine if blade is in read-only mode
const isDisabled = computed(() => !offer.value?.id);

// 1. Prevent page unload (browser refresh/close)
useBeforeUnload(computed(() => !isDisabled.value && modified.value));

// 2. Prevent blade close (within app navigation)
onBeforeClose(async () => {
  if (!isDisabled.value && modified.value && !loading.value) {
    return await showConfirmation(t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
});

// Framework automatically:
// - Registers window.beforeunload event
// - Shows browser's native confirmation
// - Cleans up on component unmount
</script>
```

---

## Browser Behavior

When user tries to leave page:

**With unsaved changes:**
```
Browser shows native dialog:
┌─────────────────────────────────────┐
│  Leave site?                        │
│  Changes you made may not be saved  │
│                                     │
│  [Leave]  [Stay]                    │
└─────────────────────────────────────┘
```

**Without unsaved changes:**
- Page closes immediately
- No dialog shown

---

## API Reference

```typescript
function useBeforeUnload(condition?: Ref<boolean> | ComputedRef<boolean>): void
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `condition` | `Ref<boolean> \| ComputedRef<boolean>` | No | Reactive condition. If omitted, always prevents unload. |

**Returns:** `void`

---

## Best Practices

1. **Always use computed()** for reactive conditions
2. **Combine with useModificationTracker** for forms
3. **Consider disabled/readonly state** - don't prevent in view-only mode
4. **Pair with onBeforeClose()** - handle both page and blade close
5. **Let framework handle cleanup** - no manual removeEventListener needed

---

This is the recommended VC Shell pattern for preventing data loss on page close.
