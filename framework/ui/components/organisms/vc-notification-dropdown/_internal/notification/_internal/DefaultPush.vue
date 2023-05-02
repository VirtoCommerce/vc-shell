<template>
  <slot
    name="title"
    v-bind:title="notification.title"
  ></slot>
  <VcHint
    class="tw-mb-1"
    v-if="notification.description"
    >{{ notification.description }}</VcHint
  >
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VcHint } from "./../../../../../";

export default defineComponent({
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
import { PushNotification } from "./../../../../../../../core/api";

export interface Props {
  notification: PushNotification;
}

defineProps<Props>();
</script>
