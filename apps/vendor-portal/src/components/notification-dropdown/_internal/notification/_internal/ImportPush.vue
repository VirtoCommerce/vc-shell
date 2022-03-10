<template>
  <slot name="title" v-bind:title="notification.title"></slot>
  <VcHint class="vc-margin-bottom_xs" v-if="notification.profileName"
    >{{ $t("SHELL.NOTIFICATIONS.PROFILE") }}
    <b>{{ notification.profileName }}</b></VcHint
  >
  <div v-if="notification.errors && notification.errors.length">
    <VcHint class="notification-dropdown__error">
      {{ $t("SHELL.NOTIFICATIONS.ERRORS") }}:
      {{ notification.errors && notification.errors.length }}</VcHint
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { ImportPushNotification } from "../../../../../api_client";

defineProps({
  notification: {
    type: Object as PropType<ImportPushNotification>,
    default: () => ({}),
  },
});
</script>

<style lang="less" scoped></style>
