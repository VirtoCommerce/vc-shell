<template>
  <div
    class="vc-popup"
    :class="`vc-popup_${variant}`"
  >
    <div class="vc-popup__wrapper">
      <div class="vc-popup__inner">
        <div
          class="vc-popup__header"
          :class="`vc-popup__header_${type}`"
        >
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
        <template v-if="type === 'error'">
          <VcPopupError @close="$emit('close')">
            <slot></slot>
          </VcPopupError>
        </template>
        <template v-if="type === 'warning'">
          <VcPopupWarning
            @close="$emit('close')"
            @confirm="$emit('confirm')"
          >
            <slot></slot>
          </VcPopupWarning>
        </template>
        <template v-else>
          <slot></slot>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../";
import VcPopupWarning from "./_internal/vc-popup-warning/vc-popup-warning.vue";
import VcPopupError from "./_internal/vc-popup-error/vc-popup-error.vue";

export interface Props {
  title?: string;
  closable?: boolean;
  variant?: "small" | "medium" | "fullscreen";
  type?: "default" | "error" | "warning" | "success";
}

export interface Emits {
  (event: "close"): void;
  (event: "confirm"): void;
}

withDefaults(defineProps<Props>(), {
  closable: true,
  variant: "fullscreen",
  type: "default",
});

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --popup-header-default-color: #eef5fa;
  --popup-header-success-color: #87b563;
  --popup-header-warning-color: #f89406;
  --popup-header-error-color: #ef796f;
}
.vc-popup {
  @apply tw-fixed tw-top-0 tw-right-0 tw-bottom-0 tw-left-0 tw-z-[9999] tw-bg-[rgba(31,40,50,0.58)];

  &_small {
    .vc-popup__wrapper {
      @apply tw-max-h-[50%] tw-items-center tw-flex tw-grow-0 tw-shrink-0 tw-basis-auto [flex-direction:inherit] tw-justify-center;
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
    @apply tw-shrink tw-m-[40px] tw-box-border tw-bg-white tw-rounded-[5px] tw-overflow-hidden tw-relative tw-flex tw-flex-col tw-grow tw-basis-0 tw-max-h-full tw-h-fit;

    .vc-app_phone & {
      @apply tw-m-0 tw-rounded-none;
    }
  }

  &__header {
    @apply tw-h-[44px] tw-px-4 tw-bg-[var(--popup-header-default-color)] tw-flex tw-shrink-0 tw-items-center;

    &_default {
      @apply tw-bg-[var(--popup-header-default-color)];
    }

    &_error {
      @apply tw-bg-[var(--popup-header-error-color)] tw-text-white;

      .vc-popup__header-icon {
        @apply tw-text-white;
      }
    }

    &_warning {
      @apply tw-bg-[var(--popup-header-warning-color)] tw-text-white;

      .vc-popup__header-icon {
        @apply tw-text-white;
      }
    }

    &_success {
      @apply tw-bg-[var(--popup-header-success-color)] tw-text-white;

      .vc-popup__header-icon {
        @apply tw-text-white;
      }
    }

    &-icon {
      @apply tw-cursor-pointer tw-text-[#a1c0d4];
    }
  }
}
</style>
