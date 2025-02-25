<template>
  <div
    ref="target"
    class="vc-tooltip"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <div
      ref="tooltipCompRef"
      class="vc-tooltip__trigger"
    >
      <slot></slot>
    </div>

    <teleport :to="`#${appContainer}`">
      <span
        v-if="tooltipVisible && $slots['tooltip']"
        ref="tooltipRef"
        :style="floatingStyles"
        class="vc-tooltip__content"
      >
        <slot name="tooltip"></slot>
      </span>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { useFloating, shift, Placement, offset as floatingOffset } from "@floating-ui/vue";
import { getCurrentInstance, ref } from "vue";

export interface Props {
  placement?: Placement;
  offset?: {
    crossAxis?: number;
    mainAxis?: number;
  };
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placement: "bottom",
  offset: () => ({
    crossAxis: 0,
    mainAxis: 0,
  }),
  delay: 0,
});

defineSlots<{
  default: void;
  tooltip?: void;
}>();

const tooltipVisible = ref(false);
const tooltipCompRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const target = ref(null);
let showTimeout: NodeJS.Timeout | null = null;

const instance = getCurrentInstance();
const appContainer = instance?.appContext.app._container.id;

const { floatingStyles } = useFloating(tooltipCompRef, tooltipRef, {
  placement: props.placement,
  middleware: [floatingOffset(props.offset), shift()],
});

const showTooltip = () => {
  if (props.delay > 0) {
    showTimeout = setTimeout(() => {
      tooltipVisible.value = true;
    }, props.delay);
  } else {
    tooltipVisible.value = true;
  }
};

const hideTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }
  tooltipVisible.value = false;
};
</script>

<style lang="scss">
:root {
  --tooltip-background-color: var(--additional-50);
  --tooltip-border-color: var(--base-border-color, var(--neutrals-200));
  --tooltip-shadow-color: var(--secondary-300);
  --tooltip-shadow: 1px 1px 8px rgba(var(--tooltip-shadow-color), 0.25);
  --tooltip-text-color: var(--neutrals-600);
}

.vc-tooltip {
  &__trigger {
    @apply tw-inline-flex tw-w-full tw-h-full;
  }

  &__content {
    @apply tw-absolute tw-z-[1002] tw-bg-[color:var(--tooltip-background-color)] tw-border tw-border-solid tw-border-[color:var(--tooltip-border-color)] tw-shadow-lg tw-rounded tw-text-[color:var(--tooltip-text-color)] tw-font-normal tw-py-1 tw-px-2;
  }
}
</style>
