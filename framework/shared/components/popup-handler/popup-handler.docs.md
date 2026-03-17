# PopupHandler

A global popup management system that renders modal dialogs on demand. Installed as a Vue plugin (`VcPopupHandler`), it provides the `usePopup` composable for programmatic popup control.

## When to Use

- To show confirmation dialogs before destructive actions
- To display error or info messages in a modal overlay
- To open custom popup components with typed props and emits

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

## Key Parts

| Export | Description |
|--------|-------------|
| `VcPopupHandler` | Vue plugin that installs the popup registry |
| `VcPopupContainer` | Renders all active popups (placed once in the app root) |
| `usePopup` | Composable for opening/closing popups |

## Related Components

- **VcPopup** - The default popup shell component (header, content, actions)
- **VcBlade** - For panel-based UI; use popups for modal interruptions
