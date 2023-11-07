<template>
  <div class="tw-flex tw-flex-nowrap tw-font-bold tw-relative">
    <span class="tw-truncate"><slot></slot></span>
    <span
      v-if="required"
      class="tw-text-[color:var(--label-required-color)] tw-ml-1"
      >*</span
    >
    <span
      v-if="multilanguage"
      class="tw-text-[color:var(--app-menu-item-icon-color)] tw-absolute tw-right-0"
    >
      {{ currentLanguage }}
    </span>
    <span
      v-if="$slots['tooltip']"
      class="tw-grow tw-basis-0 tw-ml-1"
    >
      <VcIcon
        class="tw-text-[color:var(--label-tooltip-color)]"
        :icon="tooltipIcon"
        size="s"
        @mouseenter="tooltipVisible = true"
        @mouseleave="tooltipVisible = false"
      ></VcIcon>
      <span
        v-if="tooltipVisible"
        class="tw-absolute tw-z-10 tw-bg-white tw-border tw-border-solid tw-border-[color:#eef0f2] tw-shadow-[1px_1px_8px_rgba(126,142,157,0.25)] tw-rounded-[3px] tw-text-[color:#8e9daa] tw-font-normal tw-py-1 tw-px-2 tw-ml-4"
      >
        <slot name="tooltip"></slot>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../../components";
import { ref } from "vue";

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
  default: (props: any) => any;
  tooltip?: (props: any) => any;
}>();

const tooltipVisible = ref(false);
</script>

<style lang="scss">
:root {
  --label-required-color: #f14e4e;
  --label-tooltip-color: #d3e0ee;
}
</style>
