<template>
  <VcNotificationTemplate
    :color="notificationStyle.color.value"
    :title="notificationTitle"
    :icon="notificationStyle.icon"
    @click="onClick"
  >
    <VcHint
      class="tw-mb-1"
      :style="{ color: variant }"
      >{{ notificationDescription }}</VcHint
    >
  </VcNotificationTemplate>
</template>

<script lang="ts" setup>
import { useBladeNavigation } from "@vc-shell/framework";
import { IProductPushNotification } from "./../../../../types";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface Props {
  notification: IProductPushNotification;
  variant: string;
}

export interface Emits {
  (event: "notificationClick"): void;
}

const props = withDefaults(defineProps<Props>(), {
  notification: undefined,
  variant: "#A9BCCD",
});

const emit = defineEmits<Emits>();

defineOptions({
  inheritAttrs: false,
  notifyType: "PublicationRequestStatusChangedDomainEvent",
});

const { openBlade, resolveBladeByName } = useBladeNavigation();

const { t } = useI18n({ useScope: "global" });

const notificationTitle = computed(() => {
  return `${t("PRODUCTS.PUSH.PRODUCT")} "${props.notification.productName}" ${t("PRODUCTS.PUSH.UPDATE")}`;
});

const notificationDescription = computed(() => {
  return `${props.notification.newStatus}. ${t("PRODUCTS.PUSH.MORE_DETAILS")}`;
});

const notificationStyle = computed(() => ({
  color: computed(() => {
    const notification = props.notification;
    switch (notification.newStatus) {
      case "RequestChanges":
        return "#F14E4E";
      case "Approved":
        return "#87B563";
      case "WaitForApproval":
        return "#f89406";
      case "Rejected":
        return "#F14E4E";
      case "HasStagedChanges":
        return "#f89406";
      case "Published":
        return "#87B563";
      default:
        return "#A9BCCD";
    }
  }),
  icon: "fas fa-box-open",
}));

function onClick() {
  if (props.notification.notifyType === "PublicationRequestStatusChangedDomainEvent") {
    emit("notificationClick");
    openBlade({
      blade: resolveBladeByName("ProductsList"),
      param: props.notification.productId,
    });
  }
}
</script>
