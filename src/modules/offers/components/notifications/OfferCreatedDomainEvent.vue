<template>
  <NotificationTemplate
    :color="notificationStyle.color"
    :title="notification.title"
    :icon="notificationStyle.icon"
    :notification="notification"
  >
    <VcHint
      v-if="notification.description"
      class="tw-mb-1"
      >{{ notification.description }}</VcHint
    >
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { PushNotification, NotificationTemplate } from "@vc-shell/framework";
export interface Props {
  notification: PushNotification;
}

defineProps<Props>();

defineOptions({
  inheritAttrs: false,
  notifyType: "OfferCreatedDomainEvent",
});

const notificationStyle = {
  color: "#87b563",
  icon: "fas fa-percentage",
};
</script>
