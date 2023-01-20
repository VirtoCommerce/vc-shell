<template>
  <div
    class="tw-relative tw-flex tw-items-center tw-h-full"
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
        'tw-relative tw-h-full tw-flex tw-items-center tw-justify-center tw-w-[var(--app-bar-button-width)] tw-border-l tw-border-solid tw-border-l-[color:var(--app-bar-button-border-color)] tw-cursor-pointer tw-text-[color:var(--app-bar-button-color)] tw-bg-[color:var(--app-bar-button-background-color)]  tw-transition-[color]  tw-duration-200 hover:tw-text-[color:var(--app-bar-button-color-hover)] hover:tw-bg-[color:var(--app-bar-button-background-color-hover)]',
        {
          'before:tw-content-[``] before:tw-block before:tw-absolute before:tw-right-[12px] before:tw-top-[18px] before:tw-w-[7px] before:tw-h-[7px] before:tw-bg-[#ff4a4a] before:tw-rounded-full before:tw-z-[1]':
            isAccent,
        },
        {
          'tw-shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] [clip-path:inset(0px_-20px_0px_-20px)] tw-bg-white tw-z-[10000]':
            isDropdownVisible && !$isMobile.value,
        },
      ]"
    >
      <VcIcon icon="fas fa-bell" size="xl"></VcIcon>
    </div>
    <div
      v-if="$isMobile.value && isDropdownVisible"
      class="tw-fixed tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-z-[9999] tw-bg-[#808c99] tw-opacity-60"
      @click.stop="toggleNotificationsDrop"
    ></div>
    <div
      class="tw-absolute tw-top-[var(--app-bar-height)] tw-z-[9999] tw-drop-shadow-[0px_4px_15px_rgba(43,67,84,0.15)] tw-bg-white tw-rounded-b-[6px] tw-w-[439px] tw-max-h-[350px] tw-min-h-[50px] tw-right-0 tw-overflow-hidden tw-flex tw-flex-col"
      v-if="isDropdownVisible"
      :class="{
        'tw-hidden !tw-fixed !tw-right-0 !tw-top-0 !tw-max-h-full !tw-max-w-[300px] !tw-w-full !tw-bottom-0 !tw-z-[9999] !tw-border-0':
          $isMobile.value,
        '!tw-flex': $isMobile.value && isDropdownVisible,
      }"
    >
      <div
        v-if="$isMobile.value"
        class="tw-text-[#319ed4] tw-flex tw-justify-end tw-items-center tw-p-4"
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
            class="tw-py-[18px] tw-px-[15px] tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-cursor-pointer last-of-type:tw-border-b-0"
            v-for="item in notifications"
            :key="`notification_${item.id}`"
          >
            <NotificationItem :notification="item"></NotificationItem>
          </div>
        </VcCol>
        <div class="tw-flex tw-justify-center tw-items-center tw-p-4" v-else>
          {{ $t("SHELL.NOTIFICATIONS.EMPTY") }}
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef } from "vue";
import {
  PushNotification,
  useBladeNavigation,
  useNotifications,
} from "@vc-shell/framework";
import NotificationItem from "./_internal/notification/notification.vue";

export interface Props {
  isAccent: boolean;
  title: string;
}

withDefaults(defineProps<Props>(), {
  isAccent: false,
  title: "",
});

const isDropdownVisible = ref(false);
const { loadFromHistory, notifications, markAllAsRead } = useNotifications();
const { openBlade, closeBlade } = useBladeNavigation();

onMounted(async () => {
  await loadFromHistory();
});

function toggleNotificationsDrop() {
  isDropdownVisible.value = !isDropdownVisible.value;
  if (isDropdownVisible.value && notifications.value.some((x) => x.isNew)) {
    markAllAsRead();
  }
}

const handleClick = async (notification: PushNotification) => {
  isDropdownVisible.value = false;

  /**
   * Close current blade
   */
  // await closeBlade(0);
  /**
   * Open blade on notification click
   * @example openBlade(
   *     {
   *       parentBlade: shallowRef(),
   *       component: shallowRef(),
   *       param: "",
   *       bladeOptions: {},
   *     },
   *     1
   *   );
   */
};
</script>

<style lang="scss">
:root {
  --notification-color-error: #f14e4e;
}
</style>
