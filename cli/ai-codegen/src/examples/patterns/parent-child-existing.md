---
id: composition-shared-parent-child-communication
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, shared, navigation]
title: "Parent Child Communication"
description: "Parent-child blade communication pattern using openBlade and parent:call event"
---

# Parent-Child Blade Communication Pattern

Establishes communication between list and details blades using VC-Shell blade navigation system.

## Description
Provides:
- `openBlade()` with lifecycle hooks (`onOpen`, `onClose`, `onBeforeClose`)
- Parent-child method calls via `parent:call` event
- `defineExpose()` for parent methods
- Selected item tracking
- Proper event emission (`close:blade`, `parent:call`)

## Usage
Use in list blades to open details blades with proper parent-child communication.

## Code

### Opening a Details Blade from List

```typescript
import { ref } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";
import EntityDetails from "./EntityDetails.vue";

const { openBlade } = useBladeNavigation();

// Track opened item
const selectedItemId = ref<string | undefined>();

// Open details blade with lifecycle hooks
function onItemClick(item: { id: string }) {
  openBlade({
    blade: EntityDetails, // ✅ Direct component reference (NO markRaw needed!)
    // OR: blade: { name: 'EntityDetails' }, // ✅ By registered name
    param: item.id,
    onOpen: () => {
      // Called when blade opens and mounts
      selectedItemId.value = item.id;
      console.log(`Details blade opened for item ${item.id}`);
    },
    onClose: () => {
      // Called when blade closes and unmounts
      selectedItemId.value = undefined;
      console.log(`Details blade closed`);
    },
  });
}

// Add new item (no param)
function onAddItem() {
  openBlade({
    blade: EntityDetails,
    onClose: () => {
      // Reload list after child closes
      load();
    },
  });
}
```

### Highlight Selected Row in List

```vue
<!-- @vue-generic {IEntity} -->
<VcTable
  :columns="columns"
  :items="items"
  :selected-item-id="selectedItemId"
  @item-click="onItemClick"
/>
```

### Parent Blade Exposing Methods

```typescript
// ParentBlade.vue (List Blade)
import { useBladeNavigation } from "@vc-shell/framework";
import EntityDetails from "./EntityDetails.vue";

const { openBlade } = useBladeNavigation();

function openChildBlade() {
  openBlade({
    blade: EntityDetails,
    param: "123"
  });
}

// ✅ Expose methods that child can call via parent:call event
defineExpose({
  reload() {
    console.log("Parent: reloading list data");
    loadEntities();
    return { status: "reloaded" };
  },
  refreshItem(itemId: string) {
    console.log("Parent: refreshing item", itemId);
    loadEntity(itemId);
    return { success: true };
  },
});
```

### Child Blade Calling Parent Methods

```typescript
// EntityDetails.vue (Child Blade)
import type { IParentCallArgs } from "@vc-shell/framework";

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const emit = defineEmits<Emits>();

// Call parent's reload method after save
async function onSave() {
  await updateEntity(entity.value);

  // ✅ CORRECT: Use parent:call event to call parent's exposed method
  emit("parent:call", {
    method: "reload", // Method name from parent's defineExpose
    callback: (result: any) => {
      console.log("Parent reload completed:", result);
    },
  });
}

// Call parent method with arguments
function refreshParent() {
  emit("parent:call", {
    method: "refreshItem",
    args: entity.value.id, // Pass arguments
    callback: (result: any) => {
      if (result?.success) {
        console.log("Parent refresh successful");
      }
    },
  });
}

// Close blade using standard event
function onCancel() {
  emit("close:blade"); // ✅ CORRECT: Standard close event
}
```

### Prevent Blade Closure (Unsaved Changes)

```typescript
import { computed, ref } from "vue";
import { useBladeNavigation, usePopup } from "@vc-shell/framework";

const { onBeforeClose } = useBladeNavigation();
const { showConfirmation } = usePopup();

const isModified = ref(false);
const loading = ref(false);

// ✅ CORRECT: onBeforeClose hook
onBeforeClose(async () => {
  if (isModified.value && !loading.value) {
    const confirmed = await showConfirmation(
      "You have unsaved changes. Are you sure you want to close?"
    );
    // Return true to PREVENT closing (user clicked "Cancel")
    // Return false to ALLOW closing (user clicked "OK")
    return !confirmed;
  }
  return false; // Allow closing if no unsaved changes
});
```

### Advanced: Pass Options to Child Blade

```typescript
// Open blade with custom options
function editItemWithContext(item: { id: string; category: string }) {
  openBlade({
    blade: EntityDetails,
    param: item.id,
    options: {
      // Additional context data
      category: item.category,
      mode: "edit",
      readOnly: false,
    },
  });
}
```

```typescript
// Child blade - receive options
interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: {
    category?: string;
    mode?: "edit" | "view";
    readOnly?: boolean;
  };
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

// Use options
onMounted(() => {
  if (props.options?.readOnly) {
    // Disable editing
  }
  if (props.options?.category) {
    // Pre-filter by category
  }
});
```

### Parent Listening to Child Calls

```typescript
// ParentBlade.vue
import { onMounted } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";

const { onParentCall, currentBladeNavigationData } = useBladeNavigation();

onMounted(() => {
  // ✅ OPTIONAL: Listen for parent:call events from children
  // This is handled automatically by the system, but you can add custom logic
  if (currentBladeNavigationData.value) {
    onParentCall((args) => {
      console.log("Child called method:", args.method);
      // Custom handling if needed
    }, currentBladeNavigationData.value.idx);
  }
});

// Expose methods for children to call
defineExpose({
  reload() {
    loadData();
    return { status: "ok" };
  },
});
```

## Important Notes

### ✅ DO (Correct Patterns)

- **Use direct component reference**: `openBlade({ blade: EntityDetails })`
- **OR use registered name**: `openBlade({ blade: { name: 'EntityDetails' } })`
- **Use parent:call event**: `emit('parent:call', { method: 'reload' })`
- **Use close:blade event**: `emit('close:blade')`
- **Use onBeforeClose hook**: `onBeforeClose(async () => { ... })`
- **Use defineExpose()**: Expose parent methods for children to call
- **Lifecycle hooks**: Use `onOpen`, `onClose` for tracking state

### ❌ DON'T (Incorrect Patterns)

- **NO markRaw()**: `openBlade({ blade: markRaw(EntityDetails) })` ❌
- **NO emit("close")**: `emit('close', { isSaved: true })` ❌ (use `emit('close:blade')`)
- **NO manual window.onbeforeunload**: Use `onBeforeClose()` hook instead
- **NO direct parent access**: Use `parent:call` event, not `getCurrentInstance().parent`
- **NO global event bus**: Use `parent:call` mechanism

## Event Flow

1. **Parent opens child**: `openBlade({ blade: ChildBlade, onOpen, onClose })`
2. **Child calls parent method**: `emit('parent:call', { method: 'reload', args?, callback? })`
3. **Parent method executes**: Method from `defineExpose()` runs
4. **Result returned to child**: Via `callback` function
5. **Child closes**: `emit('close:blade')` or user clicks close button
6. **Parent onClose hook**: Runs after child unmounts

## Type Safety

```typescript
// Parent exposed methods type
interface ParentExposed {
  reload(): { status: string };
  refreshItem(id: string): { success: boolean };
  deleteItem(id: string): Promise<void>;
}

// Use in parent:call
emit('parent:call', {
  method: 'reload', // Type-checked against ParentExposed
  callback: (result: ReturnType<ParentExposed['reload']>) => {
    console.log(result.status); // Type-safe
  }
});
```
