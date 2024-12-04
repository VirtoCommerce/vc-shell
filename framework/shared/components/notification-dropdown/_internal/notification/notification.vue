<template>
  <div class="tw-flex">
    <VcRow class="tw-justify-between tw-grow tw-basis-0 !tw-flex">
      <div @click="handleClick">
        <component
          :is="currentTemplate"
          v-if="currentTemplate"
          v-bind="templateProps"
        />
        <NotificationTemplate
          v-else
          :color="notificationStyle.color"
          :title="notification.title ?? ''"
          :icon="notificationStyle.icon"
          :notification="notification"
        >
          <VcHint
            v-if="notification.description"
            class="tw-mb-1"
          >
            {{ notification.description }}
          </VcHint>
        </NotificationTemplate>
      </div>
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { PushNotification } from "./../../../../../core/api/platform";
import { NotificationTemplateConstructor } from "../../../../../core/types";
import { NotificationTemplate } from "../../../notification-template";

export interface Props {
  notification: PushNotification;
  templates: NotificationTemplateConstructor[];
}

export interface Emits {
  (event: "onClick", notification: PushNotification): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentTemplate = computed(() => props.templates?.find((x) => x?.notifyType === props.notification.notifyType));

const templateProps = computed(() => ({
  notification: props.notification,
}));

const handleClick = () => {
  emit("onClick", props.notification);
};

const notificationStyle = computed(() => ({
  color: "var(--notification-icon-color)",
  icon: "fas fa-info",
}));
</script>

<style lang="scss">
:root {
  --notification-icon-color: var(--secondary-600);
}
</style>
