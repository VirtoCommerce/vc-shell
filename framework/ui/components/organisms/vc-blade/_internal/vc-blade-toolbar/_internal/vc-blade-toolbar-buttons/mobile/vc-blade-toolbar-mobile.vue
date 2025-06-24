<template>
  <div class="vc-blade-toolbar-mobile">
    <!-- Main button with menu -->
    <div
      class="vc-blade-toolbar-mobile__pill"
      :class="{ 'vc-blade-toolbar-mobile__pill--expanded': isExpanded }"
    >
      <VcBladeToolbarCircleButton
        v-if="items[0]"
        v-bind="items[0]"
        :is-main="true"
        :is-mobile="true"
        :is-expanded="isExpanded"
        :on-click="() => handleItemClick(items[0])"
      />

      <button
        v-if="items.length > 1 && !isExpanded"
        class="vc-blade-toolbar-mobile__toggle"
        @click="toggleMenu"
      >
        <VcIcon icon="material-keyboard_arrow_up" />
      </button>
    </div>

    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-show="isExpanded"
        class="vc-blade-toolbar-mobile__overlay"
        @click="closeMenu"
      />
    </Transition>

    <!-- Vertical menu -->
    <Transition name="menu">
      <div
        v-show="isExpanded"
        class="vc-blade-toolbar-mobile__menu"
      >
        <VcBladeToolbarCircleButton
          v-for="item in items.slice(1)"
          :key="item.id"
          v-bind="item"
          :is-mobile="true"
          :on-click="() => handleItemClick(item)"
        />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcIcon } from "../../../../../../../../../";
import type { IBladeToolbar } from "../../../../../../../../../core/types";
import VcBladeToolbarCircleButton from "../_internal/vc-blade-toolbar-button/vc-blade-toolbar-circle-button.vue";

defineProps<{
  items: IBladeToolbar[];
}>();

const isExpanded = ref(false);

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function closeMenu() {
  isExpanded.value = false;
}

function handleItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
  closeMenu();
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-mobile-pill-bg-color: var(--primary-500);
  --blade-toolbar-mobile-toggle-border-color: var(--primary-200);
  --blade-toolbar-mobile-toggle-icon-color: var(--additional-50);
  --blade-toolbar-mobile-overlay-bg-color: var(--additional-950);
  --blade-toolbar-mobile-menu-shadow-base-color: var(--additional-950);
  --blade-toolbar-mobile-shadow-color: rgb(from var(--blade-toolbar-mobile-menu-shadow-base-color) r g b / 25%);
  --blade-toolbar-mobile-shadow-color-2: rgb(from var(--blade-toolbar-mobile-menu-shadow-base-color) r g b / 1%);
}

.vc-blade-toolbar-mobile {
  &__pill {
    @apply tw-fixed tw-bottom-28 tw-right-8 tw-flex tw-items-center tw-bg-[var(--blade-toolbar-mobile-pill-bg-color)] tw-rounded-full tw-shadow-lg tw-z-[60] tw-h-[48px];
    box-shadow:
      0px 4px 4px 0px var(--blade-toolbar-mobile-shadow-color),
      0px 2px 10px 0px var(--blade-toolbar-mobile-shadow-color-2);

    &--expanded {
      @apply tw-bg-transparent tw-shadow-none;
    }
  }

  &__toggle {
    @apply tw-flex tw-items-center tw-justify-center tw-h-full tw-px-3 tw-border-0 tw-bg-transparent tw-border-l tw-border-solid tw-border-[var(--blade-toolbar-mobile-toggle-border-color)];
    min-width: 40px;

    .vc-icon {
      @apply tw-text-[var(--blade-toolbar-mobile-toggle-icon-color)];
      font-size: 14px;
    }
  }

  &__overlay {
    @apply tw-fixed tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-bg-[var(--blade-toolbar-mobile-overlay-bg-color)] tw-z-[55] tw-opacity-90;
    transition: opacity 0.3s ease;
  }

  &__menu {
    @apply tw-fixed tw-bottom-[167px] tw-right-[33px] tw-z-[60] tw-flex tw-flex-col tw-gap-2 tw-items-end tw-px-2;
  }
}

.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.3s ease;
  transition-delay: 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
