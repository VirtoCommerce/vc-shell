<template>
  <div
    class="vc-notification-template"
    :class="{ 'vc-notification-template--clickable': $attrs.onClick }"
    v-bind="$attrs"
    @click="handleTemplateClick"
  >
    <div
      class="vc-notification-template__container"
      :class="{
        'vc-notification-template__container--mobile': $isMobile.value,
      }"
    >
      <div class="vc-notification-template__left">
        <div
          class="vc-notification-template__icon-container"
          :style="{ 'background-color': color }"
        >
          <VcIcon
            :icon="icon"
            size="l"
            aria-label="Notification Icon"
          ></VcIcon>
        </div>
        <div class="vc-notification-template__content">
          <p
            class="vc-notification-template__title"
            :class="{ 'vc-notification-template__title--desktop': $isDesktop.value }"
          >
            {{ title }}
          </p>
          <slot
            v-bind="$attrs"
            v-on="$attrs"
          ></slot>
        </div>
      </div>
      <div
        class="vc-notification-template__right"
        :class="{ 'vc-notification-template__right--mobile': $isMobile.value }"
      >
        <p class="vc-notification-template__time">
          {{ pushTime }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcIcon } from "../../../ui/components";
import moment from "moment";
import { PushNotification } from "../../../core/api/platform";

export interface Props {
  color: string;
  icon: string;
  title: string;
  notification: PushNotification;
  clickable?: boolean;
}

export interface Emits {
  (event: "onClick", notification: PushNotification): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const locale = window.navigator.language;

const pushTime = computed(() => {
  return moment(props.notification.created).locale(locale).format("L LT");
});

const handleTemplateClick = () => {
  emit("onClick", props.notification);
};

defineOptions({
  inheritAttrs: false,
});
</script>

<style lang="scss">
:root {
  --notification-template-icon-color: var(--additional-50);
  --notification-template-text-color: var(--additional-950);
  --notification-template-time-color: var(--neutrals-600);
}

.vc-notification-template {
  @apply tw-w-full;

  &--clickable {
    cursor: pointer;
  }

  &__container {
    @apply tw-flex tw-flex-row tw-justify-between tw-grow tw-basis-0;

    &--mobile {
      @apply tw-flex-col-reverse;
    }
  }

  &__left {
    @apply tw-flex tw-items-center;
  }

  &__icon-container {
    @apply tw-w-[41px] tw-h-[41px] tw-rounded-full tw-text-[color:var(--notification-template-icon-color)] tw-mr-4 tw-flex tw-items-center tw-justify-center tw-shrink-0;
  }

  &__title {
    @apply tw-text-[color:var(--notification-template-text-color)] tw-text-lg tw-leading-[19px] tw-font-bold tw-m-0 tw-mb-1;
    word-break: break-word;

    &--desktop {
      @apply tw-mr-4;
    }
  }

  &__right {
    @apply tw-flex tw-shrink-0;

    &--mobile {
      @apply tw-mb-2 tw-justify-end;
    }
  }

  &__time {
    @apply tw-text-sm tw-text-[color:var(--notification-template-time-color)] tw-m-0;
  }
}
</style>
