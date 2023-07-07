<template>
  <div class="tw-flex">
    <VcRow class="tw-justify-between tw-grow tw-basis-0">
      <template v-if="currentTemplate">
        <notificationTemplateRenderer />
      </template>
      <template v-else>
        <VcNotificationTemplate
          :color="notificationStyle.color"
          :title="notification.title"
          :icon="notificationStyle.icon"
        >
          <VcHint
            v-if="notification.description"
            class="tw-mb-1"
            >{{ notification.description }}</VcHint
          >
        </VcNotificationTemplate>
      </template>
      <div class="tw-flex tw-shrink-0">
        <p class="tw-text-s tw-leading-[18px] tw-text-[#8e8e8e] tw-m-0">
          {{ pushTime }}
        </p>
      </div>
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from "vue";
import moment from "moment";
import { PushNotification } from "./../../../../../../core/api/platform";
import { VcRow, VcNotificationTemplate } from "./../../../../";
import { NotificationTemplateConstructor } from "./../../../../../../core/types";

export interface Props {
  notification: PushNotification;
  templates: NotificationTemplateConstructor[];
}

const props = withDefaults(defineProps<Props>(), {
  notification: undefined,
});

const locale = window.navigator.language;

const notificationStyle = computed(() => ({
  color: "#A9BCCD",
  icon: "fas fa-info",
}));

const pushTime = computed(() => {
  return moment(props.notification.created).locale(locale).format("L LT");
});

const currentTemplate = computed(() => props.templates?.find((x) => x?.notifyType === props.notification.notifyType));

function notificationTemplateRenderer() {
  const notificationTemplate = currentTemplate.value;

  return notificationTemplate && h(notificationTemplate, { notification: props.notification });
}
</script>
