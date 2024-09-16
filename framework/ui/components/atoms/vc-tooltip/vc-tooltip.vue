<template>
  <div>
    <div
      ref="tooltipCompRef"
      class="tw-inline-flex tw-h-full tw-w-full"
      @mouseenter="tooltipVisible = true"
      @mouseleave="tooltipVisible = false"
    >
      <slot></slot>
    </div>

    <teleport to="body">
      <span
        v-if="tooltipVisible && $slots['tooltip']"
        ref="tooltipRef"
        :style="floatingStyles"
        class="tw-tooltip__content"
        @mouseenter="tooltipVisible = true"
        @mouseleave="tooltipVisible = false"
      >
        <slot name="tooltip"></slot>
      </span>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { useFloating, shift, Placement, offset as floatingOffset } from "@floating-ui/vue";
import { ref } from "vue";
export interface Props {
  placement?: Placement;
  offset?: {
    crossAxis?: number;
    mainAxis?: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  placement: "bottom-end",
  offset: () => ({
    crossAxis: 5,
    mainAxis: 5,
  }),
});

defineSlots<{
  default: void;
  tooltip?: void;
}>();

const tooltipVisible = ref(false);
const tooltipCompRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

const { floatingStyles } = useFloating(tooltipCompRef, tooltipRef, {
  placement: props.placement,
  middleware: [floatingOffset(props.offset), shift()],
});
</script>

<style lang="scss">
:root {
  --tooltip-background-color: var(--additional-50);
  --tooltip-border-color: var(--neutrals-200);
  --tooltip-shadow-color: var(--secondary-300);
  --tooltip-shadow: 1px 1px 8px rgb(from var(--tooltip-shadow-color) rgb / 25%);
  --tooltip-text-color: var(--neutrals-600);
}

.tw-tooltip {
  &__content {
    @apply tw-absolute tw-z-[101] tw-bg-[color:var(--tooltip-background-color)] tw-border tw-border-solid tw-border-[color:var(--tooltip-border-color)] [box-shadow:var(--tooltip-shadow)] tw-rounded-[3px] tw-text-[color:var(--tooltip-text-color)] tw-font-normal tw-py-1 tw-px-2;
  }
}
</style>
