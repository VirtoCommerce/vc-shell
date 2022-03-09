<template>
  <slot name="title" v-bind:title="notification.title"></slot>
  <vc-hint class="vc-margin-bottom_xs" v-if="notification.description">{{
    notification.description
  }}</vc-hint>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "DefaultPush",
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { PushNotification } from "@virtoshell/api-client";

defineProps({
  notification: {
    type: Object as PropType<PushNotification>,
    default: () => ({}),
  },
});
</script>

<style lang="less" scoped></style>
