<template>
  <slot name="title" v-bind:title="notificationTitle"></slot>
  <vc-hint class="vc-margin-bottom_xs" :style="{ color: variant }">{{
    notificationDescription
  }}</vc-hint>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { useI18n } from "@virtoshell/core";
import { IProductPushNotification } from "../../../../../types";

export default defineComponent({
  name: "ProductPush",
  props: {
    notification: {
      type: Object as PropType<IProductPushNotification>,
      default: () => ({}),
    },
    variant: {
      type: String,
      default: "#A9BCCD",
    },
  },
  setup(props) {
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

    return {
      notificationTitle,
      notificationDescription,
    };
  },
});
</script>

<style lang="less" scoped></style>
