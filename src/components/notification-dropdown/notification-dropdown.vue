<template>
  <div
    class="relative flex items-center h-full"
    @click.stop="toggleNotificationsDrop"
    v-click-outside="
      () => {
        isDropdownVisible = false;
      }
    "
    :title="title"
  >
    <div
      :class="[
        'relative h-full flex items-center justify-center w-[var(--app-bar-button-width)] border-l border-solid border-l-[color:var(--app-bar-button-border-color)] cursor-pointer text-[color:var(--app-bar-button-color)] bg-[color:var(--app-bar-button-background-color)] transition-[color] duration-200 hover:text-[color:var(--app-bar-button-color-hover)] hover:bg-[color:var(--app-bar-button-background-color-hover)]',
        {
          'before:content-[``] before:block before:absolute before:right-[12px] before:top-[18px] before:w-[7px] before:h-[7px] before:bg-[#ff4a4a] before:rounded-full before:z-[1]':
            isAccent,
        },
        {
          'shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] [clip-path:inset(0px_-20px_0px_-20px)] bg-white z-[10000]':
            isDropdownVisible && !$isMobile.value,
        },
      ]"
    >
      <VcIcon icon="fas fa-bell" size="xl"></VcIcon>
    </div>
    <div
      v-if="$isMobile.value && isDropdownVisible"
      class="fixed left-0 top-0 right-0 bottom-0 z-[9999] bg-[#808c99] opacity-60"
      @click.stop="toggleNotificationsDrop"
    ></div>
    <div
      class="absolute top-[var(--app-bar-height)] z-[9999] drop-shadow-[0px_4px_15px_rgba(43,67,84,0.15)] bg-white rounded-b-[6px] w-[439px] max-h-[350px] min-h-[50px] right-0 overflow-hidden flex flex-col z-[10000]"
      v-if="isDropdownVisible"
      :class="{
        'hidden !fixed !right-0 !top-0 !max-h-full !max-w-[300px] !w-full !bottom-0 !z-[9999] !border-0':
          $isMobile.value,
        '!flex': $isMobile.value && isDropdownVisible,
      }"
    >
      <div
        v-if="$isMobile.value"
        class="text-[#319ed4] flex justify-end items-center p-4"
      >
        <VcIcon
          icon="fas fa-times"
          size="xl"
          @click.stop="isDropdownVisible = false"
        ></VcIcon>
      </div>
      <VcContainer :noPadding="true" @click.stop>
        <VcCol v-if="notifications && notifications.length">
          <div
            @click="handleClick(item)"
            class="py-[18px] px-[15px] border-b border-solid border-b-[#e3e7ec] cursor-pointer last-of-type:border-b-0"
            v-for="item in notifications"
            :key="`notification_${item.id}`"
          >
            <NotificationItem :notification="item"></NotificationItem>
          </div>
        </VcCol>
        <div class="flex justify-center items-center p-4" v-else>
          {{ $t("SHELL.NOTIFICATIONS.EMPTY") }}
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, shallowRef } from "vue";
import {PushNotification, useBladeNavigation} from "@vc-shell/framework";
import { useNotifications } from "@vc-shell/framework";
import { IMenuItems } from "@vc-shell/framework";
import { ImportNew, ImportProfileSelector } from "../../modules/import";
import { ImportPushNotification } from "../../api_client/marketplacevendor";
import NotificationItem from "./_internal/notification/notification.vue";
import { ProductsList, ProductsEdit } from "../../modules/products";
import {
  IProductPushNotification,
  INewOrderPushNotification,
} from "../../types";
import { OrdersEdit, OrdersList } from "../../modules/orders";

export interface Props {
    isAccent: boolean,
    title: string,
}

const props = withDefaults(defineProps<Props>(), {
    isAccent: false,
    title: '',
})

const isDropdownVisible = ref(false);
const { loadFromHistory, notifications, markAllAsRead } = useNotifications();
const {openBlade, closeBlade} = useBladeNavigation()

onMounted(async () => {
  await loadFromHistory();
});

function toggleNotificationsDrop() {
  isDropdownVisible.value = !isDropdownVisible.value;
  if (isDropdownVisible.value && notifications.value.some((x) => x.isNew)) {
    markAllAsRead();
  }
}

const handleClick = async (
  notification:
    | PushNotification
    | ImportPushNotification
    | IProductPushNotification
    | INewOrderPushNotification
) => {
  const low = notification.notifyType.toLowerCase();
  isDropdownVisible.value = false;

  // TODO need to discuss on arch meeting
  if (low.includes("import") && "profileId" in notification) {
    await closeBlade(0);
    openBlade(
      {
        parentBlade: shallowRef(ImportProfileSelector),
        component: shallowRef(ImportNew),
        param: notification.profileId,
        bladeOptions: {
          importJobId: notification.jobId,
        },
      },
      1
    );
  } else if (
    (low.includes("product") ||
      notification.notifyType ===
        "PublicationRequestStatusChangedDomainEvent") &&
    "productId" in notification
  ) {
    await closeBlade(0);
    openBlade(
      {
        parentBlade: shallowRef(ProductsList),
        component: shallowRef(ProductsEdit),
        param: notification.productId,
      },
      1
    );
  } else if (
    (low.includes("order") ||
      notification.notifyType === "OrderCreatedEventHandler") &&
    "orderId" in notification
  ) {
    await closeBlade(0);
    openBlade(
      {
        parentBlade: shallowRef(OrdersList),
        component: shallowRef(OrdersEdit),
        param: notification.orderId,
      },
      1
    );
  }
};
</script>

<style lang="scss">
:root {
  --notification-color-error: #f14e4e;
}
</style>
