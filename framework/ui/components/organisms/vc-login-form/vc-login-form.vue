<template>
  <div
    class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
    :style="backgroundImageHandler"
  >
    <div
      class="tw-h-[80px] tw-w-[516px] tw-max-w-[90%] tw-mb-[50px] -tw-mt-[90px]"
      :style="logoImageHandler"
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
    <div
      class="tw-absolute tw-bottom-[2px] tw-left-[93px] tw-text-[color:var(--login-version-color)] tw-text-xs tw-mt-auto tw-self-center tw-p-1"
    >
      {{ version }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

export interface Props {
  logo?: string;
  background?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Login",
});

defineSlots<{
  default: void;
}>();

const router = useRouter();

const backgroundImageHandler = computed(() => {
  if (props.background) {
    return `background: url(${CSS.escape(props.background)}) center / cover no-repeat`;
  }
  return undefined;
});

const logoImageHandler = computed(() => {
  if (props.logo) {
    return `background: url(${CSS.escape(props.logo)})  center / contain no-repeat`;
  }
  return undefined;
});

const version = router.currentRoute.value.meta?.appVersion;

console.debug("Init vc-login-form");
</script>

<style lang="scss">
:root {
  --login-version-color: #838d9a;
}
</style>
