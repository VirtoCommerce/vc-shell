<template>
  <NotificationTemplate
    :color="notificationStyle.color.value"
    :title="notificationTitle"
    :icon="notificationStyle.icon"
    :notification="notification"
    @click="onClick"
  >
    <VcHint
      class="tw-mb-1"
      :style="{ color: variant }"
      >{{ notificationDescription }}</VcHint
    >
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { PushNotification, useBladeNavigation, NotificationTemplate } from "@vc-shell/framework";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface Props {
  notification: IProductPushNotification;
  variant: string;
}

export interface Emits {
  (event: "notificationClick"): void;
}

interface IProductPushNotification extends PushNotification {
  profileName?: string;
  newStatus?: string;
  productId?: string;
  productName?: string;
}

const props = withDefaults(defineProps<Props>(), {
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
        return "var(--danger-400)";
      case "Approved":
        return "var(--success-400)";
      case "WaitForApproval":
        return "var(--warning-600)";
      case "Rejected":
        return "var(--danger-400)";
      case "HasStagedChanges":
        return "var(--warning-600)";
      case "Published":
        return "var(--success-400)";
      default:
        return "var(--secondary-200)";
    }
  }),
  icon: "fas fa-box-open",
}));

async function onClick() {
  if (props.notification.notifyType === "PublicationRequestStatusChangedDomainEvent") {
    emit("notificationClick");
    await openBlade(
      {
        blade: resolveBladeByName("Products"),
        param: props.notification.productId,
      },
      true,
    );
    await openBlade({
      blade: resolveBladeByName("Product"),
      param: props.notification.productId,
    });
  }
}
</script>
