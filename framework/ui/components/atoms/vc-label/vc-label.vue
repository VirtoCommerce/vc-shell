<template>
  <div class="vc-label">
    <div class="vc-label__text">
      <span class="vc-label__content">
        <slot></slot>
      </span>
      <span
        v-if="required"
        class="vc-label__required"
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
  </div>
</template>

<script lang="ts" setup>
import { VcIcon, VcTooltip } from "./../../../components";

export interface Props {
  required?: boolean;
  tooltipIcon?: string;
  multilanguage?: boolean;
  currentLanguage?: string;
}

withDefaults(defineProps<Props>(), {
  tooltipIcon: "fas fa-info-circle",
});

defineSlots<{
  default: void;
  tooltip?: void;
}>();
</script>

<style lang="scss">
:root {
  --label-required-color: var(--danger-500);
  --label-tooltip-color: var(--info-400);
  --label-lang-color: var(--neutrals-500);
}

.vc-label {
  @apply tw-flex tw-flex-row tw-justify-between tw-items-center tw-relative;

  &__text {
    @apply tw-flex-nowrap tw-font-bold tw-truncate;
  }

  &__content {
    @apply tw-truncate tw-text-sm;
  }

  &__required {
    @apply tw-text-[color:var(--label-required-color)] tw-ml-1;
  }

  &__tooltip {
    @apply tw-grow-0 tw-basis-0 tw-ml-1 tw-relative tw-mr-auto;
  }

  &__tooltip-icon {
    @apply tw-text-[color:var(--label-tooltip-color)];
  }

  &__language {
    @apply tw-text-[color:var(--label-lang-color)] tw-shrink-0 tw-text-sm;
  }
}
</style>
