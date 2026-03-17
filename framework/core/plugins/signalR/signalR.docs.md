# SignalR Plugin

Real-time push notification transport via ASP.NET SignalR. Connects to the platform's `/pushNotificationHub` and routes incoming messages to the notification store.

## Overview

The SignalR plugin establishes a persistent WebSocket connection to the VirtoCommerce platform hub. It listens for two event channels: `Send` (broadcast to all) and `SendSystemEvents` (filtered by `creator`). Incoming messages are ingested into the `NotificationStore`, which dispatches them to registered notification type handlers and toast notifications. The connection auto-reconnects and is tied to the user's authentication state.

## Installation / Registration

```typescript
// Automatic -- installed by the framework during app setup.
// The `creator` option is typically set to the current user/organization ID.
app.use(signalR, { creator: currentUserId });
```

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

## Usage

### Updating the Creator Filter

After login, set the creator to scope system events to the current user:

```typescript
import { inject } from "vue";
import { updateSignalRCreatorSymbol } from "@vc-shell/framework";

const updateCreator = inject(updateSignalRCreatorSymbol);
updateCreator?.(currentUser.id);
```

### How Messages Flow

1. Platform sends a `PushNotification` via SignalR
2. The plugin's `Send` or `SendSystemEvents` handler receives it
3. `store.ingest(message)` dispatches to the `NotificationStore`
4. Registered notification type handlers (from `defineAppModule({ notifications })`) process the message
5. Toast notifications appear based on the type's `toast.mode` configuration

### Connection Lifecycle

- Connects automatically when the user authenticates (`isAuthenticated` becomes `true`)
- Disconnects when the user logs out
- Auto-reconnects on connection loss (built-in SignalR reconnection + manual retry with 5s delay)
- Supports Cypress mock via `cypress-signalr-mock` for testing

## Related

- `framework/core/notifications/` -- `NotificationStore` that receives ingested messages
- `framework/core/plugins/modularity/` -- modules register notification types that handle SignalR messages
- `framework/core/composables/useUserManagement/` -- provides `isAuthenticated` reactive ref
