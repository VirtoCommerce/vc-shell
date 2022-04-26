<template>
  <div
    class="text-[color:var(--link-text-color)] no-underline cursor-pointer transition duration-200 inline-block hover:text-[color:var(--link-text-color-hover)] hover:underline"
    :class="{
      'vc-text-[color:var(--link-text-color-active)] no-underline': active,
      'cursor-not-allowed text-[color:var(--link-text-color-disabled)] hover:text-[color:var(--link-text-color-disabled)] no-underline':
        disabled,
    }"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["click"]);
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
</style>
