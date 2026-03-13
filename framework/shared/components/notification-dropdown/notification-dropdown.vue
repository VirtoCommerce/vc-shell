<template>
  <div class="notification-dropdown">
    <VcScrollableContainer
      v-if="notifications.length"
      class="notification-dropdown__scroll"
    >
      <div
        v-for="(item, index) in notifications"
        :key="index"
      >
        <NotificationItem :notification="item" />
      </div>
    </VcScrollableContainer>
    <div
      v-else
      class="tw-flex tw-justify-center tw-items-center tw-p-4 tw-text-sm tw-text-[color:var(--neutrals-400)]"
    >
      {{ t('COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount } from "vue";
import NotificationItem from "@shared/components/notification-dropdown/_internal/notification/notification.vue";
import { useI18n } from "vue-i18n";
import { useNotificationStore } from "@core/notifications";
import { VcScrollableContainer } from "@ui/components/atoms/vc-scrollable-container";
import { orderBy } from "lodash-es";

const store = useNotificationStore();

const { t } = useI18n({ useScope: "global" });

const notifications = computed(() =>
  orderBy(store.history.value, ["created"], ["desc"]),
);

onBeforeUnmount(() => {
  if (store.history.value.some((x) => x.isNew)) {
    store.markAllAsRead();
  }
});
</script>

<style lang="scss">
// Make __content a flex container so the flex-1 chain works all the way down
.vc-dropdown-panel__content:has(> .notification-dropdown) {
  @apply tw-flex tw-flex-col tw-min-h-0;
}

.notification-dropdown {
  @apply tw-flex tw-flex-col tw-flex-1 tw-min-h-0 tw-overflow-hidden;

  &__scroll {
    @apply tw-flex-1 tw-min-h-0;
  }
}
</style>
