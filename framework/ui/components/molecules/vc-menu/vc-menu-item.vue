<template>
  <div
    class="vc-menu-item"
    @click="$emit('click')"
  >
    <VcTooltip>
      <template
        v-if="!menuExpanded"
        #tooltip
      >
        {{ title }}
      </template>

      <div
        class="vc-menu-item__content"
        :class="{
          'vc-menu-item__content--active': active,
          'vc-menu-item__content--nested': nested,
          'vc-menu-item__content--collapsed': !menuExpanded,
        }"
      >
        <!-- Icon -->
        <div
          v-if="icon"
          class="vc-menu-item__icon"
        >
          <VcIcon
            class="vc-menu-item__icon-content"
            :icon="icon"
            size="m"
          />
        </div>

        <!-- Letter abbreviation when collapsed and no icon -->
        <div
          v-else-if="!menuExpanded"
          class="vc-menu-item__letters"
        >
          {{ abbreviation }}
        </div>

        <!-- Title + badge (shown when expanded) -->
        <Transition name="vc-menu-opacity">
          <div
            v-show="menuExpanded"
            class="vc-menu-item__title"
          >
            <span class="vc-menu-item__title-text">{{ title }}</span>
            <VcBadge
              v-if="badge && badgeVisible"
              :content="badge.isDot ? undefined : badge.content"
              :variant="badge.variant ?? 'primary'"
              :is-dot="badge.isDot"
              size="s"
              inline
              class="vc-menu-item__badge"
            />
            <slot name="suffix" />
          </div>
        </Transition>
      </div>
    </VcTooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import type { Component } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcBadge } from "@ui/components/atoms/vc-badge";
import { VcMenuExpandedKey } from "@ui/components/molecules/vc-menu/constants";

interface VcMenuItemBadge {
  content?: string | number;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  isDot?: boolean;
}

interface VcMenuItemProps {
  icon?: string | Component;
  title?: string;
  active?: boolean;
  nested?: boolean;
  badge?: VcMenuItemBadge;
  expanded?: boolean | null;
}

const props = withDefaults(defineProps<VcMenuItemProps>(), {
  active: false,
  nested: false,
  expanded: null,
});

defineEmits<{
  (event: "click"): void;
}>();

defineSlots<{
  suffix: () => unknown;
}>();

defineOptions({
  name: "VcMenuItem",
});

const injectedExpanded = inject(VcMenuExpandedKey, undefined);

const menuExpanded = computed(() => {
  if (props.expanded != null) return props.expanded;
  return injectedExpanded?.value ?? true;
});

const abbreviation = computed(() => {
  return props.title
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
});

const badgeVisible = computed(() => {
  if (!props.badge) return false;
  if (props.badge.isDot) return true;
  const c = props.badge.content;
  return c != null && c !== "" && c !== 0;
});
</script>

<style lang="scss">
:root {
  --vc-menu-item-height: 28px;
  --vc-menu-item-padding-x: 6px;
  --vc-menu-item-border-radius: 4px;
  --vc-menu-item-icon-size: 18px;
  --vc-menu-item-icon-gap: 6px;
  --vc-menu-item-text-color: var(--neutrals-700);
  --vc-menu-item-icon-color: var(--neutrals-600);
  --vc-menu-item-icon-color-active: var(--primary-700);
  --vc-menu-item-hover-bg: var(--neutrals-100);
  --vc-menu-item-active-bg: var(--secondary-100);
  --vc-menu-item-active-text-color: var(--neutrals-700);
  --vc-menu-item-active-icon-color: var(--primary-700);

  // Nested sub-items (L3)
  --vc-menu-subitem-height: 24px;
  --vc-menu-subitem-icon-size: 16px;
  --vc-menu-subitem-padding-left: 12px;
}

.vc-menu-item {
  @apply tw-cursor-pointer tw-w-full;

  &:hover .vc-menu-item__content:not(.vc-menu-item__content--active) {
    background: var(--vc-menu-item-hover-bg);
    opacity: 0.5;
    border-radius: var(--vc-menu-item-border-radius);

    .vc-menu-item__title {
      @apply tw-text-[color:var(--vc-menu-item-active-text-color)];
    }

    .vc-menu-item__icon {
      @apply tw-text-[color:var(--vc-menu-item-icon-color-active)];
    }
  }

  &__content {
    @apply tw-flex tw-items-center tw-w-full tw-border-none tw-flex-nowrap
      tw-box-border tw-cursor-pointer tw-relative tw-select-none;
    height: var(--vc-menu-item-height);
    padding: 0 var(--vc-menu-item-padding-x);
    gap: var(--vc-menu-item-icon-gap);
    border-radius: var(--vc-menu-item-border-radius);

    &--active {
      background: var(--vc-menu-item-active-bg);

      .vc-menu-item__icon {
        @apply tw-text-[color:var(--vc-menu-item-active-icon-color)];
      }

      .vc-menu-item__title {
        @apply tw-text-[color:var(--vc-menu-item-active-text-color)] #{!important};
      }
    }

    &--nested {
      height: var(--vc-menu-subitem-height);
      padding-left: var(--vc-menu-subitem-padding-left);

      .vc-menu-item__icon {
        width: var(--vc-menu-subitem-icon-size);
      }

      &.vc-menu-item__content--collapsed {
        @apply tw-pl-2;
      }

      &.vc-menu-item__content--active {
        @apply tw-font-medium;
      }
    }
  }

  &__icon {
    @apply tw-text-[color:var(--vc-menu-item-icon-color)]
      tw-overflow-hidden tw-flex tw-justify-center tw-shrink-0
      tw-transition-[color] tw-duration-200;
    width: var(--vc-menu-item-icon-size);
  }

  &__icon-content {
    @apply tw-text-center;
  }

  &__letters {
    @apply tw-shrink-0 tw-w-[24px] tw-h-[24px] tw-rounded-full
      tw-flex tw-items-center tw-justify-center
      tw-text-xxs tw-leading-[10px] tw-font-extrabold
      tw-text-neutrals-500 tw-border-[2px] tw-border-neutrals-500;
  }

  &__title {
    @apply tw-text-[color:var(--vc-menu-item-text-color)] tw-truncate
      tw-text-sm tw-font-normal tw-leading-[16px] tw-normal-case
      [transition:color_0.2s_ease]
      tw-opacity-100 tw-w-full tw-flex tw-justify-between tw-items-center;
  }

  &__title-text {
    @apply tw-truncate;
  }

  &__badge {
    @apply tw-shrink-0 tw-ml-auto;
  }
}

.vc-menu-opacity-enter-active,
.vc-menu-opacity-leave-active {
  transition: opacity 0.3s ease;
}

.vc-menu-opacity-enter-from,
.vc-menu-opacity-leave-to {
  opacity: 0;
}
</style>
