# VcToast

Toast notification component with type-based styling, auto-dismiss timer, swipe-to-dismiss, and Sonner-style stacking animations.

## When to Use

- Displaying transient feedback messages (success, error, warning, info)
- Non-blocking notifications that auto-dismiss after a timeout
- When NOT to use: for persistent alerts or inline validation, use `VcHint` or form-level error display

## Basic Usage

Most applications use the `notification` service rather than the component directly:

```ts
import { notification } from "@vc-shell/framework";

// Simple notifications
notification("Order saved successfully");
notification.success("Product published!");
notification.error("Failed to save changes.");
notification.warning("This action cannot be undone.");

// With options
notification("Processing...", { timeout: false }); // Persistent
notification("Quick note", { timeout: 2000 });     // 2 second dismiss
```

## Notification Service API

```ts
// Show notifications by type
notification(message: string | Component, options?: NotificationOptions): string | number;
notification.success(message): string | number;
notification.error(message): string | number;
notification.warning(message): string | number;

// Update an existing notification
notification.update(id, { content: "Updated!", type: "success", timeout: 5000 });

// Remove notifications
notification.remove(id);
notification.clearAll();

// Change position
notification.setPosition("top-right"); // top-center | top-right | top-left | bottom-center | bottom-right | bottom-left
```

## Key Props (Component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| Component` | — | Notification message or custom component |
| `notificationId` | `number \| string` | — | Unique identifier |
| `type` | `"default" \| "success" \| "error" \| "warning"` | `"default"` | Type determines icon and accent color |
| `timeout` | `number \| boolean` | `5000` | Auto-dismiss delay in ms, or `false` to disable |
| `pauseOnHover` | `boolean` | `true` | Pause timeout while hovering |
| `position` | `NotificationPosition` | `"top-center"` | Screen position for the toast |
| `toastIndex` | `number` | `0` | Stack index (0 = front/newest) |
| `expanded` | `boolean` | `true` | Whether the toast group is expanded |
| `visibleToasts` | `number` | `3` | Max visible toasts in collapsed stack |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | `number \| string \| undefined` | Toast dismissed (by user, timeout, or swipe) |

## Common Patterns

### Custom Component Content

```ts
import { defineComponent } from "vue";

const OrderNotification = defineComponent({
  template: `
    <div>
      <h3 class="tw-font-bold">New Order #1234</h3>
      <p class="tw-text-sm">3 items, $149.99</p>
      <button @click="viewOrder">View Order</button>
    </div>
  `,
  setup() {
    const viewOrder = () => { /* navigate */ };
    return { viewOrder };
  },
});

notification(OrderNotification, { timeout: 10000, pauseOnHover: true });
```

### Update Notification Pattern

```ts
const id = notification("Uploading files...", { timeout: false });

// Later, when upload completes:
notification.update(id, {
  content: "Upload complete!",
  type: "success",
  timeout: 3000,
});
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--notification-background` | `var(--additional-50)` | Toast background |
| `--notification-border-radius` | `6px` | Corner radius |
| `--notification-border-color` | `var(--neutrals-200)` | Border color |
| `--notification-content-color` | `var(--neutrals-800)` | Text color |
| `--notification-shadow` | `0 4px 12px rgba(0,0,0,0.08)` | Box shadow |
| `--notification-success` | `var(--success-500)` | Success accent color |
| `--notification-error` | `var(--danger-500)` | Error accent color |
| `--notification-warning` | `var(--warning-500)` | Warning accent color |
| `--notification-info` | `var(--info-500)` | Info accent color |
| `--notification-accent-width` | `3px` | Left accent border width |

## Accessibility

- Error toasts use `role="alert"` for screen reader announcement
- Other types use `role="status"` for polite announcements
- Dismiss button has `aria-label="Dismiss notification"`
- Escape key on the dismiss button closes the toast
- Respects `prefers-reduced-motion` by disabling animations

## Related Components

- [VcHint](../../atoms/vc-hint/) — inline hint/error text for form fields
- [VcIcon](../../atoms/vc-icon/) — used internally for type icons
