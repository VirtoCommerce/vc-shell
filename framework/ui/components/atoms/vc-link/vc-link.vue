<template>
  <div
    class="vc-link"
    :class="{
      'tw-text-[color:var(--link-text-color-active)] tw-no-underline': active,
      'tw-cursor-not-allowed tw-text-[color:var(--link-text-color-disabled)] hover:tw-text-[color:var(--link-text-color-disabled)] tw-no-underline':
        disabled,
    }"
    @click="onClickFn"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface Emits {
  (event: "click"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function onClickFn(): void {
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
