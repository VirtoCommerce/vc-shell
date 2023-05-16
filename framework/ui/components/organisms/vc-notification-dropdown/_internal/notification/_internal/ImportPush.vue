<template>
  <slot
    name="title"
    :title="notification.title"
  ></slot>
  <VcHint
    v-if="notification.profileName"
    class="tw-mb-1"
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
import { defineComponent } from "vue";
import { VcHint } from "./../../../../../";
import { IImportPush } from "./../../../../../../../core/types";

export default defineComponent({
  inheritAttrs: false,
});
</script>
<script lang="ts" setup>
export interface Props {
  notification: IImportPush;
}

defineProps<Props>();
</script>
