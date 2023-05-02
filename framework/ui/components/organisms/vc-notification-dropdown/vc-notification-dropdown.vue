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
          'tw-shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] [clip-path:inset(0px_-20px_0px_-20px)] tw-bg-white tw-z-[10000]':
            isDropdownVisible && !$isMobile.value,
        },
      ]"
    >
      <VcIcon
        icon="fas fa-bell"
        size="xl"
      ></VcIcon>
      <div
        :class="{
          'tw-block tw-absolute tw-right-[12px] tw-top-[18px] tw-w-[7px] tw-h-[7px] tw-bg-[#ff4a4a] tw-rounded-full tw-z-[1]':
            isAccent,
        }"
      ></div>
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
      <VcContainer
        :noPadding="true"
        @click.stop
      >
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
        <div
          class="tw-flex tw-justify-center tw-items-center tw-p-4"
          v-else
        >
          {{ $t("COMPONENTS.ORGANISMS.VC_NOTIFICATION_DROPDOWN.EMPTY") }}
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import NotificationItem from "./_internal/notification/notification.vue";
import { PushNotification } from "./../../../../core/api";
import { VcCol, VcContainer, VcIcon } from "./../../";
import { clickOutside as vClickOutside } from "./../../../../core/directives/";

export interface Props {
  title: string;
  isAccent?: boolean;
  notifications: PushNotification[];
  onOpen?: () => void;
  onClick?: (message: PushNotification) => void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
});

const isDropdownVisible = ref(false);

function toggleNotificationsDrop() {
  isDropdownVisible.value = !isDropdownVisible.value;
  if (props.onOpen && typeof props.onOpen === "function") {
    props.onOpen();
  }
}

const handleClick = async (notification: PushNotification) => {
  isDropdownVisible.value = false;

  if (props.onClick && typeof props.onClick === "function") {
    props.onClick(notification);
  }
};
</script>

<style lang="scss">
:root {
  --notification-color-error: #f14e4e;
}
</style>
