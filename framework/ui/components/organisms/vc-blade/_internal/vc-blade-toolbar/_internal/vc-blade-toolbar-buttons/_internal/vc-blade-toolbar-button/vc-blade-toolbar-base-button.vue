<template>
  <button
    class="vc-blade-toolbar-base-button"
    :class="{
      'vc-blade-toolbar-base-button--disabled': disabled || isWaiting,
      'vc-blade-toolbar-base-button--with-separator-left': separator === 'left',
      'vc-blade-toolbar-base-button--with-separator-right': separator === 'right',
      'vc-blade-toolbar-base-button--with-separator-both': separator === 'both',
    }"
    :data-test-id="id ?? 'vc-blade-toolbar-button'"
    v-bind="$attrs"
    @click="handleClick"
  >
    <div
      class="vc-blade-toolbar-base-button__content"
      :style="{ flexDirection: contentDirection }"
    >
      <VcIcon
        class="vc-blade-toolbar-base-button__icon"
        :class="iconClassName"
        :icon="icon"
        :size="size"
      />
      <span
        class="vc-blade-toolbar-base-button__title"
        :class="titleClassName"
      >
        {{ title }}
      </span>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { ref, ComputedRef, Ref } from "vue";
import { VcIcon } from "../../../../../../../../";
import type { Props } from "./props";


const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: "m",
  separator: undefined,
  contentDirection: "column",
});

defineOptions({
  inheritAttrs: false,
});

const isWaiting = ref(false);

async function handleClick(): Promise<void> {
  if (props.disabled || isWaiting.value || !props.onClick) return;

  isWaiting.value = true;
  try {
    await props.onClick();
  } finally {
    isWaiting.value = false;
  }
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-base-button-separator-color: var(--neutrals-200);
  --blade-toolbar-base-button-title-color: var(--neutrals-600);
  --blade-toolbar-base-button-hover-color: var(--primary-600);
  --blade-toolbar-base-button-disabled-color: var(--neutrals-400);
  --blade-toolbar-base-button-icon-color: var(--neutrals-700);
}

.vc-blade-toolbar-base-button {
  @apply tw-px-3 tw-bg-transparent tw-border-0 tw-cursor-pointer tw-shrink;

  &__content {
    @apply tw-inline-flex tw-items-center tw-gap-1;
  }

  &__icon {
    @apply tw-text-[var(--blade-toolbar-base-button-icon-color)];
    @apply tw-flex #{!important};
  }

  &__title {
    @apply tw-text-xs tw-text-[var(--blade-toolbar-base-button-title-color)] tw-text-nowrap;
  }

  &--with-separator-left {
    @apply tw-border-l tw-border-solid tw-border-[var(--blade-toolbar-base-button-separator-color)];
  }

  &--with-separator-right {
    @apply tw-border-r tw-border-solid tw-border-[var(--blade-toolbar-base-button-separator-color)];
  }

  &--with-separator-both {
    @apply tw-border-l tw-border-r tw-border-solid tw-border-[var(--blade-toolbar-base-button-separator-color)];
  }

  &:hover:not(&--disabled) {
    .vc-blade-toolbar-base-button__icon,
    .vc-blade-toolbar-base-button__title {
      @apply tw-text-[var(--blade-toolbar-base-button-hover-color)];
    }
  }

  &--disabled {
    @apply tw-cursor-default;

    .vc-blade-toolbar-base-button__icon,
    .vc-blade-toolbar-base-button__title {
      @apply tw-text-[var(--blade-toolbar-base-button-disabled-color)];
    }
  }
}
</style>
