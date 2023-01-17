<template>
  <slot name="title" v-bind:title="notificationTitle"></slot>
  <VcHint class="tw-mb-1" :style="{ color: variant }">{{
    notificationDescription
  }}</VcHint>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "@vc-shell/framework";
import { IProductPushNotification } from "../../../../../types";

export interface Props {
  notification: IProductPushNotification;
  variant: string;
}

const props = withDefaults(defineProps<Props>(), {
  notification: undefined,
  variant: "#A9BCCD",
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
