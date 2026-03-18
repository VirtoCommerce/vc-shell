# SignalR Plugin

Real-time push notification transport via ASP.NET SignalR. Connects to the platform's `/pushNotificationHub` and routes incoming messages to the notification store.

## Overview

The VirtoCommerce platform uses ASP.NET SignalR to push real-time notifications to connected clients. These notifications cover events like order status changes, catalog exports completing, background job progress, and system alerts.

The SignalR plugin establishes a persistent WebSocket connection to the platform hub and listens for two event channels:

- **`Send`** -- broadcast messages sent to all connected clients
- **`SendSystemEvents`** -- messages filtered by `creator` field, scoped to a specific user or organization

Incoming messages are ingested into the `NotificationStore`, which dispatches them to registered notification type handlers and triggers toast notifications based on per-type configuration.

The connection lifecycle is tied to the user's authentication state: it connects on login, disconnects on logout, and auto-reconnects on connection loss.

## Installation / Registration

```typescript
// Automatic -- installed by the framework during app setup.
// The `creator` option is typically set to the current user/organization ID.
app.use(signalR, { creator: currentUserId });
```

Module developers do not install this plugin. It is registered once by the framework during bootstrap.

## API

### Plugin Options

| Option | Type | Description |
|--------|------|-------------|
| `creator` | `string \| undefined` | Filters `SendSystemEvents` messages to only those matching this creator ID |

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `signalR` | `Plugin` | Vue plugin object with `install()` method |
| `updateSignalRCreatorSymbol` | `InjectionKey` | Injection key for the creator update function |

### Provided Injectables

| Key | Type | Description |
|-----|------|-------------|
| `updateSignalRCreatorSymbol` | `(creator: string \| undefined) => void` | Updates the SignalR creator filter at runtime |

### Global Properties

| Property | Type | Description |
|----------|------|-------------|
| `$updateSignalRCreator` | `(creator: string \| undefined) => void` | Same as the injectable, accessible via `this.$updateSignalRCreator` |

## Connection Lifecycle

```
User logs in (isAuthenticated = true)
  |
  v
connection.start()  ------>  /pushNotificationHub (WebSocket)
  |                              |
  |  <--- "Send" messages -------+
  |  <--- "SendSystemEvents" ----+  (filtered by creator)
  |                              |
  v                              |
store.ingest(message)            |
  |                              |
  +--- toast notification        |
  +--- subscriber callbacks      |
  +--- history update            |
  |                              |
User logs out                    |
  |                              |
  v                              |
connection.stop()  ------------>-+
```

### Reconnection Behavior

- **Built-in**: The `HubConnectionBuilder` is configured with `.withAutomaticReconnect()`, which handles transient disconnects
- **Manual fallback**: If `connection.start()` fails, a `setTimeout` retries after 5 seconds
- **`onclose` handler**: When the connection closes and the user is still authenticated (`reconnect = true`), it restarts automatically
- **Logout cleanup**: Setting `reconnect = false` before `stop()` prevents reconnection after intentional disconnection

## Usage

### Updating the Creator Filter

After login or when switching organizations, update the creator to scope system events:

```typescript
import { inject } from "vue";
import { updateSignalRCreatorSymbol } from "@vc-shell/framework";

const updateCreator = inject(updateSignalRCreatorSymbol);
updateCreator?.(currentUser.id);
```

Or via the global property in Options API (legacy):

```typescript
this.$updateSignalRCreator(currentUser.id);
```

### How Messages Flow

1. Platform sends a `PushNotification` via SignalR
2. The plugin's `Send` or `SendSystemEvents` handler receives it
3. `store.ingest(message)` dispatches to the `NotificationStore`
4. Registered notification type handlers (from `defineAppModule({ notifications })`) process the message
5. Toast notifications appear based on the type's `toast.mode` configuration (`"auto"`, `"progress"`, or `"silent"`)

### Reacting to Notifications in a Blade

Module developers typically do not interact with SignalR directly. Instead, use `useBladeNotifications()` to subscribe to specific notification types:

```typescript
import { useBladeNotifications } from "@vc-shell/framework";

const { messages, unreadCount } = useBladeNotifications({
  types: ["CatalogExportCompleted"],
  filter: (msg) => msg.jobId === currentJobId.value,
  onMessage: (msg) => {
    if (msg.finished) {
      reloadExportResults();
    }
  },
});
```

### Testing with Cypress

The plugin supports Cypress mock via `cypress-signalr-mock`. When running in a Cypress environment or Vitest, the mock replaces the real SignalR connection, allowing you to simulate push notifications in tests:

```typescript
// In a Cypress test:
cy.signalR("pushNotificationHub").invoke("Send", {
  id: "test-1",
  notifyType: "OrderStatusChanged",
  title: "Order #123 shipped",
  isNew: true,
});
```

## Tip: Creator vs. Broadcast

If your notification type should reach all connected clients regardless of who triggered it, use the `Send` channel (the platform sends it as a broadcast). For user-scoped notifications (e.g., "your export is complete"), use `SendSystemEvents` with the `creator` field set to the user's ID on the server side.

## Common Mistake

Do not call `updateCreator` before the SignalR connection is established. The plugin watches the `currentCreator` ref and re-registers the `SendSystemEvents` handler only when the connection state is `"Connected"`. If you set the creator before authentication, it will be applied when the connection starts.

## Related

- `framework/core/notifications/` -- `NotificationStore` that receives ingested messages
- `framework/core/plugins/modularity/` -- modules register notification types that handle SignalR messages
- `framework/core/composables/useUserManagement/` -- provides `isAuthenticated` reactive ref
- `framework/core/notifications/composables/useBladeNotifications.ts` -- blade-scoped notification subscription
