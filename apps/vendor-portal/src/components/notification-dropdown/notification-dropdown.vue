<template>
  <div
    class="notification-dropdown"
    @click="toggleNotificationsDrop"
    v-click-outside="
      () => {
        isDropdownVisible = false;
      }
    "
    :title="title"
  >
    <div
      :class="[
        'notification-dropdown__button',
        { 'notification-dropdown__button_accent': isAccent },
        {
          'notification-dropdown__button_active':
            isDropdownVisible && !$isMobile.value,
        },
      ]"
    >
      <VcIcon icon="fas fa-bell" size="xl"></VcIcon>
    </div>
    <div
      v-if="$isMobile.value && isDropdownVisible"
      class="notification-dropdown__overlay"
      @click.stop="toggleNotificationsDrop"
    ></div>
    <div
      class="notification-dropdown__drop"
      v-if="isDropdownVisible"
      :class="{
        'notification-dropdown__drop_mobile': $isMobile.value,
        'notification-dropdown__drop_mobile-visible':
          $isMobile.value && isDropdownVisible,
      }"
    >
      <div
        v-if="$isMobile.value"
        class="notification-dropdown__mobile-close vc-flex vc-flex-justify_end vc-flex-align_center vc-padding_l"
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
            class="notification-dropdown__notification"
            v-for="item in notifications"
            :key="`notification_${item.id}`"
          >
            <NotificationItem :notification="item"></NotificationItem>
          </div>
        </VcCol>
        <div
          class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding_l"
          v-else
        >
          {{ $t("SHELL.NOTIFICATIONS.EMPTY") }}
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, PropType, ref } from "vue";
import { PushNotification } from "@virtoshell/api-client";
import { useNotifications } from "@virtoshell/core";
import { IMenuItems } from "@virtoshell/ui";
import { ImportNew, ImportProfileSelector } from "../../modules/import";
import { ImportPushNotification } from "../../api_client";
import NotificationItem from "./_internal/notification/notification.vue";
import { ProductsList, ProductsEdit } from "../../modules/products";
import {
  IProductPushNotification,
  INewOrderPushNotification,
} from "../../types";
import { OrdersEdit, OrdersList } from "../../modules/orders";

const props = defineProps({
  isAccent: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: "",
  },

  items: {
    type: Array as PropType<IMenuItems[]>,
    default: () => [],
  },

  openPage: {
    type: Function,
    default: undefined,
  },

  closePage: {
    type: Function,
    default: undefined,
  },
});
const isDropdownVisible = ref(false);
const { loadFromHistory, notifications } = useNotifications();

onMounted(async () => {
  await loadFromHistory();
});

function toggleNotificationsDrop() {
  isDropdownVisible.value = !isDropdownVisible.value;
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
    await props.closePage(0);
    await props.closePage(1);
    props.openPage(0, {
      component: ImportProfileSelector,
      param: notification.profileId,
      componentOptions: {
        importJobId: notification.jobId,
      },
    });
    props.openPage(1, {
      component: ImportNew,
      param: notification.profileId,
      componentOptions: {
        importJobId: notification.jobId,
      },
    });
  } else if (
    (low.includes("product") ||
      notification.notifyType ===
        "PublicationRequestStatusChangedDomainEvent") &&
    "productId" in notification
  ) {
    await props.closePage(0);
    await props.closePage(1);
    props.openPage(0, {
      component: ProductsList,
      param: notification.productId,
    });
    props.openPage(1, {
      component: ProductsEdit,
      param: notification.productId,
    });
  } else if (
    (low.includes("order") ||
      notification.notifyType === "OrderCreatedEventHandler") &&
    "orderId" in notification
  ) {
    await props.closePage(0);
    await props.closePage(1);
    props.openPage(0, {
      component: OrdersList,
      param: notification.orderId,
    });
    props.openPage(1, {
      component: OrdersEdit,
      param: notification.orderId,
    });
  }
};
</script>

<style lang="less">
:root {
  --notification-color-error: #f14e4e;
}
.notification-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;

  &__overlay {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
    background: #808c99;
    opacity: 0.6;
  }

  &__drop {
    position: absolute;
    top: var(--app-bar-height);
    z-index: 9999;
    filter: drop-shadow(0px 4px 15px rgba(43, 67, 84, 0.15));
    background: #ffffff;
    border-radius: 0 0 6px 6px;
    width: 439px;
    max-height: 350px;
    min-height: 50px;
    right: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &_mobile {
      display: none;
      position: fixed;
      right: 0;
      top: 0;
      max-height: 100%;
      max-width: 300px;
      width: 100%;
      bottom: 0;
      z-index: 9999;
      border-radius: 0;

      &-visible {
        display: flex;
      }
    }
  }

  &__button {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--app-bar-button-width);
    border-left: 1px solid var(--app-bar-button-border-color);
    cursor: pointer;
    color: var(--app-bar-button-color);
    background-color: var(--app-bar-button-background-color);
    transition: color 0.2s ease;

    &:hover {
      color: var(--app-bar-button-color-hover);
      background-color: var(--app-bar-button-background-color-hover);
    }

    &_accent:before {
      content: "";
      display: block;
      position: absolute;
      right: 12px;
      top: 18px;
      width: 7px;
      height: 7px;
      background: #ff4a4a;
      border-radius: 50%;
      z-index: 1;
    }

    &_active {
      box-shadow: 0 -6px 6px white, 1px 1px 22px rgba(126, 142, 157, 0.2);
      clip-path: inset(0px -20px 0px -20px);
      background: #ffffff;
      z-index: 10000;
    }
  }

  &__notification {
    padding: 18px 15px;
    border-bottom: 1px solid #e3e7ec;
    cursor: pointer;

    &:last-of-type {
      border-bottom: none;
    }
  }

  &__mobile-close {
    color: #319ed4;
  }

  &__error {
    --hint-color: var(--notification-color-error);
  }
}
</style>
