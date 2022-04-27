<template>
  <div
    class="inline-block rounded-[var(--badge-border-radius)] py-1 px-2 text-base font-normal bg-[color:var(--badge-background-color)] text-[color:var(--badge-text-color)] border border-solid border-[color:var(--badge-border-color)] transition duration-200"
    :class="{
      'bg-[color:var(--badge-background-color-active)] text-[color:var(--badge-text-color-active)] border-[color:var(--badge-border-color-active)]':
        active,
      'cursor-pointer hover:bg-[color:var(--badge-background-color-active)] hover:text-[color:var(--badge-text-color-hover)] hover:border-[color:var(--badge-border-color-hover)]':
        clickable,
      'cursor-not-allowed bg-[color:var(--badge-background-color-disabled)] text-[color:var(--badge-text-color-disabled)] border-[color:var(--badge-border-color-disabled)] hover:bg-[color:var(--badge-background-color-disabled)] hover:text-[color:var(--badge-text-color-disabled)] hover:border-[color:var(--badge-border-color-disabled)]':
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

  clickable: {
    type: Boolean,
    default: true,
  },
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
