<template>
  <component
    :is="htmlFor ? 'label' : 'div'"
    class="vc-label"
    :class="{
      'vc-label--error': error,
    }"
    :for="htmlFor || undefined"
  >
    <div class="vc-label__text">
      <span class="vc-label__content">
        <slot></slot>
      </span>
      <span
        v-if="required"
        class="vc-label__required"
        aria-hidden="true"
        >*</span
      >
    </div>
    <span
      v-if="$slots['tooltip']"
      class="vc-label__tooltip"
    >
      <VcTooltip placement="top-start">
        <VcIcon
          class="vc-label__tooltip-icon"
          :icon="tooltipIcon"
          size="s"
        ></VcIcon>
        <template #tooltip>
          <slot name="tooltip"></slot>
        </template>
      </VcTooltip>
    </span>

    <div
      v-if="multilanguage"
      class="vc-label__language"
    >
      {{ currentLanguage }}
    </div>
  </component>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { VcIcon, VcTooltip } from "@ui/components";

export interface Props {
  /**
   * Shows required field indicator (asterisk)
   */
  required?: boolean;
  /**
   * Icon to use for the tooltip
   */
  tooltipIcon?: string;
  /**
   * Shows language indicator for multilanguage fields
   */
  multilanguage?: boolean;
  /**
   * Current language code to display
   */
  currentLanguage?: string;
  /**
   * Shows the label in error state
   */
  error?: boolean;
  /**
   * HTML `for` attribute — links the label to the input with matching id.
   * When provided, renders as `<label>` instead of `<div>`.
   */
  htmlFor?: string;
}

withDefaults(defineProps<Props>(), {
  tooltipIcon: "lucide-info",
});

defineSlots<{
  default: (props: any) => any;
  tooltip?: (props: any) => any;
}>();
</script>

<style lang="scss">
:root {
  --label-text-color: var(--neutrals-700);
  --label-required-color: var(--danger-500);
  --label-tooltip-color: var(--neutrals-400);
  --label-lang-color: var(--neutrals-500);
  --label-error-color: var(--danger-500);
}

.vc-label {
  @apply tw-flex tw-flex-row tw-justify-between tw-items-center tw-relative tw-text-[color:var(--label-text-color)];

  &__text {
    @apply tw-flex-nowrap tw-font-medium tw-truncate;
  }

  &__content {
    @apply tw-truncate tw-text-sm;
  }

  &__required {
    @apply tw-text-[color:var(--label-required-color)] tw-ml-0.5;
  }

  &__tooltip {
    @apply tw-grow-0 tw-basis-0 tw-ml-1 tw-relative tw-mr-auto;
  }

  &__tooltip-icon {
    @apply tw-text-[color:var(--label-tooltip-color)] tw-transition-colors tw-duration-150;

    &:hover {
      @apply tw-text-neutrals-600;
    }
  }

  &__language {
    @apply tw-text-[color:var(--label-lang-color)] tw-shrink-0 tw-text-xs tw-font-normal tw-bg-neutrals-100 tw-rounded tw-px-1.5 tw-py-0.5;
  }

  &--error &__text {
    @apply tw-text-[color:var(--label-error-color)];
  }
}
</style>
