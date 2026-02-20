<template>
  <div
    class="vc-notification-item"
    @click="handleClick"
  >
    <div
      v-if="notification.isNew"
      class="vc-notification-item__unread-dot"
    />
    <div class="vc-notification-item__content">
      <component
        :is="currentTemplate"
        v-if="currentTemplate"
        v-bind="templateProps"
      />
      <NotificationTemplate
        v-else
        :title="notification.title ?? ''"
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
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { PushNotification } from "@core/api/platform";
import { NotificationTemplateConstructor } from "@core/types";
import { NotificationTemplate } from "@shared/components/notification-template";

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
</script>

<style lang="scss">
:root {
  --notification-unread-dot-color: var(--primary-500);
}

.vc-notification-item {
  @apply tw-flex tw-items-start tw-p-3 tw-w-full tw-gap-2 tw-cursor-pointer;

  &__unread-dot {
    @apply tw-w-2 tw-h-2 tw-rounded-full tw-shrink-0 tw-mt-1.5;
    background-color: var(--notification-unread-dot-color);
  }

  &__content {
    @apply tw-flex-1 tw-min-w-0;
  }
}
</style>
