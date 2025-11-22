---
id: useNotifications-subscribe-notifications
type: FRAMEWORK_API
category: composable
tags: [composable, notifications, signalr, real-time]
title: "useNotifications - Subscribe to Notifications"
description: "Subscribe to real-time push notifications in blades"
---

# useNotifications - Subscribe to Notifications

The `useNotifications` composable enables blade-specific subscription to real-time push notifications via SignalR.

## Overview

- Subscribe to specific notification types locally in a blade
- Handle notifications with custom logic (toasts, data refresh)
- Access notification data payload
- Different from global app-wide subscriptions via `defineOptions`

## Two Subscription Approaches

### Global App-Wide Subscription (defineOptions)

```typescript
// Makes notifications available throughout the entire app
defineOptions({
  name: "OrderManagement",
  notifyType: "OrderStatusChanged" // ← Global subscription
});

// Notifications appear in global notification center automatically
// No additional code needed
```

### Local Blade Subscription (useNotifications)

```typescript
// Only affects current blade - for immediate toast feedback
const { setNotificationHandler } = useNotifications("OrderStatusChanged");

setNotificationHandler((notif) => {
  notification.success("Order updated!"); // Toast only in this blade
  refreshData();
});
```

**Key Difference**: `defineOptions` affects entire app, `useNotifications()` only affects current blade.

## Basic Blade-Specific Subscription

```vue
<script setup lang="ts">
import { useNotifications, notification } from "@vc-shell/framework";

defineOptions({
  name: "InventoryBlade",
  url: "/inventory"
  // No notifyType here - not subscribing app globally
});

// Local subscription - only for this blade
const { setNotificationHandler } = useNotifications("StockLevelChanged");

// Handle notifications with blade-specific toast
setNotificationHandler((notif) => {
  notification.info(`Stock updated for ${notif.data.itemName}`);

  // Refresh data specific to this blade
  refreshInventoryData();
});

function refreshInventoryData() {
  // Reload inventory items
}
</script>

<template>
  <VcBlade title="Inventory">
    <VcTable :items="inventoryItems" />
    <!-- Toasts appear only when this blade is active -->
  </VcBlade>
</template>
```

## Multiple Notification Types

```vue
<script setup lang="ts">
import { useNotifications, notification } from "@vc-shell/framework";

// Subscribe to multiple types locally
const { setNotificationHandler } = useNotifications([
  "StockLevelChanged",
  "InventoryAlert",
  "LowStockWarning"
]);

setNotificationHandler((notif) => {
  switch (notif.notifyType) {
    case "StockLevelChanged":
      notification.info(`Stock level updated for ${notif.data.itemName}`);
      refreshInventoryData();
      break;

    case "InventoryAlert":
      notification.warning(`Inventory alert: ${notif.data.message}`);
      highlightAlertedItems(notif.data.itemIds);
      break;

    case "LowStockWarning":
      notification.error(`Low stock warning: ${notif.data.itemName}`);
      showLowStockBadge(notif.data.itemId);
      break;
  }
});
</script>
```

## Notification Data Structure

```typescript
interface PushNotification {
  id: string;
  notifyType: string;           // Notification type (e.g., "OrderCreated")
  title: string;                 // Notification title
  message: string;               // Notification message
  data: Record<string, any>;     // Custom payload data
  created: string;               // ISO date string
  isRead: boolean;               // Read status
}

// Example notification
{
  id: "notif-123",
  notifyType: "OrderCreated",
  title: "New Order",
  message: "Order #12345 has been created",
  data: {
    orderId: "12345",
    orderNumber: "ORD-12345",
    customerName: "John Doe",
    total: 299.99
  },
  created: "2025-01-21T10:30:00Z",
  isRead: false
}
```

## Combined Global + Local Approach

```vue
<script setup lang="ts">
import { useNotifications, notification } from "@vc-shell/framework";

// Global subscription - available app-wide in notification center
defineOptions({
  name: "OrderProcessing",
  url: "/orders/processing",
  notifyType: ["OrderCreated", "OrderCancelled"] // ← Global
});

// Local subscription - blade-specific toast feedback
const { setNotificationHandler } = useNotifications([
  "OrderProcessingStarted",
  "OrderProcessingCompleted"
]);

// Handle local events with immediate feedback
setNotificationHandler((notif) => {
  switch (notif.notifyType) {
    case "OrderProcessingStarted":
      notification.info("Processing order...");
      updateProcessingStatus(notif.data.orderId, "processing");
      break;

    case "OrderProcessingCompleted":
      notification.success("Order processed successfully!");
      updateProcessingStatus(notif.data.orderId, "completed");
      break;
  }
});
</script>
```

## Accessing Notification Lists

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useNotifications, notification } from "@vc-shell/framework";

// Get notifications and module-specific notifications
const {
  notifications,        // All notifications (app-wide)
  moduleNotifications,  // Only notifications of specified type
  setNotificationHandler
} = useNotifications("OfferCreated");

// Store blade-specific notifications
const localNotifications = ref<PushNotification[]>([]);

setNotificationHandler((notif) => {
  // Add to local display
  localNotifications.value.unshift(notif);

  // Show toast
  notification.info(`New offer: ${notif.data.offerName}`);

  // Keep only last 5
  if (localNotifications.value.length > 5) {
    localNotifications.value = localNotifications.value.slice(0, 5);
  }
});
</script>

<template>
  <VcBlade title="Offers">
    <!-- Display blade-specific notifications -->
    <div v-if="localNotifications.length" class="tw-mb-4">
      <h4 class="tw-font-semibold">Recent Updates</h4>
      <div
        v-for="notif in localNotifications"
        :key="notif.id"
        class="tw-p-2 tw-border-b"
      >
        {{ notif.title }} - {{ notif.message }}
      </div>
    </div>

    <VcTable :items="offers" />
  </VcBlade>
</template>
```

## Refresh Data on Notification

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useNotifications, notification } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { getApiClient } = useApiClient(OffersClient);
const offers = ref([]);
const loading = ref(false);

// Subscribe to offer-related notifications
const { setNotificationHandler } = useNotifications([
  "OfferCreated",
  "OfferUpdated",
  "OfferDeleted"
]);

setNotificationHandler((notif) => {
  switch (notif.notifyType) {
    case "OfferCreated":
      notification.success(`New offer created: ${notif.data.offerName}`);
      loadOffers(); // Refresh list
      break;

    case "OfferUpdated":
      notification.info(`Offer updated: ${notif.data.offerName}`);
      updateOfferInList(notif.data.offerId);
      break;

    case "OfferDeleted":
      notification.warning(`Offer deleted: ${notif.data.offerName}`);
      removeOfferFromList(notif.data.offerId);
      break;
  }
});

async function loadOffers() {
  loading.value = true;
  try {
    const client = await getApiClient();
    const result = await client.searchOffers(new SearchOffersQuery({ take: 20 }));
    offers.value = result.results;
  } finally {
    loading.value = false;
  }
}

function updateOfferInList(offerId: string) {
  // Update specific offer without full reload
  const index = offers.value.findIndex(o => o.id === offerId);
  if (index !== -1) {
    // Reload just this offer
    loadOfferById(offerId).then(offer => {
      offers.value[index] = offer;
    });
  }
}

function removeOfferFromList(offerId: string) {
  offers.value = offers.value.filter(o => o.id !== offerId);
}
</script>
```

## API Reference

```typescript
interface UseNotificationsReturn {
  // All notifications (ordered by creation date descending)
  notifications: ComputedRef<PushNotification[]>;

  // Notifications matching specified notifyType(s)
  moduleNotifications: ComputedRef<PushNotification[]>;

  // Set handler for new notifications
  setNotificationHandler: (handler: (notification: PushNotification) => void) => void;

  // Load notification history
  loadFromHistory: (take?: number) => Promise<void>;

  // Add notification locally
  addNotification: (message: PushNotification) => void;

  // Mark as read
  markAsRead: (message: PushNotification) => void;

  // Mark all as read
  markAllAsRead: () => Promise<void>;
}
```

## Important Notes

### ✅ DO

- Use local subscription for blade-specific toast feedback
- Use global subscription (defineOptions) for app-wide notifications
- Refresh blade data when relevant notifications arrive
- Use `switch` statement for multiple notification types
- Show appropriate toast messages (info, success, warning, error)

### ❌ DON'T

- Don't use both global and local subscription for same type (unless intentional)
- Don't perform expensive operations in notification handler (debounce if needed)
- Don't forget to handle notification data safely (use optional chaining)
- Don't ignore cleanup (composable handles it automatically)

## When to Use Local vs Global

### Use Local Subscription (useNotifications) when:
- Need immediate toast feedback specific to a blade
- Notifications only relevant to current blade's context
- Want to handle without affecting global state
- Need custom logic for blade's workflow

### Use Global Subscription (defineOptions) when:
- Notifications important for entire application
- Want notifications in global notification center
- Multiple parts of app need to be aware
- Want to create custom notification templates

## Common Patterns

### Show Toast + Refresh

```typescript
setNotificationHandler((notif) => {
  notification.success(notif.message);
  refreshData(); // Reload blade data
});
```

### Conditional Handling

```typescript
setNotificationHandler((notif) => {
  // Only handle if relevant to current view
  if (notif.data.categoryId === currentCategory.value) {
    notification.info(notif.message);
    refreshCategory();
  }
});
```

### Update Single Item

```typescript
setNotificationHandler((notif) => {
  // Update specific item instead of full reload
  const item = items.value.find(i => i.id === notif.data.itemId);
  if (item) {
    Object.assign(item, notif.data.updatedFields);
  }
});
```

## See Also

- [custom-handlers.md](./custom-handlers.md) - Custom notification handler patterns
- [notification-history.md](./notification-history.md) - Loading notification history
- [Notifications Service API](../../shared/components/notifications.md) - Toast notifications

**Reference:** [Official VC-Shell Documentation - useNotifications](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useNotifications/)
