<template>
  <div
    class="vc-menu-item"
    :class="{
      'vc-menu-item--active': isActive,
      'vc-menu-item--clickable': !disabled,
      'vc-menu-item--invisible': !isVisible,
    }"
  >
    <!-- Trigger -->
    <div
      class="vc-menu-item__trigger"
      @click.stop="handleTriggerClick"
    >
      <slot name="trigger">
        <div class="vc-menu-item__content">
          <slot name="icon">
            <VcIcon
              v-if="icon"
              :icon="icon"
              size="l"
              class="vc-menu-item__icon"
            />
            <VcImage
              v-else-if="image"
              :src="image"
              class="vc-menu-item__image"
              :empty-icon="emptyIcon"
            />
          </slot>

          <slot name="title">
            <p class="vc-menu-item__title">{{ title }}</p>
          </slot>

          <slot name="additional" />
        </div>
      </slot>
    </div>

    <!-- Content -->
    <slot name="content" />
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { Component } from "vue";
import { VcIcon, VcImage } from "../../../ui/components";

interface Props {
  title?: string;
  icon?: string | Component;
  image?: string;
  emptyIcon?: string;
  isActive?: boolean;
  disabled?: boolean;
  isVisible?: boolean;
  triggerAction?: "click" | "hover" | "none";
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
  triggerAction: "click",
});

defineSlots<{
  trigger: (props: any) => any;
  icon: (props: any) => any;
  title: (props: any) => any;
  additional: (props: any) => any;
  content: (props: any) => any;
}>();

const emit = defineEmits<{
  (e: "trigger:click"): void;
  (e: "trigger:hover"): void;
}>();

const handleTriggerClick = () => {
  if (props.disabled || props.triggerAction === "none") return;
  emit("trigger:click");
};
</script>

<style lang="scss">
:root {
  --menu-item-text-color: var(--additional-950);
  --menu-item-border-color: var(--neutrals-200);
  --menu-item-bg: transparent;
  --menu-item-bg-hover: var(--primary-50);
  --menu-item-icon-color-hover: var(--primary-700);
  --menu-item-bg-active: var(--primary-50);
}

.vc-menu-item {
  @apply tw-flex tw-flex-col;

  &__trigger {
    @apply tw-p-3 tw-text-sm tw-text-[color:var(--menu-item-text-color)]
      tw-border-solid tw-border-b tw-border-b-[color:var(--menu-item-border-color)]
      tw-bg-[color:var(--menu-item-bg)] tw-flex tw-flex-row tw-items-center;
  }

  &--clickable {
    @apply tw-cursor-pointer;

    &:hover {
      @apply tw-bg-[color:var(--menu-item-bg-hover)];
    }
  }

  &--invisible {
    @apply tw-hidden;
  }

  &--active {
    @apply tw-bg-[color:var(--menu-item-bg-active)];
  }

  &:last-of-type {
    @apply tw-border-b-0;
  }

  &__content {
    @apply tw-flex tw-items-center tw-w-full;
  }

  &__icon {
    @apply tw-w-6 tw-mr-3 tw-text-[color:var(--menu-item-icon-color)] tw-text-[16px];
  }

  &__image {
    @apply tw-w-6 tw-h-6 tw-mr-3;
  }

  &__title {
    @apply tw-flex-grow;
  }
}
</style>
