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
      <VcIcon
        ref="tooltipIconRef"
        class="tw-text-[color:var(--label-tooltip-color)]"
        :icon="tooltipIcon"
        size="s"
        @mouseenter="tooltipVisible = true"
        @mouseleave="tooltipVisible = false"
      ></VcIcon>
      <teleport to="body">
        <span
          v-if="tooltipVisible"
          ref="tooltipRef"
          :style="floatingStyles"
          class="tw-absolute tw-z-10 tw-bg-white tw-border tw-border-solid tw-border-[color:#eef0f2] tw-shadow-[1px_1px_8px_rgba(126,142,157,0.25)] tw-rounded-[3px] tw-text-[color:#8e9daa] tw-font-normal tw-py-1 tw-px-2 tw-ml-4"
        >
          <slot name="tooltip"></slot>
        </span>
      </teleport>
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
import { VcIcon } from "./../../../components";
import { ref } from "vue";
import { useFloating, shift } from "@floating-ui/vue";

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

const tooltipVisible = ref(false);
const tooltipIconRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

const { floatingStyles } = useFloating(tooltipIconRef, tooltipRef, {
  placement: "top-start",
  middleware: [shift()],
});
</script>

<style lang="scss">
:root {
  --label-required-color: #f14e4e;
  --label-tooltip-color: #d3e0ee;
}
</style>
