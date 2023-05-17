<template>
  <VcNotificationTemplate
    :color="notificationStyle.color.value"
    :title="notification.title"
    :icon="notificationStyle.icon"
  >
    <VcHint
      v-if="notification.profileName"
      class="tw-mb-1"
      >{{ $t("IMPORT.PUSH.PROFILE") }} <b>{{ notification.profileName }}</b></VcHint
    >
    <div v-if="notification.errors && notification.errors.length">
      <VcHint> {{ $t("IMPORT.PUSH.ERRORS") }}: {{ notification.errors && notification.errors.length }}</VcHint>
    </div>
  </VcNotificationTemplate>
</template>

<script lang="ts" setup>
import { ImportPushNotification } from "./../../../../api_client/marketplacevendor";
import { computed } from "vue";
export interface Props {
  notification: ImportPushNotification;
}

const props = defineProps<Props>();

defineOptions({
  inheritAttrs: false,
  notifyType: "ImportPushNotification",
});

const notificationStyle = computed(() => ({
  color: computed(() => {
    const notification = props.notification;
    return notification.finished && !(notification.errors && notification.errors.length)
      ? "#87b563"
      : !(notification.errors && notification.errors.length) && !notification.finished
      ? "#A9BCCD"
      : "#F14E4E";
  }),
  icon: "fas fa-download",
}));
</script>
