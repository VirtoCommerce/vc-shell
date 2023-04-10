<template>
  <div
    class="vc-popup"
    :class="`vc-popup_${variant}`"
  >
    <div class="vc-popup__wrapper">
      <div class="vc-popup__inner">
        <div class="vc-popup__header">
          <div class="tw-truncate tw-grow tw-basis-0">
            <slot name="title">{{ title }}</slot>
          </div>
          <VcIcon
            v-if="closable"
            class="vc-popup__header-icon"
            icon="fas fa-times"
            @click="$emit('close')"
          ></VcIcon>
        </div>

        <div class="vc-popup__content tw-grow tw-basis-0">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../";
export interface Props {
  title?: string;
  closable?: boolean;
  variant?: "small" | "medium" | "fullscreen";
}

export interface Emits {
  (event: "close"): void;
}

withDefaults(defineProps<Props>(), {
  closable: true,
  variant: "fullscreen",
});

defineEmits<Emits>();
</script>

<style lang="scss">
.vc-popup {
  @apply tw-fixed tw-top-0 tw-right-0 tw-bottom-0 tw-left-0 tw-z-[9999] tw-bg-[rgba(31,40,50,0.58)];

  &_small {
    .vc-popup__wrapper {
      @apply tw-max-h-fit tw-items-center tw-flex tw-grow-0 tw-shrink-0 tw-basis-auto [flex-direction:inherit] tw-justify-center;
    }

    .vc-popup__inner {
      @apply tw-max-w-[439px] tw-w-full tw-flex tw-flex-col tw-grow tw-basis-0;
    }
  }

  &_medium {
    .vc-popup__wrapper {
      @apply tw-max-h-[75vh];
    }
  }

  &_fullscreen {
    .vc-popup__wrapper {
      @apply tw-max-h-[100vh];
    }
  }

  &__wrapper {
    @apply tw-fixed tw-top-2/4 -tw-translate-y-2/4 tw-right-0 tw-bottom-0 tw-left-0 tw-flex tw-grow tw-shrink tw-basis-auto tw-flex-col tw-h-full;

    .vc-app_phone & {
      @apply tw-max-h-[100vh];
    }
  }

  &__inner {
    @apply tw-grow tw-shrink tw-basis-auto tw-m-[40px] tw-box-border tw-bg-white tw-rounded-[5px] tw-overflow-hidden tw-relative tw-flex tw-flex-col tw-grow tw-basis-0;

    .vc-app_phone & {
      @apply tw-m-0 tw-rounded-none;
    }
  }

  &__header {
    @apply tw-h-[44px] tw-px-4 tw-bg-[#eef5fa] tw-flex tw-shrink-0 tw-items-center;

    &-icon {
      @apply tw-cursor-pointer tw-text-[#a1c0d4];
    }
  }
}
</style>
