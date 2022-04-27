<template>
  <div class="flex flex-nowrap font-bold">
    <span><slot></slot></span>
    <span v-if="required" class="text-[color:var(--label-required-color)] ml-1"
      >*</span
    >
    <span v-if="$slots['tooltip']" class="grow ml-1">
      <VcIcon
        class="text-[color:var(--label-tooltip-color)]"
        :icon="tooltipIcon"
        size="s"
        @mouseenter="tooltipVisible = true"
        @mouseleave="tooltipVisible = false"
      ></VcIcon>
      <span
        class="absolute z-10 bg-white border border-solid border-[color:#eef0f2] shadow-[1px_1px_8px_rgba(126,142,157,0.25)] rounded-[3px] text-[color:#8e9daa] font-normal py-1 px-2 ml-4"
        v-if="tooltipVisible"
      >
        <slot name="tooltip"></slot>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import VcIcon from "../vc-icon/vc-icon.vue";
import { ref } from "vue";

defineProps({
  required: {
    type: Boolean,
    default: false,
  },

  tooltipIcon: {
    type: String,
    default: "fas fa-info-circle",
  },
});

const tooltipVisible = ref(false);
</script>

<style lang="scss">
:root {
  --label-required-color: #f14e4e;
  --label-tooltip-color: #d3e0ee;
}
</style>
