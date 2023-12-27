<template>
  <NotificationTemplate
    :color="notificationStyle.color.value"
    :title="notification.title"
    :icon="notificationStyle.icon"
    :notification="notification"
    @click="onClick"
  >
    <VcHint
      v-if="notification.profileName"
      class="tw-mb-1"
      >{{ $t("IMPORT.PUSH.PROFILE") }} <b>{{ notification.profileName }}</b></VcHint
    >
    <div v-if="notification.errors && notification.errors.length">
      <VcHint> {{ $t("IMPORT.PUSH.ERRORS") }}: {{ notification.errors && notification.errors.length }}</VcHint>
    </div>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { useBladeNavigation, NotificationTemplate } from "@vc-shell/framework";
import { ImportPushNotification } from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed } from "vue";

export interface Props {
  notification: ImportPushNotification;
}

export interface Emits {
  (event: "notificationClick"): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

defineOptions({
  inheritAttrs: false,
  notifyType: "ImportPushNotification",
});

const { openBlade, resolveBladeByName } = useBladeNavigation();

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

async function onClick() {
  if (props.notification.notifyType === "ImportPushNotification") {
    emit("notificationClick");
    await openBlade(
      {
        blade: resolveBladeByName("ImportProfileSelector"),
        param: props.notification.profileId,
        options: {
          importJobId: props.notification.jobId,
        },
      },
      true,
    );
  }
}
</script>
