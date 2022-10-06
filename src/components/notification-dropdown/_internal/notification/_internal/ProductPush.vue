<template>
  <slot name="title" v-bind:title="notificationTitle"></slot>
  <VcHint class="mb-1" :style="{ color: variant }">{{
    notificationDescription
  }}</VcHint>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import { useI18n } from "@vc-shell/core";
import { IProductPushNotification } from "../../../../../types";

const props = defineProps({
  notification: {
    type: Object as PropType<IProductPushNotification>,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: "#A9BCCD",
  },
});
const { t } = useI18n();
const notificationTitle = computed(() => {
  return `${t("SHELL.NOTIFICATIONS.TITLE.PRODUCT.TITLE")} "${
    props.notification.productName
  }" ${t("SHELL.NOTIFICATIONS.TITLE.PRODUCT.UPDATE")}`;
});

const notificationDescription = computed(() => {
  return `${props.notification.newStatus}. ${t(
    "SHELL.NOTIFICATIONS.TITLE.PRODUCT.MORE_DETAILS"
  )}`;
});
</script>
