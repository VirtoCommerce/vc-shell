<template>
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
        class="tw-text-[color:var(--basic-black-color)] tw-text-xl tw-leading-[19px] tw-font-bold tw-m-0 tw-mb-1"
        :class="{ 'tw-mr-4': $isDesktop.value }"
      >
        {{ title }}
      </p>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcIcon } from "./../../";
export interface Props {
  color: string;
  icon: string;
  title: string;
}

defineProps<Props>();
</script>
