<template>
  <slot
    name="title"
    v-bind:title="notificationTitle"
  ></slot>
  <VcHint
    class="tw-mb-1"
    :style="{ color: variant }"
    >{{ notificationDescription }}</VcHint
  >
</template>

<script lang="ts" setup>
import { PushNotification } from "./../../../../../../../core/api";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { VcHint } from "./../../../../../";

export interface ProductPush extends PushNotification {
  productName: string;
  newStatus: string;
}

export interface Props {
  notification: ProductPush;
  variant: string;
}

const props = withDefaults(defineProps<Props>(), {
  notification: undefined,
  variant: "#A9BCCD",
});

const { t } = useI18n({ useScope: "global" });
const notificationTitle = computed(() => {
  return `${t("COMPONENTS.ORGANISMS.VC_NOTIFICATION_DROPDOWN.PRODUCT_PUSH.PRODUCT")} "${
    props.notification.productName
  }" ${t("COMPONENTS.ORGANISMS.VC_NOTIFICATION_DROPDOWN.PRODUCT_PUSH.UPDATE")}`;
});

const notificationDescription = computed(() => {
  return `${props.notification.newStatus}. ${t(
    "COMPONENTS.ORGANISMS.VC_NOTIFICATION_DROPDOWN.PRODUCT_PUSH.MORE_DETAILS"
  )}`;
});
</script>
