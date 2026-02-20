<template>
  <div class="vc-notification-template" @click="$emit('click')">
    <div
      class="vc-notification-template__container"
      :class="{
        'vc-notification-template__container--mobile': $isMobile.value,
      }"
    >
      <div class="vc-notification-template__content">
        <p
          class="vc-notification-template__title"
          :class="{ 'vc-notification-template__title--desktop': $isDesktop.value }"
        >
          {{ title }}
        </p>
        <p class="vc-notification-template__time">
          {{ pushTime }}
        </p>
        <div
          v-if="$slots.default"
          class="vc-notification-template__content-body"
        >
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IPushNotification } from "@core/api/platform";

export interface Props {
  title: string;
  notification: IPushNotification;
}
export interface Emits {
  (e: "click"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const locale = window.navigator.language;

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

const pushTime = computed(() => {
  const created = props.notification.created;
  if (!created) return "";

  const date = created instanceof Date ? created : new Date(created);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffSec = Math.round((now - date.getTime()) / 1000);
  const absDiffSec = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  // Recent notifications: relative time
  if (absDiffSec < MINUTE) {
    return rtf.format(-diffSec, "second");
  }
  if (absDiffSec < HOUR) {
    return rtf.format(-Math.round(diffSec / MINUTE), "minute");
  }
  if (absDiffSec < DAY) {
    return rtf.format(-Math.round(diffSec / HOUR), "hour");
  }

  // Older notifications: absolute date-time
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
});
</script>

<style lang="scss">
:root {
  --notification-template-icon-color: var(--additional-50);
  --notification-template-text-color: var(--additional-950);
  --notification-template-time-color: var(--neutrals-500);
  --notification-template-content-body-color: var(--neutrals-700);
}

.vc-notification-template {
  @apply tw-w-full;

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
    @apply tw-w-[41px] tw-h-[41px] tw-rounded-full tw-text-[color:var(--notification-template-icon-color)]
      tw-mr-4 tw-flex tw-items-center tw-justify-center tw-shrink-0;
  }

  &__title {
    @apply tw-text-[color:var(--notification-template-text-color)] tw-text-xs tw-leading-[19px]
      tw-font-bold tw-m-0 tw-text-wrap;
    word-break: break-word;
  }

  &__right {
    @apply tw-flex tw-shrink-0;

    &--mobile {
      @apply tw-mb-2 tw-justify-end;
    }
  }

  &__content-body {
    @apply tw-text-xs tw-text-[color:var(--notification-template-content-body-color)] tw-m-0 tw-text-wrap;
  }

  &__time {
    @apply tw-text-xxs tw-text-[color:var(--notification-template-time-color)] tw-m-0 tw-mb-2;
  }
}
</style>
