<template>
  <Teleport
    to="body"
    :disabled="$isDesktop.value"
  >
    <template v-if="isExpanded">
      <div
        v-if="isExpanded"
        class="sidebar__overlay"
        @click.stop="$emit('close')"
      ></div>

      <div
        v-if="isExpanded"
        :class="[
          'sidebar__dropdown',
          {
            'sidebar__dropdown--mobile': $isMobile.value && render === 'mobile',
            'sidebar__dropdown--desktop': $isDesktop.value && render === 'desktop',
            'sidebar__dropdown--always': render === 'always',
            'sidebar__dropdown--left': position === 'left',
            'sidebar__dropdown--right': position === 'right',
            'sidebar__dropdown--title': title,
          },
        ]"
      >
        <slot
          name="header"
          :header="header"
        >
          <component :is="header" />
        </slot>
        <div class="sidebar__content">
          <slot name="content"></slot>
        </div>
      </div>
    </template>

    <!-- Pass through content if not expanded -->
    <template v-else>
      <slot name="content"></slot>
    </template>
  </Teleport>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { h } from "vue";
import { VcIcon, CrossSignIcon } from "../../../ui/components";

export interface Props {
  position?: "left" | "right";
  render: "always" | "mobile" | "desktop";
  isExpanded: boolean;
  title?: string;
  closeCross?: boolean;
}

export interface Emits {
  (event: "close"): void;
}

defineSlots<{
  header: (props: any) => any;
  content: (props: any) => any;
}>();

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  position: "right",
  render: "always",
  closeCross: true,
});

defineOptions({
  inheritAttrs: false,
});

const header = h("div", { class: "sidebar__header" }, [
  props.title ? h("h3", { class: "sidebar__title" }, props.title) : null,
  props.closeCross
    ? h(VcIcon, { icon: CrossSignIcon, size: "xs", onClick: () => emit("close"), class: "sidebar__close-icon" })
    : null,
]);
</script>

<style lang="scss">
:root {
  --sidebar-bg-color: var(--neutrals-100);
  --sidebar-header-height: 82px;
  --sidebar-dropdown-mobile-icon-color: var(--primary-500);
  --sidebar-title-color: var(--additional-950);
  --sidebar-header-padding: 18px;
  --sidebar-dropdown-icon-color: var(--neutrals-500);
  --sidebar-overlay-color: var(--additional-950);
}

.sidebar {
  @apply tw-relative;

  &__overlay {
    @apply tw-fixed tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-z-[10000] tw-backdrop-blur-[3px] tw-bg-black/50;
  }

  &__header {
    @apply tw-text-[color:var(--sidebar-dropdown-mobile-icon-color)] tw-flex tw-justify-end tw-items-center tw-h-[var(--sidebar-header-height)] tw-cursor-pointer tw-p-[var(--sidebar-header-padding)];
  }

  &__title {
    @apply tw-text-[color:var(--sidebar-title-color)] tw-text-xl tw-font-bold;
  }

  &__dropdown {
    @apply tw-bg-[color:var(--sidebar-bg-color)] tw-absolute tw-top-[var(--app-bar-button-height)] tw-z-[10000] tw-flex tw-flex-col;

    &--mobile,
    &--always,
    &--desktop {
      @apply tw-hidden tw-fixed tw-top-0 tw-max-h-full tw-max-w-[300px] tw-w-full tw-bottom-0 tw-z-[10000] tw-border-0;
      display: flex !important;
    }

    &--left {
      @apply tw-left-0 tw-right-auto;
    }

    &--right {
      @apply tw-right-0 tw-left-auto;
    }

    &--title {
      .sidebar__header {
        @apply tw-justify-between #{!important};
      }
    }
  }

  &__close-icon {
    @apply tw-text-[color:var(--sidebar-dropdown-icon-color)] tw-cursor-pointer;
  }

  &__content {
    @apply tw-flex tw-flex-col tw-h-full tw-bg-[color:var(--sidebar-bg-color)] tw-flex-1 tw-relative;
  }
}
</style>
