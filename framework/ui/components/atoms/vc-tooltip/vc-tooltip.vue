<template>
  <div
    ref="target"
    class="vc-tooltip"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focusin="showTooltip"
    @focusout="hideTooltip"
    @keydown.escape="hideTooltip"
  >
    <div
      ref="tooltipCompRef"
      class="vc-tooltip__trigger"
      :aria-describedby="tooltipVisible ? tooltipId : undefined"
    >
      <slot></slot>
    </div>

    <teleport :to="teleportTarget" defer>
      <Transition name="vc-tooltip-fade">
        <div
          v-if="tooltipVisible && !disabled && $slots['tooltip']"
          :id="tooltipId"
          ref="tooltipRef"
          role="tooltip"
          :style="tooltipStyle"
          class="vc-tooltip__wrapper"
          :class="`vc-tooltip__wrapper--${variant}`"
        >
          <!-- Arrow: rotated square, inner half hidden by body (z-index) -->
          <div
            v-if="arrow"
            ref="arrowRef"
            class="vc-tooltip__arrow"
            :class="`vc-tooltip__arrow--${variant}`"
            :style="arrowStyle"
          />
          <!-- Body: sits on top of arrow via z-index, covers inner half -->
          <div class="vc-tooltip__body" :class="`vc-tooltip__body--${variant}`">
            <slot name="tooltip"></slot>
          </div>
        </div>
      </Transition>
    </teleport>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import {
  arrow as arrowMiddleware,
  flip,
  offset as offsetMiddleware,
  shift,
  autoUpdate,
  useFloating,
  type Placement,
} from "@floating-ui/vue";
import { computed, onBeforeUnmount, ref, useId } from "vue";
import { useTeleportTarget } from "@ui/composables";

export type TooltipPlacement =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end";

export type TooltipVariant = "default" | "dark" | "info";

export interface Props {
  placement?: TooltipPlacement;
  offset?: {
    crossAxis?: number;
    mainAxis?: number;
  };
  delay?: number;
  arrow?: boolean;
  variant?: TooltipVariant;
  maxWidth?: number | string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placement: "bottom",
  offset: () => ({
    crossAxis: 0,
    mainAxis: 8,
  }),
  delay: 0,
  arrow: true,
  variant: "default",
  maxWidth: 240,
  disabled: false,
});

defineSlots<{
  default: (props: any) => any;
  tooltip?: (props: any) => any;
}>();

const tooltipId = `vc-tooltip-${useId()}`;
const tooltipVisible = ref(false);
const tooltipCompRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
const target = ref<HTMLElement | null>(null);
let showTimeout: ReturnType<typeof setTimeout> | null = null;

const ARROW_SIZE = 8;

const { teleportTarget } = useTeleportTarget();

const middleware = computed(() => {
  const mw = [
    offsetMiddleware({
      mainAxis: props.offset?.mainAxis ?? 8,
      crossAxis: props.offset?.crossAxis ?? 0,
    }),
    flip({ padding: 8 }),
    shift({ padding: 8 }),
  ];
  if (props.arrow) {
    mw.push(arrowMiddleware({ element: arrowRef, padding: 4 }));
  }
  return mw;
});

const { floatingStyles, placement: resolvedPlacement, middlewareData } = useFloating(
  tooltipCompRef,
  tooltipRef,
  {
    placement: computed(() => props.placement as Placement),
    whileElementsMounted: autoUpdate,
    middleware,
  },
);

const resolvedMaxWidth = computed(() => {
  if (typeof props.maxWidth === "number") return `${props.maxWidth}px`;
  return props.maxWidth;
});

const tooltipStyle = computed(() => ({
  ...floatingStyles.value,
  maxWidth: resolvedMaxWidth.value,
}));

const side = computed(() => {
  return resolvedPlacement.value.split("-")[0] as "top" | "right" | "bottom" | "left";
});

const arrowStyle = computed(() => {
  const data = middlewareData.value.arrow;
  if (!data) return {};

  const style: Record<string, string> = {};

  if (data.x != null) style.left = `${data.x}px`;
  if (data.y != null) style.top = `${data.y}px`;

  // Place on the opposite side, offset by half (rotated square center at edge)
  const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[side.value]!;
  style[staticSide] = `${-ARROW_SIZE / 2}px`;

  return style;
});

const showTooltip = () => {
  if (props.disabled) return;
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

onBeforeUnmount(() => {
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }
});
</script>

<style lang="scss">
:root {
  --tooltip-bg: var(--additional-50);
  --tooltip-text: var(--neutrals-700);
  --tooltip-dark-bg: var(--neutrals-800);
  --tooltip-dark-text: var(--additional-50);
  --tooltip-info-bg: var(--primary-600);
  --tooltip-info-text: var(--additional-50);
  --tooltip-border-radius: 6px;
  --tooltip-font-size: 12px;
  --tooltip-padding-x: 10px;
  --tooltip-padding-y: 6px;
  --tooltip-z-index: 1002;
}

.vc-tooltip {
  &__trigger {
    @apply tw-inline-flex tw-w-full tw-h-full;
  }

  // Wrapper: positioned by floating-ui, holds arrow + body
  &__wrapper {
    @apply tw-absolute;
    z-index: var(--tooltip-z-index);
    width: max-content;
    pointer-events: none;

    // drop-shadow on wrapper traces the composited silhouette (body + visible arrow)
    &--default {
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.12));
    }

    &--dark {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
    }

    &--info {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
    }
  }

  // Body: sits ON TOP of arrow (z-index: 1), its background covers arrow's inner half
  &__body {
    @apply tw-relative tw-z-[1] tw-leading-snug tw-font-normal;
    border-radius: var(--tooltip-border-radius);
    font-size: var(--tooltip-font-size);
    padding: var(--tooltip-padding-y) var(--tooltip-padding-x);

    &--default {
      background-color: var(--tooltip-bg);
      color: var(--tooltip-text);
    }

    &--dark {
      background-color: var(--tooltip-dark-bg);
      color: var(--tooltip-dark-text);
    }

    &--info {
      background-color: var(--tooltip-info-bg);
      color: var(--tooltip-info-text);
    }
  }

  // Arrow: rotated 45° square behind body — only outer half is visible
  &__arrow {
    @apply tw-absolute;
    width: 8px;
    height: 8px;
    transform: rotate(45deg);

    &--default {
      background-color: var(--tooltip-bg);
    }

    &--dark {
      background-color: var(--tooltip-dark-bg);
    }

    &--info {
      background-color: var(--tooltip-info-bg);
    }
  }
}

// Transition: opacity only (floating-ui uses transform for positioning)
.vc-tooltip-fade-enter-active {
  transition: opacity 150ms ease-out;
}

.vc-tooltip-fade-leave-active {
  transition: opacity 100ms ease-in;
}

.vc-tooltip-fade-enter-from,
.vc-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
