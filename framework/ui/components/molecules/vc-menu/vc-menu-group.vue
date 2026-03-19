<template>
  <div
    class="vc-menu-group"
    :class="{
      'vc-menu-group--section': variant === 'section',
      'vc-menu-group--open': isOpen,
    }"
  >
    <!-- Section variant header -->
    <button
      v-if="variant === 'section'"
      class="vc-menu-group__section-header"
      :class="{ 'vc-menu-group__section-header--hidden': !menuExpanded }"
      @click="toggle"
    >
      <div
        v-if="icon"
        class="vc-menu-group__section-icon"
      >
        <VcIcon
          :icon="icon"
          size="m"
        />
      </div>
      <span class="vc-menu-group__section-title">{{ title }}</span>
      <VcIcon
        class="vc-menu-group__chevron"
        :class="{ 'vc-menu-group__chevron--open': isOpen }"
        icon="lucide-chevron-down"
        size="s"
      />
    </button>

    <!-- Default variant header (uses VcMenuItem) -->
    <VcMenuItem
      v-else
      :icon="icon"
      :title="title"
      :badge="badge"
      :active="active"
      @click="toggle"
    >
      <template #suffix>
        <VcIcon
          v-if="menuExpanded"
          class="vc-menu-group__chevron"
          :class="{ 'vc-menu-group__chevron--open': isOpen }"
          icon="lucide-chevron-down"
          size="xs"
        />
      </template>
    </VcMenuItem>

    <!-- Children with grid animation -->
    <div
      class="vc-menu-group__children-wrapper"
      :class="{
        'vc-menu-group__children-wrapper--open': isOpen,
        'vc-menu-group__children-wrapper--collapsed': !menuExpanded,
      }"
    >
      <div class="vc-menu-group__children">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import type { Component } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import VcMenuItem from "@ui/components/molecules/vc-menu/vc-menu-item.vue";
import { VcMenuExpandedKey } from "@ui/components/molecules/vc-menu/constants";
import type { VcMenuItemBadge } from "@ui/components/molecules/vc-menu/types";

interface VcMenuGroupProps {
  groupId: string;
  icon?: string | Component;
  title?: string;
  badge?: VcMenuItemBadge;
  active?: boolean;
  open?: boolean;
  variant?: "default" | "section";
}

const props = withDefaults(defineProps<VcMenuGroupProps>(), {
  active: false,
  variant: "default",
});

defineEmits<{
  (event: "update:open", value: boolean): void;
}>();

defineOptions({
  name: "VcMenuGroup",
});

defineSlots<{
  default: () => unknown;
}>();

const injectedExpanded = inject(VcMenuExpandedKey, undefined);

const menuExpanded = computed(() => {
  return injectedExpanded?.value ?? true;
});

const storageKey = (() => {
  if (typeof window === "undefined") {
    return `vc_menu_${props.groupId}_open`;
  }
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const appName = pathSegments[0] || "default";
  return `vc_menu_${appName}_${props.groupId}_open`;
})();

const isOpen = useLocalStorage(storageKey, props.open ?? false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

defineExpose({
  setOpen(value: boolean) {
    isOpen.value = value;
  },
});
</script>

<style lang="scss">
:root {
  // Default variant (L2 group)
  --vc-menu-group-active-bg: var(--secondary-100);
  --vc-menu-group-active-radius: 6px;
  --vc-menu-group-chevron-size: 14px;
  --vc-menu-group-animation-duration: 200ms;

  // Section variant (L1)
  --vc-menu-section-height: 30px;
  --vc-menu-section-padding-left: 12px;
  --vc-menu-section-text-color: var(--neutrals-400);
  --vc-menu-section-font-size: 14px;
  --vc-menu-section-chevron-size: 16px;
  --vc-menu-section-divider-color: var(--neutrals-100);

  // Track line for nested groups (L2 → L3)
  --vc-menu-track-offset: 7px;
}

.vc-menu-group {
  // Default (non-section) groups: flex column with 4px gap between header and children
  &:not(&--section) {
    @apply tw-flex tw-flex-col;
    gap: 4px;
  }

  // Chevron transition (shared by both variants)
  &__chevron {
    @apply tw-text-[color:var(--vc-menu-item-icon-color)] tw-ml-auto tw-shrink-0;
    transition: transform var(--vc-menu-group-animation-duration) ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  // Children grid animation
  &__children-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--vc-menu-group-animation-duration) ease;

    &--open {
      grid-template-rows: 1fr;
    }

    // When sidebar collapsed: always show children (no expand/collapse toggle)
    &--collapsed {
      grid-template-rows: 1fr;
    }
  }

  &__children {
    @apply tw-overflow-hidden tw-min-h-0 tw-flex tw-flex-col tw-gap-2;
  }

  // In collapsed mode, allow overflow for active indicators (::after at left: -4px)
  &__children-wrapper--collapsed > &__children {
    @apply tw-overflow-visible;
  }

  // Track line for non-section groups (L2 → L3 sub-items)
  &:not(&--section) > &__children-wrapper > &__children {
    @apply tw-relative;

    &::before {
      content: "";
      @apply tw-absolute tw-top-0 tw-bottom-0;
      left: 1px;
      width: 1px;
      background: var(--neutrals-200);
    }
  }

  // Active group header: border-radius left only + wider right padding (Figma spec)
  // Applies when group has explicit `active` prop
  > .vc-menu-item .vc-menu-item__content--active {
    border-radius: var(--vc-menu-group-active-radius) 0 0
      var(--vc-menu-group-active-radius);
    padding-right: 10px;
  }


  // ── Section variant (L1) ──────────────────────────────────
  &--section {
    // Container-level indent (separates "group padding" from "item padding")
    padding-left: var(--vc-menu-section-padding-left);

    // Section chevron inherits section text color, not item icon color
    .vc-menu-group__chevron {
      @apply tw-text-[color:var(--vc-menu-section-text-color)];
    }

    // Divider between sections (not first, only when expanded)
    & + &:not(:has(> .vc-menu-group__section-header--hidden)) {
      border-top: 1px solid var(--vc-menu-section-divider-color);
      @apply tw-pt-3 tw-mt-3;
    }
  }

  &__section-header {
    @apply tw-flex tw-items-center tw-w-full tw-cursor-pointer
      tw-border-none tw-bg-transparent tw-select-none tw-outline-none;
    height: var(--vc-menu-section-height);
    padding: 0 10px 0 var(--vc-menu-item-padding-x, 6px);
    gap: 8px;

    &--hidden {
      @apply tw-hidden;
    }
  }

  &__section-icon {
    @apply tw-text-[color:var(--vc-menu-section-text-color)] tw-shrink-0;
  }

  &__section-title {
    @apply tw-flex-1 tw-text-left tw-uppercase tw-font-normal tw-truncate;
    font-size: var(--vc-menu-section-font-size);
    line-height: 16px;
    color: var(--vc-menu-section-text-color);
  }
}
</style>
