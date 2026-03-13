<template>
  <VcDropdown
    :model-value="true"
    :items="notifications"
    :empty-text="t('COMPONENTS.NOTIFICATION_DROPDOWN.EMPTY')"
    max-height="auto"
    :padded="false"
    :close-on-click-outside="false"
  >
    <template #item="{ item }">
      <NotificationItem :notification="item" />
    </template>
  </VcDropdown>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount } from "vue";
import NotificationItem from "@shared/components/notification-dropdown/_internal/notification/notification.vue";
import { useI18n } from "vue-i18n";
import { useNotificationStore } from "@core/notifications";
import { VcDropdown } from "@ui/components/molecules/vc-dropdown";
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
