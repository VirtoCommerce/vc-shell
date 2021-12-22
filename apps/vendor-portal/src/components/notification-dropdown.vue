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
        { 'notification-dropdown__button_active': isDropdownVisible },
      ]"
    >
      <vc-icon icon="fas fa-bell" size="xl"></vc-icon>
    </div>
    <div class="notification-dropdown__drop" v-if="isDropdownVisible">
      <vc-container :noPadding="true">
        <div v-if="populatedList && populatedList.length">
          <div
            class="notification-dropdown__notification"
            v-for="item in populatedList"
            :key="`notification_${item.id}`"
          >
            <vc-row>
              <vc-col size="1">
                <div
                  class="notification-dropdown__notification-icon"
                  :style="{ 'background-color': item.params.color }"
                >
                  <vc-icon :icon="item.params.icon" size="l"></vc-icon>
                </div>
              </vc-col>
              <vc-col size="4" class="vc-flex-justify_center">
                <div class="notification-dropdown__notification-info">
                  <p
                    class="
                      notification-dropdown__notification-title
                      vc-margin_none
                      vc-margin-bottom_xs
                    "
                  >
                    {{ item.title }}
                  </p>
                  <vc-hint>{{ item.description }}</vc-hint>
                  <div v-if="item.errors && item.errors.length">
                    <vc-hint class="notification-dropdown__error"
                      >Errors: {{ item.errors && item.errors.length }}</vc-hint
                    >
                  </div>
                </div>
              </vc-col>
              <vc-col size="2" class="vc-flex-align_end">
                <p
                  class="
                    notification-dropdown__notification-time
                    vc-margin_none
                  "
                >
                  {{ item.params.time }}
                </p>
              </vc-col>
            </vc-row>
          </div>
        </div>
        <div
          class="
            vc-flex
            vc-flex-justify_center
            vc-flex-align_center
            vc-padding_l
          "
          v-else
        >
          No notifications yet
        </div>
      </vc-container>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref, watch } from "vue";
import {
  BulkActionPushNotification,
  PushNotification,
} from "@virtoshell/api-client";
import { useNotifications } from "@virtoshell/core";
import moment from "moment";

interface INotificationParams
  extends PushNotification,
    BulkActionPushNotification {
  params: {
    icon: string;
    time: string;
    color: string;
  };
}

export default defineComponent({
  name: "notification-dropdown",
  props: {
    isAccent: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: "",
    },
  },
  setup() {
    const isDropdownVisible = ref(false);
    const { getLastNotifications, dropNotifications } = useNotifications();
    const locale = window.navigator.language;

    const populatedList = ref<INotificationParams[]>([]);

    watch(
      () => dropNotifications,
      (newVal) => {
        populatedList.value = newVal.value.map((item: INotificationParams) => {
          item.params = {
            icon: notificationIcon(item.notifyType),
            time: moment(item.created).locale(locale).format("L LT"),
            color: notificationColor(item),
          };
          return item;
        });
      },
      { deep: true }
    );

    onMounted(async () => {
      await getLastNotifications();
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

    return {
      isDropdownVisible,
      populatedList,
      toggleNotificationsDrop,
    };
  },
});
</script>

<style lang="less" scoped>
:root {
  --notification-color-error: #f14e4e;
}
.notification-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;

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

  &__error {
    --hint-color: var(--notification-color-error);
  }
}
</style>
