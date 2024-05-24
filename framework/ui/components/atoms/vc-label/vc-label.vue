<template>
  <div class="tw-flex tw-flex-row tw-justify-between tw-items-center tw-relative">
    <div class="tw-flex-nowrap tw-font-bold tw-truncate">
      <span class="tw-truncate">
        <slot></slot>
      </span>
      <span
        v-if="required"
        class="tw-text-[color:var(--label-required-color)] tw-ml-1"
        >*</span
      >
    </div>
    <span
      v-if="$slots['tooltip']"
      class="tw-grow tw-basis-0 tw-ml-1 tw-relative"
    >
      <VcTooltip placement="top-start">
        <VcIcon
          class="tw-text-[color:var(--label-tooltip-color)]"
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
      class="tw-text-[color:var(--app-menu-item-icon-color)] tw-shrink-0"
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
  --label-required-color: #f14e4e;
  --label-tooltip-color: #d3e0ee;
}
</style>
