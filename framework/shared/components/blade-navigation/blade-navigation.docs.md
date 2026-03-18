# BladeNavigation

The core navigation system for the vc-shell admin UI. Manages a horizontal stack of blade panels (similar to the Azure Portal pattern) with routing, breadcrumbs, and parent-child messaging. BladeNavigation is the centerpiece of the vc-shell architecture -- every admin screen is rendered as a blade within this system, and all navigation happens by pushing, popping, or replacing blades in the stack.

## When to Use

- Automatically used as the top-level navigation container in every vc-shell application
- You do not instantiate this directly; it is installed as a plugin and rendered by the app shell
- Interact with the blade stack through `useBladeContext()` or `useBladeStack()`

## Architecture

```
VcBladeNavigation
  +-- VcBladeSlot (per blade in stack)
       +-- VcBlade (the actual blade chrome: toolbar, header, content)
            +-- Widgets sidebar
            +-- Content area (your blade component)
```

### Key Composables

| Composable | Purpose |
|------------|---------|
| `useBladeStack` | Low-level stack state: push, pop, replace blades |
| `useBladeMessaging` | Parent-child messaging between blades (`callParent`, `onParentCall`) |
| `useBladeNavigationAdapter` | Legacy adapter bridging old blade API to the new stack |

## Key Components

| Component | Description |
|-----------|-------------|
| `VcBladeNavigation` | Root container rendering the blade stack with mobile back-button support |
| `VcBladeSlot` | Wrapper for each blade handling visibility, expand/collapse, and breadcrumbs |
| `VcBladeView` | Render function resolving a blade component from the blade registry |

## Recipe: Opening a Child Blade from a Parent

The most common navigation pattern is opening a detail blade from a list blade:

```vue
<script setup lang="ts">
// ListBlade.vue
import { useBladeContext } from "@vc-shell/framework";

const { openBlade, closeSelf } = useBladeContext();

function openDetail(itemId: string) {
  openBlade({
    name: "ItemDetail",
    props: { itemId },
    onClose: (result) => {
      if (result?.saved) {
        reloadList();
      }
    },
  });
}
</script>
```

```vue
<script setup lang="ts">
// DetailBlade.vue
import { useBladeContext } from "@vc-shell/framework";

const { closeSelf, callParent } = useBladeContext();

async function save() {
  await api.save(item.value);
  closeSelf({ saved: true });
}
</script>
```

## Recipe: Before-Close Guard for Unsaved Changes

Prevent a blade from closing when there are unsaved changes:

```vue
<script setup lang="ts">
import { useBladeContext, useModificationTracker, usePopup } from "@vc-shell/framework";

const { currentValue, isModified } = useModificationTracker(apiData);
const { showConfirmation } = usePopup();
const { onBeforeClose } = useBladeContext();

onBeforeClose(async () => {
  if (isModified.value) {
    const confirmed = await showConfirmation("Discard unsaved changes?");
    return confirmed; // return false to prevent closing
  }
  return true;
});
</script>
```

## Features

- **Stacked panel navigation** with expand/collapse -- each blade can be expanded to full width or collapsed to show only its title
- **URL synchronization** -- blade state is reflected in the URL, supporting browser back/forward and deep linking
- **Breadcrumb trail** for navigating back through the stack with a single click
- **Mobile-responsive** with back-button navigation replacing the horizontal stack on small screens
- **Before-close guards** to prevent unsaved data loss with confirmation dialogs
- **Parent-child blade communication** via the messaging system (`callParent` / `onParentCall`)
- **Blade registry** -- blades are registered by name and resolved dynamically, enabling lazy loading

## Details

- **Stack model**: Blades form a linear stack. Opening a child blade pushes it onto the stack; closing it pops it. Only the rightmost blade is fully interactive; earlier blades are collapsed but remain mounted.
- **Routing integration**: The blade stack state is serialized into the URL path. Navigating to a URL with blade parameters restores the exact stack state.
- **Mobile behavior**: On mobile, only one blade is visible at a time. A back button in the header replaces the breadcrumb trail for navigating to the previous blade.
- **Blade descriptors**: Each blade in the stack has a descriptor object (`BladeDescriptorKey`) containing its ID, component name, props, and lifecycle hooks.

## Tips

- Always use `openBlade` from `useBladeContext()` rather than directly manipulating the blade stack. The context API handles parent-child relationships, URL updates, and lifecycle hooks.
- Use the `onClose` callback when opening a blade to react to the child blade closing (e.g., reload data if the child saved changes).
- Blades remain mounted when collapsed. Use `onBeforeClose` guards to clean up resources or prompt for unsaved changes.
- For cross-blade communication beyond parent-child, consider using a shared composable or service rather than deeply nesting `callParent` chains.

## Related Components

- **VcBlade** - Individual blade panel (toolbar, header, scrollable content)
- **useBlade / useBladeContext** - Composables for opening child blades and blade lifecycle
- **VcApp** - The application shell that hosts blade navigation
- **defineBladeContext** - Expose blade data to descendant widgets
