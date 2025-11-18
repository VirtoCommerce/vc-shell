# Parent-Child Blade Communication Pattern

Establishes communication between list and details blades.

## Description
Provides:
- openBlade with callbacks
- Parent state tracking (selectedItemId)
- Child close events
- Parent refresh on child save

## Usage
Use in list blades to open details blades with proper communication.

## Code

```typescript
import { ref } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";
import { markRaw } from "vue";

// Import details blade
import EntityDetails from "./EntityDetails.vue";

const { openBlade } = useBladeNavigation();

// Track opened item
const selectedItemId = ref<string | undefined>();

// Open details blade with callbacks
function onItemClick(item: { id: string }) {
  openBlade({
    blade: markRaw(EntityDetails),
    param: item.id,
    onOpen: () => {
      // Called when blade opens
      selectedItemId.value = item.id;
    },
    onClose: (result?: { isSaved?: boolean }) => {
      // Called when blade closes
      selectedItemId.value = undefined;

      // Reload list if item was saved
      if (result?.isSaved) {
        load();
      }
    },
  });
}

// Add new item
function onAddItem() {
  openBlade({
    blade: markRaw(EntityDetails),
    // No param = new item
    onClose: (result?: { isSaved?: boolean; newItemId?: string }) => {
      if (result?.isSaved) {
        load();

        // Optionally open the newly created item
        if (result.newItemId) {
          openBlade({
            blade: markRaw(EntityDetails),
            param: result.newItemId,
          });
        }
      }
    },
  });
}
```

```vue
<!-- Highlight selected row in list -->
<VcTable
  :columns="columns"
  :items="items"
  :selected-item-id="selectedItemId"
  @item-click="onItemClick"
>
</VcTable>
```

```typescript
// In details blade - emit close with result
async function onSaveAndClose() {
  await onSave();
  if (!loading.value) {
    emit("close", {
      isSaved: true,
      newItemId: props.param ? undefined : entity.value.id, // Return ID for new items
    });
  }
}

function onCancel() {
  emit("close", { isSaved: false });
}
```

```typescript
// Advanced: Pass data to child blade
function editItemWithContext(item: { id: string; category: string }) {
  openBlade({
    blade: markRaw(EntityDetails),
    param: item.id,
    options: {
      // Additional context
      category: item.category,
      mode: "edit",
    },
    onClose: (result) => {
      if (result?.isSaved) {
        // Update specific item in list without full reload
        const index = items.value.findIndex(i => i.id === item.id);
        if (index !== -1 && result.updatedItem) {
          items.value[index] = result.updatedItem;
        }
      }
    },
  });
}
```

```typescript
// In child blade - receive options
interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: {
    category?: string;
    mode?: "edit" | "view";
  };
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

// Use options.category for pre-filtering, etc.
```
