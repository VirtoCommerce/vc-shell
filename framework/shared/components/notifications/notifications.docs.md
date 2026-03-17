# Notifications

A toast notification system for displaying transient success, error, warning, and informational messages. Notifications appear at configurable screen positions and auto-dismiss after a timeout.

## When to Use

- To confirm a successful operation (save, delete, update)
- To surface errors or warnings without blocking the UI
- When you need non-modal, auto-dismissing feedback

## Basic Usage

```ts
import { notification } from "@vc-shell/framework";

// Simple text notification
notification("Item saved successfully.");

// Typed notification with options
notification("Failed to save item.", {
  type: "error",
  timeout: 5000,
});

// Warning with custom position
notification("Unsaved changes will be lost.", {
  type: "warning",
  position: "top-center",
});
```

## API (`notification`)

```ts
notification(content: string | VNode, options?: NotificationOptions): string | number
```

Returns the notification ID (useful for programmatic updates or removal).

## NotificationOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `"success" \| "error" \| "warning" \| "default"` | `"default"` | Visual style |
| `timeout` | `number \| boolean` | - | Auto-dismiss delay in ms, or `false` to persist |
| `position` | `NotificationPosition` | `"top-right"` | Screen placement |
| `pauseOnHover` | `boolean` | - | Pause auto-dismiss timer on hover |
| `payload` | `string \| Record<string, any>` | - | Custom data attached to the notification |
| `onOpen` | `(payload) => void` | - | Callback when the notification appears |
| `onClose` | `(payload) => void` | - | Callback when the notification is dismissed |

## Key Parts

| Export | Description |
|--------|-------------|
| `notification` | Factory function to create and show a notification |
| `useContainer` | Composable managing the notification container state |
| `useInstance` | Composable for individual notification instance lifecycle |

## Related Components

- **VcToast** - The visual toast component rendered for each notification
- **usePopup** - For modal dialogs that require user action; use notifications for passive feedback
