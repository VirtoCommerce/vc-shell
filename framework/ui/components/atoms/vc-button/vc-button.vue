<template>
  <button
    :class="buttonClass"
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <!-- Loading: spinner replaces icon; shown inline next to text (shadcn pattern) -->
    <VcIcon
      v-if="loading"
      icon="lucide-loader-2"
      class="vc-button__icon tw-animate-spin"
      :size="iconSize"
    />
    <VcIcon
      v-else-if="icon"
      :class="['vc-button__icon', iconClass]"
      :icon="icon"
      :size="iconSize"
    />
    <span
      v-if="$slots['default']"
      class="vc-button__title"
    >
      <slot />
    </span>
  </button>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, inject, type Component } from "vue";
import { VcIcon } from "./../vc-icon";
import { ButtonGroupKey, type ButtonVariant, type ButtonSize } from "./types";

// Normalize legacy size aliases to canonical shadcn names
const SIZE_ALIAS: Record<string, string> = {
  base: "default",
  xs: "sm",
};

export interface Props {
  icon?: string | Component;
  iconClass?: string;
  iconSize?: InstanceType<typeof VcIcon>["$props"]["size"];
  variant?: ButtonVariant;
  disabled?: boolean;
  size?: ButtonSize;
  selected?: boolean;
  text?: boolean;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  ariaLabel?: string;
}

export interface Emits {
  /**
   * Emitted when component is clicked
   * */
  (event: "click", value: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  iconSize: "s",
  size: "default",
  type: "button",
  loading: false,
});

const emit = defineEmits<Emits>();

defineSlots<{
  default: (props?: any) => any;
}>();

const group = inject(ButtonGroupKey, null);

const effectiveSize = computed(() => {
  const raw = group?.size?.value ?? props.size;
  return SIZE_ALIAS[raw as string] ?? raw;
});

const buttonClass = computed(() => {
  return [
    "vc-button",
    {
      [`vc-button-${props.variant}`]: props.variant,
      [`vc-button_${effectiveSize.value}`]: effectiveSize.value,
      "vc-button_selected": props.selected,
      "vc-button_text": props.text,
      "vc-button_disabled": props.disabled || props.loading,
      "vc-button_loading": props.loading,
    },
  ];
});

function onClick(e: Event): void {
  if (!props.disabled && !props.loading) {
    e.preventDefault();
    emit("click", e);
  }
}
</script>

<style lang="scss">
:root {
  // PRIMARY (WCAG AA: --primary-700 yields 4.77:1 contrast with white)
  --button-primary-background-color: var(--primary-700);
  --button-primary-background-color-hover: var(--primary-700);
  --button-primary-background-color-disabled: var(--primary-700);
  --button-primary-text-color: var(--additional-50);
  --button-primary-text-color-disabled: var(--additional-50);
  --button-primary-border-color: var(--primary-700);
  --button-primary-border-color-hover: var(--primary-700);
  --button-primary-border-color-disabled: var(--primary-700);

  // SECONDARY (preserved from original)
  --button-secondary-background-color: var(--additional-50);
  --button-secondary-background-color-hover: var(--primary-50);
  --button-secondary-background-color-disabled: var(--additional-50);
  --button-secondary-text-color: var(--neutrals-700);
  --button-secondary-text-color-disabled: var(--neutrals-400);
  --button-secondary-border-color: var(--secondary-300);
  --button-secondary-border-color-hover: var(--secondary-400);
  --button-secondary-border-color-disabled: var(--secondary-300);

  // DANGER
  --button-danger-background-color: var(--danger-700);
  --button-danger-background-color-hover: var(--danger-700);
  --button-danger-background-color-disabled: var(--danger-700);
  --button-danger-text-color: var(--additional-50);
  --button-danger-text-color-disabled: var(--additional-50);
  --button-danger-border-color: var(--danger-700);
  --button-danger-border-color-hover: var(--danger-700);
  --button-danger-border-color-disabled: var(--danger-700);

  // WARNING (dark text on light background for contrast)
  --button-warning-background-color: var(--warning-500);
  --button-warning-background-color-hover: var(--warning-500);
  --button-warning-background-color-disabled: var(--warning-500);
  --button-warning-text-color: var(--neutrals-800);
  --button-warning-text-color-disabled: var(--neutrals-800);
  --button-warning-border-color: var(--warning-500);
  --button-warning-border-color-hover: var(--warning-500);
  --button-warning-border-color-disabled: var(--warning-500);

  // SUCCESS
  --button-success-background-color: var(--success-700);
  --button-success-background-color-hover: var(--success-700);
  --button-success-background-color-disabled: var(--success-700);
  --button-success-text-color: var(--additional-50);
  --button-success-text-color-disabled: var(--additional-50);
  --button-success-border-color: var(--success-700);
  --button-success-border-color-hover: var(--success-700);
  --button-success-border-color-disabled: var(--success-700);

  // INFO
  --button-info-background-color: var(--info-700);
  --button-info-background-color-hover: var(--info-700);
  --button-info-background-color-disabled: var(--info-700);
  --button-info-text-color: var(--additional-50);
  --button-info-text-color-disabled: var(--additional-50);
  --button-info-border-color: var(--info-700);
  --button-info-border-color-hover: var(--info-700);
  --button-info-border-color-disabled: var(--info-700);

  // OUTLINE (transparent bg, border from secondary)
  --button-outline-background-color: transparent;
  --button-outline-background-color-hover: var(--primary-50);
  --button-outline-background-color-disabled: transparent;
  --button-outline-text-color: var(--neutrals-700);
  --button-outline-text-color-disabled: var(--neutrals-400);
  --button-outline-border-color: var(--secondary-300);
  --button-outline-border-color-hover: var(--secondary-400);
  --button-outline-border-color-disabled: var(--secondary-300);

  // GHOST (no border, no bg)
  --button-ghost-background-color: transparent;
  --button-ghost-background-color-hover: var(--primary-50);
  --button-ghost-background-color-disabled: transparent;
  --button-ghost-text-color: var(--neutrals-700);
  --button-ghost-text-color-disabled: var(--neutrals-400);
  --button-ghost-border-color: transparent;
  --button-ghost-border-color-hover: transparent;
  --button-ghost-border-color-disabled: transparent;

  // LINK (text link style)
  --button-link-background-color: transparent;
  --button-link-background-color-hover: transparent;
  --button-link-background-color-disabled: transparent;
  --button-link-text-color: var(--primary-700);
  --button-link-text-color-disabled: var(--neutrals-400);
  --button-link-border-color: transparent;
  --button-link-border-color-hover: transparent;
  --button-link-border-color-disabled: transparent;

  // FOCUS RING
  --button-focus-ring-color: var(--primary-300);
  --button-focus-ring-width: 2px;
  --button-focus-ring-offset: 2px;

  // SIZING — exact shadcn New York values
  --button-border-radius: 6px;

  // sm: h-8 px-3 text-xs (no vertical padding, fixed height)
  --button-sm-height: 32px;
  --button-sm-padding-hor: 12px;

  // default: h-9 px-4 py-2
  --button-default-height: 36px;
  --button-default-padding-hor: 16px;
  --button-default-padding-vert: 8px;

  // lg: h-10 px-6 (no vertical padding, fixed height)
  --button-lg-height: 40px;
  --button-lg-padding-hor: 24px;

  // icon: h-9 w-9 square
  --button-icon-size: 36px;
}

$variants: primary, secondary, danger, warning, success, info, outline, ghost, link;

.vc-button {
  &__icon + &__title {
    @apply tw-ml-2 tw-text-left;
  }

  &_loading {
    @apply tw-cursor-wait #{!important};
  }

  @each $variant in $variants {
    &.vc-button-#{$variant} {
      @apply tw-inline-flex tw-items-center tw-font-medium tw-cursor-pointer tw-box-border
        tw-transition-colors tw-duration-150 tw-ease-in-out
        tw-rounded-[var(--button-border-radius)]
        tw-bg-[color:var(--button-#{$variant}-background-color)]
        tw-border tw-border-[color:var(--button-#{$variant}-border-color)] tw-border-solid
        tw-flex tw-justify-center
        tw-text-[color:var(--button-#{$variant}-text-color)];

      &:hover:not(:disabled) {
        @apply tw-opacity-90;
      }

      // Keyboard focus only — shadcn focus-visible ring
      &:focus-visible {
        @apply tw-outline-none
          tw-ring-[length:var(--button-focus-ring-width)]
          tw-ring-offset-[length:var(--button-focus-ring-offset)]
          tw-ring-[color:var(--button-focus-ring-color)];
      }

      // Clean disabled — shadcn pattern
      &:disabled {
        @apply tw-opacity-50 tw-cursor-not-allowed tw-pointer-events-none;
      }

      // text modifier — ghost-like appearance (backward compat)
      &.vc-button_text {
        @apply tw-border-none tw-bg-transparent
          tw-text-[color:var(--button-#{$variant}-background-color)]
          hover:tw-text-[color:var(--button-#{$variant}-background-color-hover)]
          focus:tw-text-[color:var(--button-#{$variant}-background-color-hover)]
          disabled:tw-text-[color:var(--button-#{$variant}-text-color-disabled)] disabled:tw-opacity-50;

        @apply tw-p-0 tw-min-h-0 #{!important};

        &:hover:not(:disabled) {
          @apply tw-opacity-100;
        }
      }

      &.vc-button_selected {
        @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)];

        &.vc-button_text {
          @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)] tw-bg-opacity-[0.07] tw-p-1;
          @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)] tw-bg-opacity-[0.07] tw-p-1;
        }
      }

      // Size: sm — h-8 px-3 text-xs (no vertical padding)
      &.vc-button_sm {
        @apply tw-h-[var(--button-sm-height)] tw-px-[var(--button-sm-padding-hor)] tw-py-0 tw-text-xs #{!important};
      }

      // Size: default — h-9 px-4 py-2
      &.vc-button_default {
        @apply tw-h-[var(--button-default-height)] tw-py-[var(--button-default-padding-vert)] tw-px-[var(--button-default-padding-hor)] tw-text-sm tw-leading-4;
      }

      // Size: lg — h-10 px-6 (no vertical padding)
      &.vc-button_lg {
        @apply tw-h-[var(--button-lg-height)] tw-px-[var(--button-lg-padding-hor)] tw-py-0 tw-text-sm tw-leading-4 #{!important};
      }

      // Size: icon — h-9 w-9 square
      &.vc-button_icon {
        @apply tw-h-[var(--button-icon-size)] tw-w-[var(--button-icon-size)] tw-p-0 #{!important};
      }

      .vc-button__icon + .vc-button__title {
        @apply tw-ml-2;
      }
    }
  }

  // Special hover overrides for structural variants (bg change, not just opacity)
  &.vc-button-secondary:hover:not(:disabled):not(.vc-button_text) {
    @apply tw-opacity-100 tw-bg-[color:var(--button-secondary-background-color-hover)]
      tw-border-[color:var(--button-secondary-border-color-hover)];
  }

  &.vc-button-outline:hover:not(:disabled):not(.vc-button_text) {
    @apply tw-opacity-100 tw-bg-[color:var(--button-outline-background-color-hover)]
      tw-border-[color:var(--button-outline-border-color-hover)];
  }

  &.vc-button-ghost:hover:not(:disabled):not(.vc-button_text) {
    @apply tw-opacity-100 tw-bg-[color:var(--button-ghost-background-color-hover)];
  }

  &.vc-button-link {
    // Link variant: no padding, no min-height — behaves like inline text
    @apply tw-p-0 tw-h-auto tw-min-h-0 #{!important};

    &:hover:not(:disabled):not(.vc-button_text) {
      @apply tw-opacity-100;

      // Underline only on text, not icon — prevents split underline with icon+text
      .vc-button__title {
        @apply tw-underline tw-underline-offset-4;
      }
    }
  }
}
</style>
