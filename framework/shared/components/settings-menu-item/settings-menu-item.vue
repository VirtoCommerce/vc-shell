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
      ref="triggerRef"
      class="vc-menu-item__trigger"
      @click.stop="handleTriggerClick"
    >
      <slot name="trigger">
        <div class="vc-menu-item__content">
          <slot name="icon">
            <VcIcon
              v-if="icon"
              :icon="icon"
              :custom-size="16"
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

          <slot name="additional">
            <span
              v-if="value"
              class="vc-menu-item__value"
            >{{ value }}</span>
          </slot>

          <VcIcon
            v-if="showChevron"
            icon="fas fa-chevron-right"
            size="xs"
            class="vc-menu-item__chevron"
          />
        </div>
      </slot>
    </div>

    <!-- Content -->
    <slot name="content" />
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { Component, ref } from "vue";
import { VcIcon, VcImage } from "@ui/components";

interface Props {
  title?: string;
  icon?: string | Component;
  image?: string;
  emptyIcon?: string;
  isActive?: boolean;
  disabled?: boolean;
  isVisible?: boolean;
  triggerAction?: "click" | "hover" | "none";
  value?: string;
  showChevron?: boolean;
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

const triggerRef = ref<HTMLElement | null>(null);

const handleTriggerClick = () => {
  if (props.disabled || props.triggerAction === "none") return;
  emit("trigger:click");
};

defineExpose({ triggerRef });
</script>

<style lang="scss">
:root {
  --menu-item-text-color: var(--additional-950);
  --menu-item-border-color: var(--neutrals-200);
  --menu-item-bg: transparent;
  --menu-item-bg-hover: var(--neutrals-100);
  --menu-item-icon-color: var(--neutrals-600);
  --menu-item-bg-active: var(--neutrals-100);
  --menu-item-value-color: var(--neutrals-500);
  --menu-item-chevron-color: var(--neutrals-400);
}

.vc-menu-item {
  @apply tw-flex tw-flex-col;

  &__trigger {
    @apply tw-mx-1 tw-px-2 tw-py-[7px] tw-rounded-md tw-text-sm tw-text-[color:var(--menu-item-text-color)]
      tw-bg-[color:var(--menu-item-bg)] tw-flex tw-flex-row tw-items-center
      tw-transition-colors tw-duration-150;
  }

  &--clickable {
    @apply tw-cursor-pointer;

    .vc-menu-item__trigger:hover {
      @apply tw-bg-[color:var(--menu-item-bg-hover)];
    }
  }

  &--invisible {
    @apply tw-hidden;
  }

  &--active {
    .vc-menu-item__trigger {
      @apply tw-bg-[color:var(--menu-item-bg-active)];
    }
  }

  &__content {
    @apply tw-flex tw-items-center tw-w-full tw-gap-2;
  }

  &__icon {
    @apply tw-shrink-0 tw-text-[color:var(--menu-item-icon-color)];
  }

  &__image {
    @apply tw-w-4 tw-h-4 tw-shrink-0 tw-object-contain;
  }

  &__title {
    @apply tw-flex-grow tw-truncate;
  }

  &__value {
    @apply tw-text-[color:var(--menu-item-value-color)] tw-text-xs tw-shrink-0 tw-ml-auto;
  }

  &__chevron {
    @apply tw-text-[color:var(--menu-item-chevron-color)] tw-text-[10px] tw-shrink-0 tw-ml-1;
  }
}
</style>
