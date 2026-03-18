# VcToast

Toast notification component with type-based styling, auto-dismiss timer, swipe-to-dismiss on touch devices, and Sonner-style stacking animations. Most applications interact with toasts through the `notification` service rather than mounting the component directly.

## When to Use

- Displaying transient feedback messages (success, error, warning, info)
- Non-blocking notifications that auto-dismiss after a timeout
- Feedback for async operations (upload progress, save confirmation)
- Rich notifications with custom component content

When NOT to use:
- For persistent alerts or banners -- use a dedicated alert component
- For inline field validation -- use `VcHint` or form-level error display
- For modal confirmations requiring user action -- use a dialog/modal

## Quick Start

The recommended approach is the `notification` service, not direct component usage:

```ts
import { notification } from "@vc-shell/framework";

// Simple string notifications
notification("Order saved successfully");
notification.success("Product published!");
notification.error("Failed to save changes.");
notification.warning("This action cannot be undone.");
```

## Features

### Notification Service API

The `notification` function is the primary interface for creating and managing toasts.

#### Creating Notifications

```ts
import { notification } from "@vc-shell/framework";

// Default type (info)
notification("Processing your request...");

// Typed notifications
notification.success("Changes saved successfully");
notification.error("Network error. Please try again.");
notification.warning("You have unsaved changes");

// With options
notification("Quick note", { timeout: 2000 });           // Dismiss after 2 seconds
notification("Please wait...", { timeout: false });        // Persistent (no auto-dismiss)
notification("Hover me", { pauseOnHover: true });          // Pause timer on hover (default)
```

Each call returns a unique `id` that can be used to update or remove the notification later.

#### Updating Notifications

Update an existing notification's content, type, or timeout. This is useful for progress-style patterns.

```ts
const id = notification("Uploading files...", { timeout: false });

// Later, when upload completes:
notification.update(id, {
  content: "Upload complete!",
  type: "success",
  timeout: 3000,
});

// Or if upload fails:
notification.update(id, {
  content: "Upload failed. Please retry.",
  type: "error",
  timeout: 5000,
});
```

#### Removing Notifications

```ts
// Remove a specific notification
notification.remove(id);

// Remove all notifications
notification.clearAll();
```

#### Changing Position

```ts
notification.setPosition("top-right");
```

Available positions: `"top-center"`, `"top-right"`, `"top-left"`, `"bottom-center"`, `"bottom-right"`, `"bottom-left"`.

### Notification Types

Each type displays a distinct icon and colored left accent border.

| Type | Icon | Accent Color | Use Case |
|------|------|-------------|----------|
| `default` | Info circle | `--notification-info` | General information |
| `success` | Check circle | `--notification-success` | Successful operations |
| `error` | Alert circle | `--notification-error` | Failed operations, errors |
| `warning` | Alert triangle | `--notification-warning` | Caution, destructive actions |

### Custom Component Content

Instead of a string, pass a Vue component for rich notification content.

```ts
import { defineComponent } from "vue";
import { notification } from "@vc-shell/framework";

const OrderNotification = defineComponent({
  template: `
    <div>
      <div class="tw-font-semibold">New Order #1234</div>
      <div class="tw-text-sm">3 items, $149.99</div>
    </div>
  `,
});

notification(OrderNotification, { timeout: 10000, pauseOnHover: true });
```

### Stacking, Swipe, and Auto-dismiss

Toasts use Sonner-style stacking: the newest toast is in front, older toasts scale down behind it, and hovering expands the full stack. Only 3 toasts are visible by default in the collapsed state.

On touch devices, horizontal swipe dismisses toasts (threshold: 45px or velocity > 0.11px/ms).

The auto-dismiss timer (default 5000ms) pauses on hover. Set `timeout: false` for persistent toasts.

```ts
notification("Quick flash", { timeout: 1500 });
const id = notification("Please wait...", { timeout: false });
notification.remove(id); // dismiss programmatically
```

## Recipes

### Async Operation with Progress Feedback

```ts
import { notification } from "@vc-shell/framework";

async function publishProduct(productId: string) {
  const id = notification("Publishing product...", { timeout: false });

  try {
    await api.publishProduct(productId);
    notification.update(id, {
      content: "Product published successfully!",
      type: "success",
      timeout: 3000,
    });
  } catch (error) {
    notification.update(id, {
      content: `Failed to publish: ${error.message}`,
      type: "error",
      timeout: 8000,
    });
  }
}
```

### Undo Action Pattern

Pass a component with an undo button as the notification content:

```ts
function deleteItem(item: { id: string; name: string }) {
  softDelete(item.id);
  const UndoContent = defineComponent({
    setup() {
      const undo = () => { restoreItem(item.id); notification.remove(notifId); };
      return () => h("div", { class: "tw-flex tw-gap-3" }, [
        h("span", `"${item.name}" deleted.`),
        h("button", { class: "tw-text-[color:var(--primary-600)] tw-underline", onClick: undo }, "Undo"),
      ]);
    },
  });
  const notifId = notification(UndoContent, { timeout: 8000, pauseOnHover: true });
}
```

## Common Mistakes

### 1. Forgetting to store the notification ID for later updates

```ts
// WRONG: can't update or remove this notification later
notification("Uploading...", { timeout: false });
// ... no way to update the toast when upload finishes

// CORRECT: store the returned ID
const id = notification("Uploading...", { timeout: false });
notification.update(id, { content: "Done!", type: "success", timeout: 3000 });
```

### 2. Using the component directly instead of the service

```vue
<!-- WRONG: mounting VcToast directly bypasses the notification stack -->
<VcToast content="Hello" type="success" />

<!-- CORRECT: use the notification service -->
<script setup>
import { notification } from "@vc-shell/framework";
notification.success("Hello");
</script>
```

### 3. Setting timeout to 0 instead of false for persistent notifications

```ts
// WRONG: timeout of 0 may behave unexpectedly
notification("Please wait...", { timeout: 0 });

// CORRECT: use false to disable auto-dismiss
notification("Please wait...", { timeout: false });
```

## Props (Component)

These props are used internally by the notification system. You rarely need to set them directly.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| Component` | -- | Notification message or custom component |
| `notificationId` | `number \| string` | -- | Unique identifier |
| `updateId` | `number \| string` | -- | ID for update tracking |
| `type` | `"default" \| "success" \| "error" \| "warning"` | `"default"` | Notification type (determines icon and accent color) |
| `timeout` | `number \| boolean` | `5000` | Auto-dismiss delay in ms, or `false` to disable |
| `pauseOnHover` | `boolean` | `true` | Pause timeout while mouse hovers over the toast |
| `limit` | `number` | -- | Maximum number of visible notifications |
| `position` | `NotificationPosition` | `"top-center"` | Screen position for the toast |
| `dismissing` | `boolean` | -- | Programmatic dismissal trigger |
| `toastIndex` | `number` | `0` | Stack index (0 = front/newest) |
| `toastsCount` | `number` | -- | Total number of toasts in the position stack |
| `expanded` | `boolean` | `true` | Whether the toast group is in expanded (hovered) state |
| `visibleToasts` | `number` | `3` | Maximum visible toasts in collapsed stack |
| `onReportHeight` | `(id, height) => void` | -- | Callback to report measured height to container |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | `number \| string \| undefined` | Toast dismissed (by user click, timeout, or swipe) |

## Notification Service Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `notification()` | `(message: string \| Component, options?: NotificationOptions) => string \| number` | Show a default notification |
| `notification.success()` | `(message: string \| Component) => string \| number` | Show a success notification |
| `notification.error()` | `(message: string \| Component) => string \| number` | Show an error notification |
| `notification.warning()` | `(message: string \| Component) => string \| number` | Show a warning notification |
| `notification.update()` | `(id, options: Partial<NotificationOptions>) => void` | Update an existing notification |
| `notification.remove()` | `(id: string \| number) => void` | Remove a specific notification |
| `notification.clearAll()` | `() => void` | Remove all notifications |
| `notification.setPosition()` | `(position: NotificationPosition) => void` | Change the global position |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--notification-background` | `var(--additional-50)` | Toast background color |
| `--notification-border-radius` | `6px` | Corner radius |
| `--notification-border-color` | `var(--neutrals-200)` | Border color |
| `--notification-content-color` | `var(--neutrals-800)` | Text color |
| `--notification-shadow` | `0 4px 12px rgba(0,0,0,0.08)` | Default box shadow |
| `--notification-hover-shadow` | `0 4px 16px rgba(0,0,0,0.12)` | Box shadow on hover |
| `--notification-dismiss-color` | `var(--neutrals-400)` | Dismiss button icon color |
| `--notification-dismiss-hover-color` | `var(--neutrals-600)` | Dismiss button hover color |
| `--notification-success` | `var(--success-500)` | Success accent and icon color |
| `--notification-error` | `var(--danger-500)` | Error accent and icon color |
| `--notification-warning` | `var(--warning-500)` | Warning accent and icon color |
| `--notification-info` | `var(--info-500)` | Info/default accent and icon color |
| `--notification-accent-width` | `3px` | Left accent border width |
| `--notification-focus-ring-color` | `var(--primary-100)` | Focus ring color on dismiss button |

## Accessibility

- **Error toasts** use `role="alert"` for immediate screen reader announcement
- **Other types** use `role="status"` for polite screen reader announcements
- The dismiss button has `aria-label="Dismiss notification"` for screen readers
- The dismiss button icon is marked `aria-hidden="true"`
- **Escape key** on the dismiss button closes the toast
- **Reduced motion**: animations and transitions are disabled when `prefers-reduced-motion: reduce` is active
- Toast content supports `overflow-wrap: anywhere` for long text without word breaks

## Related Components

- [VcHint](../../atoms/vc-hint/) -- inline hint/error text for form fields
- [VcIcon](../../atoms/vc-icon/) -- used internally for type-specific icons
