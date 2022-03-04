<template>
  <slot name="title" v-bind:title="notification.title"></slot>
  <vc-hint class="vc-margin-bottom_xs" v-if="notification.profileName"
    >{{ $t("SHELL.NOTIFICATIONS.PROFILE") }}
    <b>{{ notification.profileName }}</b></vc-hint
  >
  <div v-if="notification.errors && notification.errors.length">
    <vc-hint class="notification-dropdown__error">
      {{ $t("SHELL.NOTIFICATIONS.ERRORS") }}:
      {{ notification.errors && notification.errors.length }}</vc-hint
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ImportPushNotification } from "../../../../../api_client";

export default defineComponent({
  name: "ImportPush",
  inheritAttrs: false,
  props: {
    notification: {
      type: Object as PropType<ImportPushNotification>,
      default: () => ({}),
    },
  },
});
</script>

<style lang="less" scoped></style>
