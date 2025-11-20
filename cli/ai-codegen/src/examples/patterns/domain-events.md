---
id: domain-events
type: PATTERN
complexity: MODERATE
category: pattern
tags: [pattern]
critical: true
title: "Domain Events"
description: "Domain Events pattern"
---

# Domain Events Pattern (Push Notifications)

This example shows the **correct** way to handle domain events (push notifications) in VC-Shell framework using `useNotifications` composable and `defineOptions`.

## Overview

VC-Shell uses **SignalR** for real-time push notifications from the backend. There are two approaches:

1. **Global App Subscription** - `defineOptions({ notifyType })` makes notifications available app-wide in notification center
2. **Blade-Specific Handling** - `useNotifications(notifyType)` creates local subscription for blade-specific toasts

**Key Difference**: `defineOptions` affects **entire app**, `useNotifications` only affects **current blade**.

## Pattern 1: Global App Subscription

### Use when: Notifications are important for entire application

```typescript
// offers-list.vue
<script setup lang="ts">
import { useOffers } from '../composables';

// ✅ Global subscription - makes OfferDeletedDomainEvent available app-wide
defineOptions({
  name: "Offers",
  url: "/offers",
  notifyType: "OfferDeletedDomainEvent",  // App-wide subscription
  isWorkspace: true,
});

const { offers, loading, loadOffers } = useOffers();

// No additional code needed!
// Notifications appear in global notification center (app bar)
</script>
```

**What happens:**
- Notifications appear in global app bar notification center
- Available throughout entire application
- Can use custom templates to display them
- NO automatic reload - just makes notifications available

### Multiple Notification Types

```typescript
defineOptions({
  name: "Products",
  url: "/products",
  // Subscribe app to multiple types
  notifyType: ["ProductCreatedDomainEvent", "ProductDeletedDomainEvent", "ProductUpdatedDomainEvent"],
});
```

## Pattern 2: Blade-Specific Toast Notifications

### Use when: Need immediate toast feedback only in current blade

```typescript
// offers-list.vue
<script setup lang="ts">
import { useNotifications, notification } from '@vc-shell/framework';
import { useOffers } from '../composables';

defineOptions({
  name: "Offers",
  url: "/offers",
  // No notifyType - not subscribing app globally
});

const { offers, loadOffers, removeOffer } = useOffers();

// ✅ Local subscription - only affects THIS blade
const { setNotificationHandler } = useNotifications("OfferDeletedDomainEvent");

// Handle notifications with blade-specific toasts
setNotificationHandler((notif: PushNotification) => {
  const offerId = notif.id;

  // Show toast (only visible in this blade)
  notification.info(t('OFFERS.DELETED', { name: notif.title }));

  // Custom logic: update local data
  removeOffer(offerId);
});
</script>
```

### Multiple Event Types with Custom Logic

```typescript
const { setNotificationHandler } = useNotifications([
  "OfferCreatedDomainEvent",
  "OfferDeletedDomainEvent",
  "OfferUpdatedDomainEvent"
]);

setNotificationHandler((notif: PushNotification) => {
  switch (notif.notifyType) {
    case "OfferCreatedDomainEvent":
      notification.success(t('OFFERS.CREATED'));
      loadOffers();  // Reload list
      break;

    case "OfferDeletedDomainEvent":
      notification.info(t('OFFERS.DELETED'));
      removeOffer(notif.id);  // Remove from local list
      break;

    case "OfferUpdatedDomainEvent":
      notification.info(t('OFFERS.UPDATED'));
      updateOfferInList(notif.id, notif.data);
      break;
  }
});
```

## Pattern 3: Combined Approach

```typescript
// ✅ Global subscription - important events available app-wide
defineOptions({
  name: "Offers",
  url: "/offers",
  notifyType: ["OfferCreatedDomainEvent", "OfferDeletedDomainEvent"],  // Global
});

// ✅ PLUS local subscription for blade-specific toast feedback
const { setNotificationHandler } = useNotifications(["OfferProcessingStarted", "OfferProcessingCompleted"]);

// Handle local events with immediate toasts (only in this blade)
setNotificationHandler((notif: PushNotification) => {
  switch (notif.notifyType) {
    case "OfferProcessingStarted":
      notification.info('Processing started...');
      updateProcessingStatus(notif.data.offerId, 'processing');
      break;

    case "OfferProcessingCompleted":
      notification.success('Processing completed!');
      updateProcessingStatus(notif.data.offerId, 'completed');
      break;
  }
});
```

## Pattern 4: Custom Notification Templates (Global)

Create custom display templates for globally subscribed notifications:

```vue
<!-- OfferNotificationTemplate.vue -->
<template>
  <NotificationTemplate
    :title="notificationTitle"
    :notification="notification"
    icon="material-sell"
    color="var(--primary-500)"
    @click="handleClick"
  >
    <div class="offer-notification">
      <p>Offer: {{ notification.data.offerName }}</p>
      <p class="status">Status: {{ notification.data.status }}</p>
      <VcButton
        size="sm"
        variant="secondary"
        @click.stop="viewOffer"
      >
        View Offer
      </VcButton>
    </div>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { NotificationTemplate } from '@vc-shell/framework';
import { useRouter } from 'vue-router';

interface Props {
  notification: PushNotification;
}

const props = defineProps<Props>();
const router = useRouter();

// ✅ This template is for globally subscribed notifications
defineOptions({
  notifyType: "OfferStatusChanged"
});

const notificationTitle = computed(() =>
  `Offer ${props.notification.data.offerName} Updated`
);

function viewOffer() {
  router.push(`/offers/${props.notification.data.offerId}`);
}
</script>
```

Register template in module:

```typescript
// src/modules/offers/index.ts
import { createAppModule } from '@vc-shell/framework';
import OfferNotificationTemplate from './components/OfferNotificationTemplate.vue';

export default createAppModule(
  { /* pages */ },
  { /* locales */ },
  {
    OfferNotification: OfferNotificationTemplate  // Register template
  }
);
```

## Complete Example

```typescript
// offers-list.vue
<template>
  <VcBlade
    :title="$t('OFFERS.TITLE')"
    :toolbar-items="bladeToolbar"
    :loading="loading"
    @close="$emit('close:blade')"
  >
    <VcTable
      :items="offers"
      :columns="columns"
      @item-click="onItemClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotifications, notification } from '@vc-shell/framework';
import { useOffers } from '../composables';
import { useI18n } from 'vue-i18n';

// Global subscription - makes these available app-wide in notification center
defineOptions({
  name: "Offers",
  url: "/offers",
  notifyType: ["OfferCreatedDomainEvent", "OfferDeletedDomainEvent"],
  isWorkspace: true,
});

const { t } = useI18n();
const { offers, loading, loadOffers, removeOffer, updateOffer } = useOffers();

// Local subscription for blade-specific toast feedback
const { setNotificationHandler, markAsRead } = useNotifications("OfferDeletedDomainEvent");

setNotificationHandler((notif: PushNotification) => {
  const offerId = notif.id;

  // Show blade-specific toast
  notification.info(t('OFFERS.NOTIFICATION.DELETED', { name: notif.title }));

  // Optimistic update
  const removed = removeOffer(offerId);

  if (removed) {
    markAsRead(notif);
  } else {
    // Not in current page - reload to sync
    loadOffers();
  }
});

onMounted(() => {
  loadOffers();
});

defineExpose({
  reload: loadOffers
});
</script>
```

## When to Use Each Approach

### Use Global Subscription (`defineOptions` + `notifyType`) when:
- ✅ Notifications are important for entire application
- ✅ Want notifications in global notification center
- ✅ Multiple parts of app need to be aware of events
- ✅ Want to create custom notification templates
- ✅ Notifications should persist in notification dropdown

### Use Local Subscription (`useNotifications(notifyType)`) when:
- ✅ Need immediate toast feedback specific to current blade
- ✅ Notifications only relevant to current blade's context
- ✅ Want to handle notifications without affecting global state
- ✅ Need custom logic specific to blade's workflow
- ✅ Toasts should only show when blade is active

### Use Both when:
- ✅ Want global persistence + immediate blade-specific feedback
- ✅ Important events need app-wide tracking + local toasts
- ✅ Different notification types have different purposes

## ❌ WRONG: Manual window.addEventListener

```typescript
// ❌ DON'T DO THIS - VC-Shell uses SignalR, not custom window events
function onOfferDeleted(event: Event) {  // ❌ Won't receive SignalR notifications!
  const customEvent = event as CustomEvent;
  console.log(customEvent.detail);
}

onMounted(() => {
  window.addEventListener("OfferDeletedDomainEvent", onOfferDeleted);  // ❌ WRONG!
});
```

**Why it's wrong:**
- VC-Shell uses SignalR WebSocket for push notifications
- Events are NOT dispatched via `window.dispatchEvent`
- Use `useNotifications` composable instead

## INotifications Interface

```typescript
interface INotifications {
  // All notifications (global list)
  readonly notifications: ComputedRef<PushNotification[]>;

  // Filtered notifications (matching notifyType)
  readonly moduleNotifications: ComputedRef<PushNotification[]>;

  // Load notification history from backend
  loadFromHistory(take?: number): Promise<void>;

  // Add local notification (client-side only)
  addNotification(message: PushNotification): void;

  // Mark notification as read (updates backend)
  markAsRead(message: PushNotification): void;

  // Mark all notifications as read (updates backend)
  markAllAsRead(): Promise<void>;

  // Set handler for new notifications of specified type
  setNotificationHandler(handler: (notification: PushNotification) => void): void;
}
```

## Decision Tree

```
Need to handle domain events?
│
├─ Should appear in global notification center?
│  └─ ✅ Use defineOptions({ notifyType: "EventName" })
│
├─ Need blade-specific toast feedback?
│  └─ ✅ Use useNotifications("EventName") + setNotificationHandler()
│
├─ Need both global persistence + local toasts?
│  └─ ✅ Use both defineOptions + useNotifications
│
└─ Custom notification template in center?
   └─ ✅ defineOptions({ notifyType }) + create template component
```

## Summary

| Pattern | Scope | Use Case | Code |
|---------|-------|----------|------|
| **Global subscription** | App-wide | Notification center | `defineOptions({ notifyType })` |
| **Local subscription** | Blade-only | Toast feedback | `useNotifications(type)` |
| **Combined** | Both | Persistence + toasts | Both patterns |
| **Custom template** | App-wide display | Rich notifications | Template component + register |

## Key Points

1. ✅ `defineOptions({ notifyType })` = **global** app-wide subscription (notification center)
2. ✅ `useNotifications(notifyType)` = **local** blade-specific subscription (toasts)
3. ✅ **NO automatic reload** - you must implement reload logic yourself
4. ✅ Use `setNotificationHandler()` for custom logic
5. ✅ Call `markAsRead()` after handling notification
6. ❌ **NEVER** use `window.addEventListener` for domain events
7. ⚠️ `useNotifications` is for **push notifications** (WebSocket/SignalR), NOT toast messages
8. ⚠️ For toast messages (user feedback), use `notification.success/error/warning/info()` utility

## Distinction: Push Notifications vs Toast Notifications

```typescript
// ❌ WRONG: Using useNotifications() for toast messages
const notifications = useNotifications();
notifications.success("Saved!");  // ❌ ERROR: Property 'success' does not exist!

// ✅ CORRECT: Use notification utility for toasts
import { notification } from '@vc-shell/framework';
notification.success("Saved!");  // ✅ Works!

// ✅ CORRECT: Use useNotifications for domain events
const { setNotificationHandler } = useNotifications("OfferDeleted");
setNotificationHandler((notif) => {
  notification.info(t('OFFER_DELETED'));  // ✅ Show toast
  removeOffer(notif.id);  // ✅ Update data
});
```

## Related

- [useNotifications API Reference](../composables/useNotifications.md)
- [Working with Push Notifications Guide](https://docs.vc-shell.dev/guides/push-notifications)
- For **toast notifications** (user feedback): Use `notification` utility, NOT `useNotifications`
