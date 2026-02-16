<template>
  <ToolbarBaseButton
    v-bind="$props"
    class="vc-blade-toolbar-circle-button"
    :class="{
      'vc-blade-toolbar-circle-button--main': isMain,
      'vc-blade-toolbar-circle-button--mobile': isMobile,
      'vc-blade-toolbar-circle-button--expanded': isExpanded,
    }"
    :content-direction="contentDirection"
    :icon-class-name="iconClassName"
    :title-class-name="titleClassName"
  />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import ToolbarBaseButton from "./ToolbarBaseButton.vue";
import type { Props as BaseButtonProps } from "./toolbar-button-props";

export interface Props extends Omit<BaseButtonProps, "size" | "contentDirection" | "iconClassName"> {
  isMain?: boolean;
  isMobile?: boolean;
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isMain: false,
  isMobile: false,
  isExpanded: false,
  size: "s",
});

const contentDirection = computed(() => {
  if (props.isMobile && props.isMain && !props.isExpanded) {
    return "row";
  }
  return "row-reverse";
});

const iconClassName = computed(() => {
  const classes = ["vc-blade-toolbar-circle-button__icon"];
  if (props.isMain) {
    classes.push("vc-blade-toolbar-circle-button__icon--main");
  }
  if (props.isExpanded) {
    classes.push("vc-blade-toolbar-circle-button__icon--main-expanded");
  }
  return classes.join(" ");
});

const titleClassName = computed(() => {
  const classes = ["vc-blade-toolbar-circle-button__title"];
  if (props.isMain) {
    classes.push("vc-blade-toolbar-circle-button__title--main");
  }

  return classes.join(" ");
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-circle-button-text-color: var(--additional-50);
  --blade-toolbar-circle-button-bg-color: var(--neutrals-500);
  --blade-toolbar-circle-button-main-bg-color: var(--primary-500);
}

.vc-blade-toolbar-circle-button {
  &:hover:not(.vc-blade-toolbar-base-button--disabled) {
    .vc-blade-toolbar-base-button__title,
    .vc-blade-toolbar-base-button__icon {
      @apply tw-text-[var(--blade-toolbar-circle-button-text-color)] #{!important};
    }
  }

  &__icon {
    @apply tw-w-9 tw-h-9 tw-bg-[var(--blade-toolbar-circle-button-bg-color)] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-[var(--blade-toolbar-circle-button-text-color)];

    &--main {
      @apply tw-flex tw-w-auto tw-bg-[var(--blade-toolbar-circle-button-main-bg-color)];
    }

    &--main-expanded {
      @apply tw-flex tw-w-[46px] tw-h-[46px] tw-bg-[var(--blade-toolbar-circle-button-main-bg-color)] tw-ml-0;
    }
  }

  &__title {
    @apply tw-text-xs tw-text-[var(--blade-toolbar-circle-button-text-color)];

    &--main {
      @apply tw-text-[var(--blade-toolbar-circle-button-text-color)];
    }
  }

  &--main {
    @apply tw-px-4;
  }
}
</style>
