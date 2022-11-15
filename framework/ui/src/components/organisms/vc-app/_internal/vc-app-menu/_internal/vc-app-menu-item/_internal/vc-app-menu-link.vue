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
      <VcIcon icon="fas fa-ellipsis-v" size="m" />
    </div>
    <div v-if="icon" class="vc-app-menu-item__icon">
      <VcIcon :icon="icon" size="m" />
    </div>
    <div class="vc-app-menu-item__title">
      {{ title }}
      <VcIcon
        class="vc-app-menu-item__title-icon"
        icon="fas fa-chevron-down"
        size="xs"
        v-if="children.length"
      ></VcIcon>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { BladeComponent } from "../../../../../../../../typings";

interface Props {
  isActive?: boolean;
  children?: BladeComponent;
  sticky?: boolean;
  icon: string;
  title: string;
}

withDefaults(defineProps<Props>(), {
  isActive: false,
  children: () => ({}),
  sticky: true,
  icon: "",
  title: "",
});
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
  @apply flex items-center w-full h-[var(--app-menu-item-height)]
  border-none
  flex-nowrap box-border cursor-pointer relative uppercase;

  &_active {
    @apply bg-[color:var(--app-menu-item-background-color-hover)]
    rounded-[var(--app-menu-item-hover-radius)]
    before:opacity-100;
  }

  &__handler {
    @apply w-[var(--app-menu-item-handler-width)]
    text-[color:var(--app-menu-item-handler-color)]
    text-center invisible shrink-0;

    &_enabled {
      @apply cursor-move;
    }
  }

  &__icon {
    @apply w-[var(--app-menu-item-icon-width)]
    text-[color:var(--app-menu-item-icon-color)]
    overflow-hidden flex
    justify-center shrink-0 transition-[color] duration-200;
  }

  &_active &__icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &__title {
    @apply text-ellipsis overflow-hidden whitespace-nowrap
    text-lg
    font-medium
    px-3
    text-[color:var(--app-menu-item-title-color)]
    [transition:color_0.2s_ease] [transition:opacity_0.1s_ease]
    opacity-100 w-full;
  }

  &__title-icon {
    @apply text-[color:var(--app-menu-item-icon-color)] ml-3;
  }

  &_active &__title {
    @apply text-[color:var(--app-menu-item-title-color-active)]
    font-bold;
  }

  &_active &__title-icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover {
    @apply bg-[color:var(--app-menu-item-background-color-hover)]
    rounded-[var(--app-menu-item-hover-radius)];
  }

  &:hover &__title {
    @apply text-[color:var(--app-menu-item-title-color-active)];
  }

  &:hover &__icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__title-icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__handler {
    &_enabled {
      @apply invisible;
    }
  }
}
</style>
