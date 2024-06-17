<template>
  <div class="tw-flex flex-row tw-justify-between tw-grow tw-basis-0">
    <div class="tw-flex tw-items-center">
      <div
        class="tw-w-[41px] tw-h-[41px] tw-rounded-full tw-text-white tw-mr-4 tw-flex tw-items-center tw-justify-center tw-shrink-0"
        :style="{ 'background-color': color }"
      >
        <VcIcon
          :icon="icon"
          size="l"
        ></VcIcon>
      </div>
      <div>
        <p
          class="tw-text-[color:var(--basic-black-color)] tw-text-xl tw-leading-[19px] tw-font-bold tw-m-0 tw-mb-1 tw-break-all"
          :class="{ 'tw-mr-4': $isDesktop.value }"
        >
          {{ title }}
        </p>
        <slot></slot>
      </div>
    </div>
    <div class="tw-flex tw-shrink-0">
      <p class="tw-text-s tw-leading-[18px] tw-text-[#8e8e8e] tw-m-0">
        {{ pushTime }}
      </p>
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
}

const props = defineProps<Props>();

const locale = window.navigator.language;

const pushTime = computed(() => {
  return moment(props.notification.created).locale(locale).format("L LT");
});
</script>
