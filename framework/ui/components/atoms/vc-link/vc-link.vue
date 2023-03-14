<template>
  <div
    class="vc-link"
    :class="{
      'tw-text-[color:var(--link-text-color-active)] tw-no-underline': active,
      'tw-cursor-not-allowed tw-text-[color:var(--link-text-color-disabled)] hover:tw-text-[color:var(--link-text-color-disabled)] tw-no-underline':
        disabled,
    }"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { linkEmits, linkProps } from "./vc-link-model";

const props = defineProps({...linkProps});
const emit = defineEmits({...linkEmits});

function onClick(): void {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
:root {
  --link-text-color: hsl(200, 77%, 58%);
  --link-text-color-hover: hsl(200, 77%, 48%);
  --link-text-color-active: hsl(200, 77%, 48%);
  --link-text-color-disabled: hsl(200, 77%, 73%);
}

.vc-link {
  @apply tw-text-[color:var(--link-text-color)] tw-no-underline tw-cursor-pointer tw-transition  tw-duration-200 tw-inline-block hover:tw-text-[color:var(--link-text-color-hover)] hover:tw-underline;
}
</style>
