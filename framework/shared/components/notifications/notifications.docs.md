# Notifications

A toast notification system for displaying transient success, error, warning, and informational messages. Notifications appear at configurable screen positions and auto-dismiss after a timeout. This is the primary way to provide passive feedback to users after operations like saving, deleting, or updating entities.

Unlike push notifications (which persist in the notification dropdown), toast notifications are ephemeral -- they appear briefly and disappear automatically. They do not require user interaction and do not block the UI.

## When to Use

- To confirm a successful operation (save, delete, update)
- To surface errors or warnings without blocking the UI
- When you need non-modal, auto-dismissing feedback
- Do NOT use for persistent notifications (use `useNotifications()` and the notification dropdown)
- Do NOT use for actions requiring user confirmation (use `usePopup().showConfirmation()` instead)

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

## Recipe: Notifications in a Blade Save Flow

```vue
<script setup lang="ts">
import { notification } from "@vc-shell/framework";

async function save() {
  try {
    await api.saveProduct(product.value);
    notification("Product saved successfully.", { type: "success" });
    resetModificationState();
  } catch (error) {
    notification(error.message || "Failed to save product.", {
      type: "error",
      timeout: 8000,  // Show errors longer
    });
  }
}

async function deleteItem() {
  const confirmed = await showConfirmation("Delete this product?");
  if (confirmed) {
    await api.deleteProduct(product.value.id);
    notification("Product deleted.", { type: "success" });
    closeSelf();
  }
}
</script>
```

## Recipe: Persistent Notification with Manual Dismiss

For critical errors that the user should acknowledge:

```ts
notification("Connection to server lost. Please check your network.", {
  type: "error",
  timeout: false,  // Will not auto-dismiss
});
```

## Recipe: Notification with Callback

Track when the user dismisses a notification:

```ts
notification("Export started. You will be notified when complete.", {
  type: "default",
  timeout: 3000,
  onClose: () => {
    console.log("User acknowledged the export notification");
  },
});
```

## Notification Positions

Available positions for the `position` option:

| Position | Description |
|----------|-------------|
| `"top-right"` | Default. Upper right corner |
| `"top-left"` | Upper left corner |
| `"top-center"` | Centered at the top |
| `"bottom-right"` | Lower right corner |
| `"bottom-left"` | Lower left corner |
| `"bottom-center"` | Centered at the bottom |

## Key Parts

| Export | Description |
|--------|-------------|
| `notification` | Factory function to create and show a notification |
| `useContainer` | Composable managing the notification container state |
| `useInstance` | Composable for individual notification instance lifecycle |

## Details

- **Stacking**: Multiple notifications stack vertically. Newer notifications appear at the top (for top positions) or bottom (for bottom positions).
- **Auto-dismiss**: By default, notifications dismiss after a type-dependent timeout. Success messages typically dismiss faster than errors.
- **Pause on hover**: When `pauseOnHover` is enabled, hovering over a notification pauses its countdown timer, giving the user time to read longer messages.
- **VNode support**: The `content` parameter accepts Vue VNodes, enabling rich notification content with icons, links, or formatted text.

## Tips

- Use `type: "success"` for confirmations, `type: "error"` for failures, and `type: "warning"` for advisory messages. The default type has neutral styling.
- Keep notification text concise -- ideally one sentence. For detailed error information, use a popup or blade instead.
- Set a longer `timeout` for error notifications (5-8 seconds) so users have time to read them.
- The `notification()` function can be called from anywhere (composables, stores, event handlers) -- it does not require a component context.

## Related Components

- **VcToast** - The visual toast component rendered for each notification
- **usePopup** - For modal dialogs that require user action; use notifications for passive feedback
- **NotificationDropdown** - For persistent push notification history (different system)
