<template>
  <div>
    <div
      ref="tooltipCompRef"
      class="tw-inline-flex"
      @mouseenter="tooltipVisible = true"
      @mouseleave="tooltipVisible = false"
    >
      <slot></slot>
    </div>

    <teleport to="body">
      <span
        v-if="tooltipVisible"
        ref="tooltipRef"
        :style="floatingStyles"
        class="tw-absolute tw-z-[101] tw-bg-white tw-border tw-border-solid tw-border-[color:#eef0f2] tw-shadow-[1px_1px_8px_rgba(126,142,157,0.25)] tw-rounded-[3px] tw-text-[color:#8e9daa] tw-font-normal tw-py-1 tw-px-2 tw-ml-4"
      >
        <slot name="tooltip"></slot>
      </span>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { useFloating, shift, Placement, offset } from "@floating-ui/vue";
import { ref } from "vue";
export interface Props {
  placement?: Placement;
}

const props = withDefaults(defineProps<Props>(), {
  placement: "bottom-end",
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
  middleware: [
    offset({
      crossAxis: 5,
      mainAxis: 5,
    }),
    shift(),
  ],
});
</script>

<style lang="scss" scoped></style>
