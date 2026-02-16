<template>
  <button
    type="button"
    class="vc-link"
    :class="{
      'vc-link--active': active,
      'vc-link--disabled': disabled,
    }"
    :disabled="disabled"
    :aria-disabled="disabled"
    @click="onClickFn"
  >
    <slot></slot>
  </button>
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
  --link-text-color: var(--primary-500);
  --link-text-color-hover: var(--primary-400);
  --link-text-color-active: var(--primary-700);
  --link-text-color-disabled: var(--neutrals-300);
  --link-focus-ring-color: rgba(59, 130, 246, 0.3);
}

.vc-link {
  @apply tw-text-[color:var(--link-text-color)] tw-no-underline tw-cursor-pointer tw-transition tw-duration-200 tw-inline-block hover:tw-text-[color:var(--link-text-color-hover)] hover:tw-underline
    focus-visible:tw-outline-none focus-visible:tw-ring-[2px] focus-visible:tw-ring-[color:var(--link-focus-ring-color)] focus-visible:tw-rounded-sm;
  /* Reset button styles for link appearance */
  @apply tw-bg-transparent tw-border-none tw-p-0 tw-font-[inherit] tw-text-[inherit];

  &--active {
    @apply tw-text-[color:var(--link-text-color-active)] tw-no-underline hover:tw-text-[color:var(--link-text-color-active)] hover:tw-no-underline;
  }

  &--disabled {
    @apply tw-cursor-not-allowed tw-text-[color:var(--link-text-color-disabled)] tw-no-underline tw-opacity-50 hover:tw-text-[color:var(--link-text-color-disabled)] hover:tw-no-underline;
  }
}
</style>
