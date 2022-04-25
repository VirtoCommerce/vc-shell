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
    <span v-if="$slots['default']" class="vc-button__title">
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts" setup>
import VcIcon from "../vc-icon/vc-icon.vue";

const props = defineProps({
  icon: {
    type: String,
    default: undefined,
  },

  variant: {
    type: String,
    enum: ["primary", "secondary", "special", "danger", "widget"],
    default: "primary",
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  small: {
    type: Boolean,
    default: false,
  },

  outline: {
    type: Boolean,
    default: false,
  },

  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

function onClick(): void {
  if (!props.disabled) {
    emit("click");
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
  @apply inline-flex items-center font-medium text-sm cursor-pointer box-border transition duration-200 rounded-[var(--button-border-radius)] px-[var(--button-padding)] h-[var(--button-height)];

  &__icon + &__title {
    @apply ml-s;
  }

  @each $variant in $variants {
    &_#{$variant} {
      @apply bg-[color:var(--button-#{$variant}-background-color)]
      text-[color:var(--button-#{$variant}-text-color)]
      border border-solid border-[color:var(--button-#{$variant}-background-color)]
      hover:bg-[color:var(--button-#{$variant}-background-color-hover)]
      hover:text-[color:var(--button-#{$variant}-text-color-hover)]
      hover:border-[color:var(--button-#{$variant}-background-color-hover)]
      focus:bg-[color:var(--button-#{$variant}-background-color-active)]
      focus:text-[color:var(--button-#{$variant}-text-color-active)]
      focus:bg-[color:var(--button-#{$variant}-background-color-active)]
      disabled:cursor-not-allowed
      disabled:bg-[color:var(--button-#{$variant}-background-color-disabled)]
      disabled:text-[color:var(--button-#{$variant}-text-color-disabled)]
      disabled:border-[color:var(--button-#{$variant}-background-color-disabled)];
    }
  }

  &_widget {
    @apply h-auto border-[color:var(--button-widget-border-color)]
    shadow-[1px_4px_10px_rgba(197,206,214,0.24)]
    rounded-[4px]
    p-[15px]
    hover:bg-[color:var(--button-widget-background-color-hover)]
    hover:border-[color:var(--button-widget-border-color-hover)]
    focus:bg-[color:var(--button-widget-background-color-active)]
    focus:border-[color:var(--button-widget-border-color-active)]
    disabled:cursor-not-allowed
    disabled:bg-[color:var(--button-widget-background-color-disabled)]
    disabled:border-[color:var(--button-widget-background-color-disabled)];

    .vc-button__icon {
      @apply text-[30px] text-[color:#a9bfd2];
    }
  }

  &_small {
    @apply h-[var(--button-height-small)]
      px-[var(--button-padding-small)]
      font-normal
      text-xs;

    .vc-button__icon + .vc-button__title {
      @apply ml-xs;
    }
  }

  &_outline {
    @apply bg-transparent
    text-[color:var(--button-secondary-text-color)]
    border-[color:var(--button-secondary-border-color)]
    hover:text-[color:var(--button-secondary-text-color-hover)]
    hover:border-[color:var(--button-secondary-border-color-hover)]
    focus:text-[color:var(--button-secondary-text-color-hover)]
    focus:border-[color:var(--button-secondary-border-color-active)]
    disabled:cursor-not-allowed
    disabled:text-[color:var(--button-secondary-text-color-disabled)]
    disabled:border-[color:var(--button-secondary-border-color-disabled)];
  }

  &_onlytext {
    @apply text-[color:var(--button-secondary-text-color)]
    p-0 border-none bg-transparent h-auto
    hover:bg-transparent
    hover:text-[color:var(--button-secondary-text-color-hover)]
    focus:bg-transparent
    focus:text-[color:var(--button-secondary-text-color-hover)];
  }

  &_selected {
    &.vc-button_widget {
      @apply bg-[color:var(--button-widget-background-color-hover)];
    }
  }
}
</style>
