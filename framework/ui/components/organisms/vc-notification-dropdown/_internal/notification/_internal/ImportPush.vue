<template>
  <slot
    name="title"
    v-bind:title="notification.title"
  ></slot>
  <VcHint
    class="tw-mb-1"
    v-if="notification.profileName"
    >{{ $t("COMPONENTS.ORGANISMS.VC_NOTIFICATION_DROPDOWN.IMPORT_PUSH.PROFILE") }}
    <b>{{ notification.profileName }}</b></VcHint
  >
  <div v-if="notification.errors && notification.errors.length">
    <VcHint>
      {{ $t("COMPONENTS.ORGANISMS.VC_NOTIFICATION_DROPDOWN.IMPORT_PUSH.ERRORS") }}:
      {{ notification.errors && notification.errors.length }}</VcHint
    >
  </div>
</template>

<script lang="ts">
import { PushNotification } from "./../../../../../../../core/api";
import { defineComponent } from "vue";
import { VcHint } from "./../../../../../";

export default defineComponent({
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
export interface ImportPush extends PushNotification {
  profileName: string;
  errors: Record<string, unknown>[];
}

export interface Props {
  notification: ImportPush;
}

defineProps<Props>();
</script>
