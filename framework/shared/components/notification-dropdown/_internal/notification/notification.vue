<template>
  <div class="tw-flex">
    <VcRow class="tw-justify-between tw-grow tw-basis-0">
      <template v-if="currentTemplate">
        <notificationTemplateRenderer />
      </template>
      <template v-else>
        <NotificationTemplate
          :color="notificationStyle.color"
          :title="notification.title ?? ''"
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
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from "vue";
import { PushNotification } from "./../../../../../core/api/platform";
import { VcRow } from "./../../../../../ui/components";
import { NotificationTemplate } from "./../../../notification-template";
import { NotificationTemplateConstructor } from "../../../../../core/types";

export interface Props {
  notification: PushNotification;
  templates: NotificationTemplateConstructor[];
}

export interface Emits {
  (event: "onClick"): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const notificationStyle = computed(() => ({
  color: "var(--notification-icon-color)",
  icon: "fas fa-info",
}));

const currentTemplate = computed(() => props.templates?.find((x) => x?.notifyType === props.notification.notifyType));

function notificationTemplateRenderer() {
  const notificationTemplate = currentTemplate.value;

  return (
    notificationTemplate &&
    h(notificationTemplate, { notification: props.notification, onNotificationClick: () => emit("onClick") })
  );
}
</script>

<style lang="scss">
:root {
  --notification-icon-color: var(--secondary-600);
}
</style>
