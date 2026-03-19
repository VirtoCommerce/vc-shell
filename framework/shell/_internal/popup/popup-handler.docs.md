# PopupHandler

A global popup management system that renders modal dialogs on demand. Installed as a Vue plugin (`VcPopupHandler`), it provides the `usePopup` composable for programmatic popup control. Popups are rendered in a dedicated container at the app root level, ensuring they overlay all other content including blades and sidebars.

The system supports both built-in dialog types (confirmation, error, info) and fully custom popup components with typed props and emits.

## When to Use

- To show confirmation dialogs before destructive actions (delete, discard, bulk operations)
- To display error or info messages in a modal overlay
- To open custom popup components with typed props and emits
- Do NOT use for passive feedback (use `notification()` toast instead)
- Do NOT use for navigation (use blade navigation instead)

## Basic Usage

```ts
import { usePopup } from "@vc-shell/framework";

const { showConfirmation, showError, showInfo } = usePopup();

// Confirmation dialog (returns Promise<boolean>)
const confirmed = await showConfirmation("Delete this item?");

// Error popup
showError("Something went wrong.");

// Info popup
showInfo("Operation completed successfully.");
```

### Custom Popup Component

```ts
import { usePopup } from "@vc-shell/framework";
import MyDialog from "./MyDialog.vue";

const { open, close } = usePopup({
  component: MyDialog,
  props: { title: "Custom Dialog" },
  emits: { onConfirm: () => close() },
});

open();
```

## API (`usePopup`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `() => void` | Push the popup onto the stack and render it |
| `close` | `() => void` | Remove the popup from the stack |
| `showConfirmation` | `(message: string \| Ref<string>) => Promise<boolean>` | Warning dialog with confirm/cancel |
| `showError` | `(message: string \| Ref<string>) => void` | Error-styled popup |
| `showInfo` | `(message: string \| Ref<string>) => void` | Info-styled popup |

## Recipe: Delete Confirmation Before API Call

The most common popup pattern is asking for confirmation before a destructive action:

```vue
<script setup lang="ts">
import { usePopup, notification } from "@vc-shell/framework";

const { showConfirmation } = usePopup();

async function deleteProduct(id: string) {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this product? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    await api.deleteProduct(id);
    notification("Product deleted.", { type: "success" });
    closeSelf();
  } catch (error) {
    showError(error.message || "Failed to delete product.");
  }
}
</script>
```

## Recipe: Custom Popup with Form

Create a custom popup component for complex interactions:

```ts
// Using a custom popup component
import { usePopup } from "@vc-shell/framework";
import AddNotePopup from "./AddNotePopup.vue";

const { open, close } = usePopup({
  component: AddNotePopup,
  props: { entityId: "prod-1" },
  emits: {
    onConfirm: async (note: string) => {
      await api.addNote(entityId, note);
      close();
      notification("Note added.", { type: "success" });
    },
    onCancel: () => close(),
  },
});

open();
```

## Key Parts

| Export | Description |
|--------|-------------|
| `VcPopupHandler` | Vue plugin that installs the popup registry |
| `VcPopupContainer` | Renders all active popups (placed once in the app root) |
| `usePopup` | Composable for opening/closing popups |

## Details

- **Popup stack**: Multiple popups can be open simultaneously, stacking with the most recent on top.
- **Promise-based confirmation**: `showConfirmation` returns a `Promise<boolean>` that resolves to `true` on confirm, `false` on cancel.
- **Plugin requirement**: `VcPopupHandler` must be installed as a Vue plugin, and `VcPopupContainer` must be mounted in the component tree. Both are automatically set up in the standard vc-shell app shell.

## Tips

- Always `await` the result of `showConfirmation` before proceeding with the destructive action.
- For simple yes/no questions, use `showConfirmation`. For forms or complex interactions, create a custom popup component.
- The `usePopup` composable can be called without arguments (for built-in dialogs) or with a component config (for custom popups).
- Avoid nesting popups more than 2 levels deep. Consider blades for complex multi-step workflows.

## Related Components

- **VcPopup** - The default popup shell component (header, content, actions)
- **VcBlade** - For panel-based UI; use popups for modal interruptions
- **notification()** - For passive, non-blocking feedback
