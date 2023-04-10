<template>
  <button
    class="vc-button"
    :class="[
      `vc-button_${variant}`,
      {
        'vc-button_small': small,
        'vc-button_outline': outline,
        'vc-button_selected': selected,
      },
    ]"
    @click="onClick"
    :disabled="disabled"
  >
    <VcIcon
      v-if="icon"
      class="vc-button__icon"
      :icon="icon"
      :size="small ? 'xs' : 's'"
    ></VcIcon>
    <span
      v-if="$slots['default']"
      class="vc-button__title"
    >
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../vc-icon";
export interface Props {
  icon?: string | undefined;
  variant?: "primary" | "secondary" | "special" | "danger" | "widget" | "onlytext";
  disabled?: boolean | undefined;
  small?: boolean | undefined;
  outline?: boolean | undefined;
  selected?: boolean | undefined;
}

export interface Emits {
  /**
   * Emitted when component is clicked
   * */
  (event: "click", value: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
});

const emit = defineEmits<Emits>();

function onClick(e: Event): void {
  if (!props.disabled) {
    e.preventDefault();
    emit("click", e);
  }
}
</script>

<style lang="scss">
:root {
  --button-primary-background-color: #41afe6;
  --button-primary-background-color-hover: #319ed4;
  --button-primary-background-color-active: #319ed4;
  --button-primary-background-color-disabled: #a9ddf6;

  --button-primary-text-color: #ffffff;
  --button-primary-text-color-hover: #ffffff;
  --button-primary-text-color-active: #ffffff;
  --button-primary-text-color-disabled: #ffffff;

  --button-secondary-background-color: #ffffff;
  --button-secondary-background-color-hover: #ffffff;
  --button-secondary-background-color-active: #ffffff;
  --button-secondary-background-color-disabled: #ffffff;

  --button-secondary-border-color: #43b0e6;
  --button-secondary-border-color-hover: #319ed4;
  --button-secondary-border-color-active: #319ed4;
  --button-secondary-border-color-disabled: #a9ddf6;

  --button-secondary-text-color: #43b0e6;
  --button-secondary-text-color-hover: #319ed4;
  --button-secondary-text-color-active: #319ed4;
  --button-secondary-text-color-disabled: #a9ddf6;

  --button-special-background-color: #f89406;
  --button-special-background-color-hover: #eb8b03;
  --button-special-background-color-active: #eb8b03;
  --button-special-background-color-disabled: #fed498;

  --button-danger-background-color: #ff4a4a;
  --button-danger-background-color-hover: #d73a3a;
  --button-danger-background-color-active: #d73a3a;
  --button-danger-background-color-disabled: #ff5e5e;

  --button-special-text-color: #ffffff;
  --button-special-text-color-hover: #ffffff;
  --button-special-text-color-active: #ffffff;
  --button-special-text-color-disabled: #ffffff;

  --button-widget-background-color: #ffffff;
  --button-widget-background-color-hover: #f2faff;
  --button-widget-background-color-active: #eaf6ff;
  --button-widget-background-color-disabled: #fafafa;

  --button-widget-border-color: #eaedf3;
  --button-widget-border-color-hover: #d3e2ec;
  --button-widget-border-color-active: #deecf4;

  --button-border-radius: 3px;
  --button-padding: 14px;
  --button-padding-small: 12px;
  --button-height: 36px;
  --button-height-small: 28px;
}

$variants: primary, secondary, special, danger, widget;

.vc-button {
  @apply tw-inline-flex tw-items-center tw-font-medium tw-text-sm tw-cursor-pointer tw-box-border tw-transition  tw-duration-200 tw-rounded-[var(--button-border-radius)] tw-px-[var(--button-padding)] tw-h-[var(--button-height)];

  &__icon + &__title {
    @apply tw-ml-2;
  }

  @each $variant in $variants {
    &_#{$variant} {
      @apply tw-bg-[color:var(--button-#{$variant}-background-color)]
      tw-text-left
      tw-text-[color:var(--button-#{$variant}-text-color)]
      tw-border tw-border-solid tw-border-[color:var(--button-#{$variant}-background-color)]
      hover:tw-bg-[color:var(--button-#{$variant}-background-color-hover)]
      hover:tw-text-[color:var(--button-#{$variant}-text-color-hover)]
      hover:tw-border-[color:var(--button-#{$variant}-background-color-hover)]
      focus:tw-bg-[color:var(--button-#{$variant}-background-color-active)]
      focus:tw-text-[color:var(--button-#{$variant}-text-color-active)]
      focus:tw-bg-[color:var(--button-#{$variant}-background-color-active)]
      disabled:tw-cursor-not-allowed
      disabled:tw-bg-[color:var(--button-#{$variant}-background-color-disabled)]
      disabled:tw-text-[color:var(--button-#{$variant}-text-color-disabled)]
      disabled:tw-border-[color:var(--button-#{$variant}-background-color-disabled)];
    }
  }

  &_widget {
    @apply tw-h-auto tw-border-[color:var(--button-widget-border-color)]
    tw-shadow-[1px_4px_10px_rgba(197,206,214,0.24)]
    tw-rounded-[4px]
    tw-p-[15px]
    hover:tw-bg-[color:var(--button-widget-background-color-hover)]
    focus:tw-bg-[color:var(--button-widget-background-color-active)]
    focus:tw-border-[color:var(--button-widget-border-color-active)]
    disabled:tw-cursor-not-allowed
    disabled:tw-bg-[color:var(--button-widget-background-color-disabled)]
    disabled:tw-border-[color:var(--button-widget-background-color-disabled)];

    .vc-button__icon {
      @apply tw-text-[30px] tw-text-[color:#a9bfd2];
    }
  }

  &_small {
    @apply tw-h-[var(--button-height-small)]
      tw-px-[var(--button-padding-small)]
      tw-font-normal
      tw-text-xs;

    .vc-button__icon + .vc-button__title {
      @apply tw-ml-1;
    }
  }

  &_outline {
    @apply tw-bg-transparent
    tw-text-[color:var(--button-secondary-text-color)]
    tw-border-[color:var(--button-secondary-border-color)]
    hover:tw-text-[color:var(--button-secondary-text-color-hover)]
    hover:tw-border-[color:var(--button-secondary-border-color-hover)]
    hover:tw-bg-transparent
    focus:tw-text-[color:var(--button-secondary-text-color-hover)]
    focus:tw-border-[color:var(--button-secondary-border-color-active)]
    focus:tw-bg-transparent
    disabled:tw-cursor-not-allowed
    disabled:tw-text-[color:var(--button-secondary-text-color-disabled)]
    disabled:tw-border-[color:var(--button-secondary-border-color-disabled)]
    disabled:tw-bg-transparent;
  }

  &_onlytext {
    @apply tw-text-[color:var(--button-secondary-text-color)]
    tw-p-0 tw-border-none tw-bg-transparent tw-h-auto
    hover:tw-bg-transparent
    hover:tw-text-[color:var(--button-secondary-text-color-hover)]
    focus:tw-bg-transparent
    focus:tw-text-[color:var(--button-secondary-text-color-hover)];
  }

  &_selected {
    &.vc-button_widget {
      @apply tw-bg-[color:var(--button-widget-background-color-hover)];
    }
  }
}
</style>
