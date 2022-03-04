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
      <vc-icon icon="fas fa-bell" size="xl"></vc-icon>
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
        <vc-icon
          icon="fas fa-times"
          size="xl"
          @click.stop="isDropdownVisible = false"
        ></vc-icon>
      </div>
      <vc-container :noPadding="true" @click.stop>
        <vc-col v-if="populatedList && populatedList.length">
          <div
            @click="handleClick(item)"
            class="notification-dropdown__notification"
            v-for="item in populatedList"
            :key="`notification_${item.id}`"
          >
            <div class="vc-flex">
              <div
                class="notification-dropdown__notification-icon vc-margin-right_l"
                :style="{ 'background-color': item.params.color }"
              >
                <vc-icon :icon="item.params.icon" size="l"></vc-icon>
              </div>

              <vc-row class="vc-flex-justify_space-between vc-flex-grow_1">
                <div class="notification-dropdown__notification-info">
                  <p
                    class="notification-dropdown__notification-title vc-margin_none vc-margin-bottom_xs"
                  >
                    {{ item.title }}
                  </p>
                  <vc-hint
                    class="vc-margin-bottom_xs"
                    v-if="item.description"
                    >{{ item.description }}</vc-hint
                  >
                  <vc-hint class="vc-margin-bottom_xs" v-if="item.profileName"
                    >{{ $t("SHELL.NOTIFICATIONS.PROFILE") }}
                    <b>{{ item.profileName }}</b></vc-hint
                  >
                  <div v-if="item.errors && item.errors.length">
                    <vc-hint class="notification-dropdown__error">
                      {{ $t("SHELL.NOTIFICATIONS.ERRORS") }}:
                      {{ item.errors && item.errors.length }}</vc-hint
                    >
                  </div>
                </div>
                <div>
                  <p
                    class="notification-dropdown__notification-time vc-margin_none"
                  >
                    {{ item.params.time }}
                  </p>
                </div>
              </vc-row>
            </div>
          </div>
        </vc-col>
        <div
          class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding_l"
          v-else
        >
          {{ $t("SHELL.NOTIFICATIONS.EMPTY") }}
        </div>
      </vc-container>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, PropType, ref, watch, defineProps } from "vue";
import {
  BulkActionPushNotification,
  PushNotification,
} from "@virtoshell/api-client";
import { useNotifications } from "@virtoshell/core";
import moment from "moment";
import { IMenuItems } from "@virtoshell/ui";
import { ImportNew, ImportProfileSelector } from "../modules/import";
import { ImportPushNotification } from "../api_client";

interface INotificationParams
  extends PushNotification,
    BulkActionPushNotification {
  params: {
    icon: string;
    time: string;
    color: string;
  };
  profileName?: string;
}
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
const locale = window.navigator.language;
const isMobileVisible = ref(false);
const populatedList = ref<INotificationParams[]>([]);

watch(
  () => notifications,
  (newVal) => {
    populatedList.value = newVal.value.map((item: INotificationParams) => {
      return Object.assign(
        {},
        {
          ...item,
          params: {
            icon: notificationIcon(item.notifyType),
            time: moment(item.created).locale(locale).format("L LT"),
            color: notificationColor(item),
          },
        }
      ) as INotificationParams;
    });
  },
  { deep: true }
);

onMounted(async () => {
  await loadFromHistory();
});

function toggleNotificationsDrop() {
  isDropdownVisible.value = !isDropdownVisible.value;
}

const notificationIcon = (type: string) => {
  const lower = type.toLowerCase();
  if (lower.includes("offer")) {
    return "fas fa-percentage";
  } else if (lower.includes("product")) {
    return "fas fa-box-open";
  } else if (lower.includes("import")) {
    return "fas fa-download";
  }
  return "fas fa-info";
};

const notificationColor = (item: INotificationParams) => {
  if (item.created && item.finished) {
    return "#87b563";
  } else if (item.created && !item.finished && !item.errors) {
    return "#A9BCCD";
  } else if (item.created && item.errors && item.errors.length) {
    return "#F14E4E";
  }

  return "#87b563";
};

const handleClick = async (
  notification: PushNotification | ImportPushNotification
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

    &-icon {
      width: 41px;
      height: 41px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-title {
      color: var(--basic-black-color);
      font-size: var(--font-size-xl);
      line-height: var(--line-height-l);
      font-weight: var(--font-weight-bold);
    }

    &-time {
      font-size: var(--font-size-s);
      line-height: var(--line-height-l);
      color: #8e8e8e;
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
