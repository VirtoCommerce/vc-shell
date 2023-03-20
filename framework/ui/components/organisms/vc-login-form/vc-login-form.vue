<template>
  <div
    class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
    :style="{
      background: `url(${background}) center / cover no-repeat`,
    }"
  >
    <div
      class="tw-h-[80px] tw-w-[516px] tw-max-w-[90%] tw-mb-[50px] -tw-mt-[90px]"
      :style="{
        background: `url(${logo}) center / contain no-repeat`,
      }"
    ></div>
    <div
      class="tw-w-[516px] tw-max-w-[90%] tw-bg-white tw-rounded-md tw-overflow-hidden tw-shadow-[0_0_0_rgba(0,0,0,0.05)]"
    >
      <div
        class="tw-uppercase tw-text-white tw-bg-[#465769] tw-h-[50px] tw-px-[28px] tw-text-xl tw-flex tw-items-center"
      >
        {{ title }}
      </div>
      <div class="tw-pt-4 tw-px-[28px] tw-pb-[24px]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  logo: string;
  background: string;
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: "Login",
});

console.debug("Init vc-login-form");
</script>
