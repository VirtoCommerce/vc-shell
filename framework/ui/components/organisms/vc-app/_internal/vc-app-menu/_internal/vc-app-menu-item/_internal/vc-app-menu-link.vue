<template>
  <div
    class="vc-app-menu-item"
    :class="[
      { 'vc-app-menu-item_active': isActive && !children.length },
      { 'vc-app-menu-item_no-hover': children.length },
    ]"
    @click="$emit('onClick')"
  >
    <div
      class="vc-app-menu-item__handler"
      :class="{ 'vc-app-menu-item__handler_enabled': !sticky }"
    >
      <VcIcon
        icon="fas fa-ellipsis-v"
        size="m"
      />
    </div>
    <div
      v-if="icon"
      class="vc-app-menu-item__icon"
    >
      <VcIcon
        :icon="icon"
        size="m"
      />
    </div>
    <div class="vc-app-menu-item__title">
      {{ title }}
      <VcIcon
        v-if="children.length"
        class="vc-app-menu-item__title-icon"
        icon="fas fa-chevron-down"
        size="xs"
      ></VcIcon>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { BladeMenu } from "./../../../../../../../../../core/types";
import { VcIcon } from "./../../../../../../../";

export interface Props {
  isActive?: boolean;
  children?: BladeMenu[];
  sticky?: boolean;
  icon: string;
  title: string;
}

export interface Emits {
  (event: "onClick"): void;
}

withDefaults(defineProps<Props>(), {
  sticky: true,
});

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 38px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #337599;
  --app-menu-item-icon-color-active: #ffffff;
  --app-menu-item-handler-width: 10px;
  --app-menu-item-background-color-hover: #337599;
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #ffffff;
  --app-menu-item-handler-color: #bdd1df;
}

.vc-app-menu-item {
  @apply tw-flex tw-items-center tw-w-full tw-h-[var(--app-menu-item-height)]
  tw-border-none
  tw-flex-nowrap tw-box-border tw-cursor-pointer tw-relative tw-uppercase;

  &_active {
    @apply tw-bg-[color:var(--app-menu-item-background-color-hover)]
    tw-rounded-[var(--app-menu-item-hover-radius)]
    before:tw-opacity-100;
  }

  &__handler {
    @apply tw-w-[var(--app-menu-item-handler-width)]
    tw-text-[color:var(--app-menu-item-handler-color)]
    tw-text-center tw-invisible tw-shrink-0;

    &_enabled {
      @apply tw-cursor-move;
    }
  }

  &__icon {
    @apply tw-w-[var(--app-menu-item-icon-width)]
    tw-text-[color:var(--app-menu-item-icon-color)]
    tw-overflow-hidden tw-flex
    tw-justify-center tw-shrink-0  tw-transition-[color]  tw-duration-200;
  }

  &_active &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &__title {
    @apply tw-truncate
    tw-text-lg
    tw-font-medium
    tw-px-3
    tw-text-[color:var(--app-menu-item-title-color)]
    [transition:color_0.2s_ease] [transition:opacity_0.1s_ease]
    tw-opacity-100 tw-w-full;
  }

  &__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color)] tw-ml-3;
  }

  &_active &__title {
    @apply tw-text-[color:var(--app-menu-item-title-color-active)]
    tw-font-bold;
  }

  &_active &__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover {
    @apply tw-bg-[color:var(--app-menu-item-background-color-hover)]
    tw-rounded-[var(--app-menu-item-hover-radius)];
  }

  &:hover &__title {
    @apply tw-text-[color:var(--app-menu-item-title-color-active)];
  }

  &:hover &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__handler {
    &_enabled {
      @apply tw-invisible;
    }
  }
}
</style>
