<template>
  <div
    class="vc-login-form__container"
    :style="backgroundImageHandler"
  >
    <div
      class="vc-login-form__logo"
      :style="logoImageHandler"
    ></div>
    <div class="vc-login-form__box">
      <div class="vc-login-form__header">
        {{ title }}
      </div>
      <div class="vc-login-form__content">
        <slot></slot>
      </div>
    </div>
    <div class="vc-login-form__version">
      {{ version }}
    </div>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { createLogger } from "../../../../core/utilities";

export interface Props {
  logo?: string;
  background?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Login",
});

defineSlots<{
  default: (props: any) => any;
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
    return `background: url(${CSS.escape(props.logo)}) center / contain no-repeat`;
  }
  return undefined;
});

const version = router.currentRoute.value.meta?.appVersion;

const logger = createLogger("vc-login-form");
logger.debug("Init vc-login-form");
</script>

<style lang="scss">
:root {
  --login-version-color: var(--neutrals-400);
  --login-header-bg-color: var(--secondary-700);
  --login-box-shadow-color: var(--additional-950);
  --login-box-shadow: rgb(from var(--login-box-shadow-color) r g b / 5%);
  --login-bg-color: var(--additional-50);
  --login-title-color: var(--additional-50);
  --login-title-bg: var(--secondary-700);
}

.vc-login-form {
  &__container {
    @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__logo {
    @apply tw-h-20 tw-w-[516px] tw-max-w-[90%] tw-mb-12 -tw-mt-24;
  }

  &__box {
    @apply tw-w-[516px] tw-max-w-[90%] tw-bg-[var(--login-bg-color)] tw-rounded-md tw-overflow-hidden [box-shadow:var(--login-box-shadow)];
  }

  &__header {
    @apply tw-uppercase tw-text-[var(--login-title-color)] tw-bg-[var(--login-title-bg)] tw-h-12 tw-px-7 tw-text-lg tw-flex tw-items-center;
  }

  &__content {
    @apply tw-pt-4 tw-px-7 tw-pb-6;
  }

  &__version {
    @apply tw-absolute tw-bottom-0.5 tw-left-[93px] tw-text-[var(--login-version-color)] tw-text-xs tw-mt-auto tw-self-center tw-p-1;
  }
}
</style>
