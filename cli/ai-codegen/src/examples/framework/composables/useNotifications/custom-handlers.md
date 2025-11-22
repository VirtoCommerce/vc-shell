---
id: useNotifications-custom-handlers
type: FRAMEWORK_API
category: composable
tags: [composable, notifications, handlers, custom-logic]
title: "useNotifications - Custom Handlers"
description: "Advanced notification handler patterns with custom logic"
---

# useNotifications - Custom Handlers

Advanced patterns for creating custom notification handlers with complex logic, error handling, and performance optimization.

## Overview

- Create custom handler functions for notifications
- Handle complex notification workflows
- Implement debouncing and throttling
- Error handling in notification handlers
- Conditional notification processing

## Basic Custom Handler

```typescript
import { useNotifications, notification } from "@vc-shell/framework";

const { setNotificationHandler } = useNotifications("OfferUpdated");

// Custom handler function
function handleOfferUpdate(notif: PushNotification) {
  // Extract data
  const { offerId, offerName, status } = notif.data;

  // Show notification
  notification.info(`Offer "${offerName}" is now ${status}`);

  // Update UI
  updateOfferStatus(offerId, status);

  // Log analytics
  logAnalyticsEvent("offer_updated", { offerId, status });
}

// Set the handler
setNotificationHandler(handleOfferUpdate);
```

## Complex Multi-Type Handler

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useNotifications, notification } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { getApiClient } = useApiClient(OffersClient);
const offers = ref([]);
const pendingApprovals = ref(0);

// Subscribe to multiple notification types
const { setNotificationHandler } = useNotifications([
  "OfferCreated",
  "OfferUpdated",
  "OfferDeleted",
  "OfferApproved",
  "OfferRejected"
]);

// Complex handler with different logic per type
setNotificationHandler(async (notif) => {
  try {
    switch (notif.notifyType) {
      case "OfferCreated":
        await handleOfferCreated(notif);
        break;

      case "OfferUpdated":
        await handleOfferUpdated(notif);
        break;

      case "OfferDeleted":
        handleOfferDeleted(notif);
        break;

      case "OfferApproved":
        await handleOfferApproved(notif);
        break;

      case "OfferRejected":
        handleOfferRejected(notif);
        break;
    }
  } catch (error) {
    console.error("Notification handler error:", error);
    notification.error("Failed to process notification");
  }
});

async function handleOfferCreated(notif: PushNotification) {
  notification.success(`New offer created: ${notif.data.offerName}`);

  // Add to list without full reload
  const client = await getApiClient();
  const newOffer = await client.getOffer(new GetOfferQuery({ id: notif.data.offerId }));
  offers.value.unshift(newOffer);

  // Update counter
  pendingApprovals.value++;
}

async function handleOfferUpdated(notif: PushNotification) {
  notification.info(`Offer updated: ${notif.data.offerName}`);

  // Update specific offer in list
  const index = offers.value.findIndex(o => o.id === notif.data.offerId);
  if (index !== -1) {
    const client = await getApiClient();
    const updatedOffer = await client.getOffer(new GetOfferQuery({ id: notif.data.offerId }));
    offers.value[index] = updatedOffer;
  }
}

function handleOfferDeleted(notif: PushNotification) {
  notification.warning(`Offer deleted: ${notif.data.offerName}`);

  // Remove from list
  offers.value = offers.value.filter(o => o.id !== notif.data.offerId);

  // Update counter if it was pending
  if (notif.data.wasPending) {
    pendingApprovals.value--;
  }
}

async function handleOfferApproved(notif: PushNotification) {
  notification.success(`Offer approved: ${notif.data.offerName}`);

  // Update status
  const offer = offers.value.find(o => o.id === notif.data.offerId);
  if (offer) {
    offer.status = "Approved";
  }

  pendingApprovals.value--;
}

function handleOfferRejected(notif: PushNotification) {
  notification.error(`Offer rejected: ${notif.data.offerName}`);

  // Update status and add rejection reason
  const offer = offers.value.find(o => o.id === notif.data.offerId);
  if (offer) {
    offer.status = "Rejected";
    offer.rejectionReason = notif.data.reason;
  }

  pendingApprovals.value--;
}
</script>
```

## Debounced Handler for Frequent Notifications

```typescript
import { ref } from "vue";
import { useNotifications, notification } from "@vc-shell/framework";
import { useDebounceFn } from "@vueuse/core";

const { setNotificationHandler } = useNotifications("StockLevelChanged");

const pendingUpdates = ref<string[]>([]);

// Debounce handler to avoid excessive updates
const debouncedRefresh = useDebounceFn(() => {
  if (pendingUpdates.value.length > 0) {
    notification.info(`Updating ${pendingUpdates.value.length} items...`);
    refreshMultipleItems(pendingUpdates.value);
    pendingUpdates.value = [];
  }
}, 2000); // Wait 2 seconds after last notification

setNotificationHandler((notif) => {
  // Collect item IDs
  if (!pendingUpdates.value.includes(notif.data.itemId)) {
    pendingUpdates.value.push(notif.data.itemId);
  }

  // Trigger debounced refresh
  debouncedRefresh();
});

async function refreshMultipleItems(itemIds: string[]) {
  // Batch reload multiple items
  const client = await getApiClient();
  const items = await client.getItemsByIds(new GetItemsByIdsQuery({ ids: itemIds }));

  // Update items in list
  items.forEach(item => {
    const index = inventoryItems.value.findIndex(i => i.id === item.id);
    if (index !== -1) {
      inventoryItems.value[index] = item;
    }
  });
}
```

## Conditional Handler Based on Context

```typescript
import { computed } from "vue";
import { useNotifications, notification } from "@vc-shell/framework";

const currentCategory = ref<string | null>(null);
const showOnlyMyOffers = ref(false);
const currentUserId = ref<string>("");

const { setNotificationHandler } = useNotifications("OfferCreated");

setNotificationHandler((notif) => {
  // Only handle notifications relevant to current view
  const isRelevant = checkIfRelevant(notif);

  if (!isRelevant) {
    return; // Ignore irrelevant notifications
  }

  // Show notification
  notification.info(`New offer: ${notif.data.offerName}`);

  // Add to list
  addOfferToList(notif.data);
});

function checkIfRelevant(notif: PushNotification): boolean {
  // Filter by category
  if (currentCategory.value && notif.data.categoryId !== currentCategory.value) {
    return false;
  }

  // Filter by user
  if (showOnlyMyOffers.value && notif.data.createdBy !== currentUserId.value) {
    return false;
  }

  return true;
}
```

## Handler with Error Recovery

```typescript
import { useNotifications, notification } from "@vc-shell/framework";

const { setNotificationHandler } = useNotifications("OfferStatusChanged");

setNotificationHandler(async (notif) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await processNotification(notif);
      return; // Success
    } catch (error) {
      attempt++;
      console.error(`Notification processing failed (attempt ${attempt}):`, error);

      if (attempt >= maxRetries) {
        // All retries failed
        notification.error("Failed to process notification. Please refresh.");
        return;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
});

async function processNotification(notif: PushNotification) {
  // Update offer status
  const client = await getApiClient();
  const offer = await client.getOffer(new GetOfferQuery({ id: notif.data.offerId }));

  // Update in list
  const index = offers.value.findIndex(o => o.id === offer.id);
  if (index !== -1) {
    offers.value[index] = offer;
  }

  notification.success("Offer updated");
}
```

## Handler with User Confirmation

```vue
<script setup lang="ts">
import { useNotifications, notification } from "@vc-shell/framework";
import { usePopup } from "@vc-shell/framework";

const { showConfirmation } = usePopup();
const { setNotificationHandler } = useNotifications("OfferApprovalRequired");

setNotificationHandler(async (notif) => {
  // Show notification
  notification.info(`Approval required: ${notif.data.offerName}`);

  // Ask user if they want to review now
  const shouldReviewNow = await showConfirmation(
    `Offer "${notif.data.offerName}" requires your approval. Review now?`
  );

  if (shouldReviewNow) {
    // Open offer details blade
    openBlade({
      blade: OfferDetails,
      param: notif.data.offerId,
      options: {
        approvalMode: true
      }
    });
  } else {
    // Add to pending approvals list
    pendingApprovals.value.push({
      offerId: notif.data.offerId,
      offerName: notif.data.offerName,
      notificationId: notif.id
    });
  }
});
</script>
```

## Handler with Analytics Tracking

```typescript
import { useNotifications, notification } from "@vc-shell/framework";

const { setNotificationHandler } = useNotifications([
  "OfferCreated",
  "OfferUpdated",
  "OfferDeleted"
]);

setNotificationHandler((notif) => {
  // Track notification received
  trackAnalytics("notification_received", {
    notifyType: notif.notifyType,
    timestamp: new Date().toISOString(),
    userId: currentUser.value?.id
  });

  // Handle notification
  switch (notif.notifyType) {
    case "OfferCreated":
      trackAnalytics("offer_created_notification", {
        offerId: notif.data.offerId,
        offerName: notif.data.offerName
      });
      handleOfferCreated(notif);
      break;

    case "OfferUpdated":
      trackAnalytics("offer_updated_notification", {
        offerId: notif.data.offerId,
        changes: notif.data.changedFields
      });
      handleOfferUpdated(notif);
      break;

    case "OfferDeleted":
      trackAnalytics("offer_deleted_notification", {
        offerId: notif.data.offerId
      });
      handleOfferDeleted(notif);
      break;
  }
});

function trackAnalytics(event: string, data: Record<string, any>) {
  // Send to analytics service
  console.log("Analytics:", event, data);
  // analyticsService.track(event, data);
}
```

## Handler with State Management

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useNotifications, notification } from "@vc-shell/framework";

// State management
const notifications = ref<PushNotification[]>([]);
const processedIds = ref<Set<string>>(new Set());
const failedNotifications = ref<PushNotification[]>([]);

const { setNotificationHandler } = useNotifications("OfferStatusChanged");

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.isRead).length
);

setNotificationHandler(async (notif) => {
  // Prevent duplicate processing
  if (processedIds.value.has(notif.id)) {
    return;
  }

  try {
    // Mark as processing
    processedIds.value.add(notif.id);

    // Store notification
    notifications.value.unshift(notif);

    // Process notification
    await processStatusChange(notif);

    // Show toast
    notification.success(`Status changed: ${notif.data.offerName}`);
  } catch (error) {
    console.error("Failed to process notification:", error);

    // Track failed notification
    failedNotifications.value.push(notif);

    // Show error
    notification.error("Failed to process notification");
  }
});

async function processStatusChange(notif: PushNotification) {
  const { offerId, newStatus } = notif.data;

  // Update offer in list
  const offer = offers.value.find(o => o.id === offerId);
  if (offer) {
    offer.status = newStatus;
  }
}

// Retry failed notifications
async function retryFailedNotifications() {
  const failed = [...failedNotifications.value];
  failedNotifications.value = [];

  for (const notif of failed) {
    try {
      await processStatusChange(notif);
      notification.success("Notification processed successfully");
    } catch (error) {
      failedNotifications.value.push(notif);
    }
  }
}
</script>
```

## Handler with Sound Notification

```typescript
import { useNotifications, notification } from "@vc-shell/framework";

const { setNotificationHandler } = useNotifications("HighPriorityAlert");

// Create audio element
const alertSound = new Audio("/sounds/alert.mp3");

setNotificationHandler((notif) => {
  // Show visual notification
  notification.error(`HIGH PRIORITY: ${notif.message}`);

  // Play sound if enabled
  if (soundEnabled.value) {
    alertSound.play().catch(err => {
      console.error("Failed to play sound:", err);
    });
  }

  // Add to alerts list
  highPriorityAlerts.value.unshift({
    ...notif,
    acknowledged: false
  });

  // Update badge count
  alertCount.value++;
});
```

## Important Notes

### ✅ DO

- Wrap async operations in try-catch
- Use debouncing for frequent notifications
- Check relevance before processing
- Track processed notification IDs to avoid duplicates
- Implement error recovery for critical operations
- Clean up resources when component unmounts (automatic)

### ❌ DON'T

- Don't perform expensive synchronous operations in handlers
- Don't forget to handle errors in async handlers
- Don't assume notification data structure (validate first)
- Don't create memory leaks (composable handles cleanup)
- Don't block the handler with long-running operations

## Performance Optimization

```typescript
import { useNotifications } from "@vc-shell/framework";
import { useDebounceFn, useThrottleFn } from "@vueuse/core";

const { setNotificationHandler } = useNotifications("FrequentUpdate");

// Throttle: Execute at most once every 1 second
const throttledHandler = useThrottleFn((notif) => {
  updateUI(notif);
}, 1000);

// Debounce: Wait 500ms after last notification
const debouncedHandler = useDebounceFn((notif) => {
  batchUpdate(notif);
}, 500);

setNotificationHandler((notif) => {
  // Choose throttle or debounce based on use case
  if (notif.data.priority === "high") {
    throttledHandler(notif); // Immediate but rate-limited
  } else {
    debouncedHandler(notif); // Batch low-priority updates
  }
});
```

## See Also

- [subscribe-notifications.md](./subscribe-notifications.md) - Basic subscription patterns
- [notification-history.md](./notification-history.md) - Loading notification history
- [Notifications Service API](../../shared/components/notifications.md) - Toast notifications

**Reference:** [Official VC-Shell Documentation - useNotifications](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useNotifications/)
