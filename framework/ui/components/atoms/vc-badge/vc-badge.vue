<template>
  <div
    class="tw-inline-block tw-rounded-[var(--badge-border-radius)] tw-py-1 tw-px-2 tw-text-base tw-font-normal tw-bg-[color:var(--badge-background-color)] tw-text-[color:var(--badge-text-color)] tw-border tw-border-solid tw-border-[color:var(--badge-border-color)] tw-transition tw-duration-200"
    :class="{
      'tw-bg-[color:var(--badge-background-color-active)] tw-text-[color:var(--badge-text-color-active)] tw-border-[color:var(--badge-border-color-active)]':
        active,
      'tw-cursor-pointer hover:tw-bg-[color:var(--badge-background-color-active)] hover:tw-text-[color:var(--badge-text-color-hover)] hover:tw-border-[color:var(--badge-border-color-hover)]':
        clickable,
      'cursor-not-allowed tw-bg-[color:var(--badge-background-color-disabled)] tw-text-[color:var(--badge-text-color-disabled)] tw-border-[color:var(--badge-border-color-disabled)] hover:tw-bg-[color:var(--badge-background-color-disabled)] hover:tw-text-[color:var(--badge-text-color-disabled)] hover:tw-border-[color:var(--badge-border-color-disabled)]':
        disabled,
    }"
    @click="onClick"
  >
    <slot name="default"></slot>
  </div>
</template>

<script lang="ts" setup>
import {
  VcBadgeProps,
} from "./vc-badge-model";

const props = withDefaults(defineProps<VcBadgeProps>(), {
  active: false,
  disabled: false,
  clickable: true,
});
const emit = defineEmits(["click"]);

function onClick(): void {
  if (props.clickable && !props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
:root {
  --badge-background-color: #ffffff;
  --badge-background-color-hover: #fafafa;
  --badge-background-color-active: #fafafa;
  --badge-background-color-disabled: #f2f2f2;

  --badge-text-color: #455668;
  --badge-text-color-hover: #3b4959;
  --badge-text-color-active: #3b4959;
  --badge-text-color-disabled: #8296ab;

  --badge-border-radius: 35px;

  --badge-border-color: #a1bfd4;
  --badge-border-color-hover: #8fb3cc;
  --badge-border-color-active: #8fb3cc;
  --badge-border-color-disabled: #b2cbdc;
}
</style>
