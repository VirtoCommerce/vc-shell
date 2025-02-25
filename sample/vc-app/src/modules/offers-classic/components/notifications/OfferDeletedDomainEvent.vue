<template>
  <VcNotificationTemplate
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
  </VcNotificationTemplate>
</template>

<script lang="ts" setup>
import { PushNotification } from "@vc-shell/framework";
export interface Props {
  notification: PushNotification;
}

defineProps<Props>();

defineOptions({
  inheritAttrs: false,
  notifyType: "OfferDeletedDomainEvent",
});

const notificationStyle = {
  color: "#F14E4E",
  icon: "fas fa-percentage",
};
</script>
