<template>
  <VcDropdown
    :model-value="true"
    :items="notifications"
    :empty-text="t('COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY')"
    max-height="auto"
    :padded="false"
  >
    <template #item="{ item }">
      <NotificationItem
        :notification="item"
        :templates="notificationTemplates || []"
      />
    </template>
  </VcDropdown>
</template>

<script lang="ts" setup>
import { inject, onBeforeUnmount } from "vue";
import NotificationItem from "@shared/components/notification-dropdown/_internal/notification/notification.vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@core/composables";
import { NotificationTemplatesSymbol } from "@framework/injection-keys";
import { VcDropdown } from "@ui/components";

const notificationTemplates = inject(NotificationTemplatesSymbol);

const { t } = useI18n({ useScope: "global" });
const { notifications, markAllAsRead } = useNotifications();

// Mark notifications as read when the panel closes (unmounts),
// so the user can see the unread state while browsing.
onBeforeUnmount(() => {
  if (notifications.value.some((x) => x.isNew)) {
    markAllAsRead();
  }
});
</script>

