<template>
  <div
    class="vc-app-menu-item"
    @click="$emit('click')"
  >
    <VcTooltip>
      <template
        v-if="!expanded"
        #tooltip
      >
        {{ $t(title ?? "") }}
      </template>

      <div
        class="vc-app-menu-item__content"
        :class="{
          'vc-app-menu-item__content--active': isActive,
          'vc-app-menu-item__content--nested': nested,
          'vc-app-menu-item__content--collapsed': !expanded,
        }"
      >
        <!-- Icon -->
        <div
          v-if="icon"
          class="vc-app-menu-item__icon"
        >
          <VcIcon
            class="vc-app-menu-item__icon-content"
            :icon="icon"
            size="m"
          />
        </div>

        <!-- Letter abbreviation when collapsed and no icon -->
        <div
          v-else-if="!expanded"
          class="vc-app-menu-item__letters"
        >
          {{ abbreviation }}
        </div>

        <!-- Title + badge (shown when expanded) -->
        <Transition name="opacity">
          <div
            v-show="expanded"
            class="vc-app-menu-item__title"
          >
            <span class="vc-app-menu-item__title-text">{{ $t(title ?? "") }}</span>
            <VcBadge
              v-if="resolvedBadge.isVisible"
              :content="resolvedBadge.isDot ? undefined : resolvedBadge.content"
              :variant="resolvedBadge.variant"
              :is-dot="resolvedBadge.isDot"
              size="s"
              inline
              class="vc-app-menu-item__badge"
            />
            <slot name="suffix" />
          </div>
        </Transition>
      </div>
    </VcTooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Component } from "vue";
import { VcIcon, VcBadge } from "../../../../";
import { useBadge } from "./composables/useBadge";
import type { MenuItemBadgeConfig } from "../../../../../../core/types";

export interface Props {
  icon?: string | Component;
  title?: string;
  expanded?: boolean;
  badge?: MenuItemBadgeConfig;
  routeId?: string;
  groupId?: string;
  isActive?: boolean;
  nested?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  nested: false,
  isActive: false,
});

defineEmits<{
  (event: "click"): void;
}>();

defineSlots<{
  suffix: () => unknown;
}>();

const resolvedBadge = useBadge(() => props.badge, () => props.routeId, () => props.groupId);

const abbreviation = computed(() => {
  return props.title
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
});
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 38px;
  --app-menu-item-icon-width: 16px;
  --app-menu-item-icon-width-container: 23px;
  --app-menu-item-icon-color: var(--neutrals-600);
  --app-menu-item-icon-color-active: var(--primary-700);
  --app-menu-item-background-color-hover: var(--neutrals-100);
  --app-menu-item-background-color-active: var(--primary-100);
  --app-menu-item-hover-radius: 6px;
  --app-menu-item-title-color: var(--neutrals-600);
  --app-menu-item-title-color-active: var(--primary-700);

  --app-menu-item-active-text: var(--neutrals-950);
  --app-menu-item-active-icon: var(--neutrals-950);
}

.vc-app-menu-item {
  @apply tw-cursor-pointer tw-w-full;
  @apply tw-transition-transform tw-duration-[0] tw-ease-in-out #{!important};

  &:hover .vc-app-menu-item__content:not(.vc-app-menu-item__content--active) {
    @apply tw-bg-[var(--app-menu-item-background-color-hover)] tw-bg-opacity-50 tw-rounded;

    .vc-app-menu-item__title {
      @apply tw-text-[color:var(--app-menu-item-title-color-active)];
    }

    .vc-app-menu-item__icon {
      @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
    }
  }

  &__content {
    @apply tw-flex tw-items-center tw-w-full tw-h-[var(--app-menu-item-height)]
      tw-border-none tw-flex-nowrap tw-box-border tw-cursor-pointer tw-relative
      tw-uppercase tw-select-none tw-px-2 tw-gap-4;

    &--active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-active)] tw-rounded;

      .vc-app-menu-item__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }

      .vc-app-menu-item__title {
        @apply tw-text-[color:var(--app-menu-item-title-color-active)] #{!important};
      }
    }

    &--nested {
      @apply tw-pl-7 tw-gap-5;

      &.vc-app-menu-item__content--collapsed {
        @apply tw-pl-2;
      }

      &.vc-app-menu-item__content--active {
        @apply tw-font-medium;
      }
    }
  }

  &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color)]
      tw-overflow-hidden tw-flex tw-justify-center tw-shrink-0
      tw-transition-[color] tw-duration-200
      tw-w-[var(--app-menu-item-icon-width-container)];
  }

  &__icon-content {
    @apply tw-text-center;
  }

  &__letters {
    @apply tw-shrink-0 tw-w-[24px] tw-h-[24px] tw-rounded-full
      tw-flex tw-items-center tw-justify-center
      tw-text-xxs tw-leading-[10px] tw-font-extrabold
      tw-text-[var(--neutrals-500)] tw-border-[2px] tw-border-[var(--neutrals-500)];
  }

  &__title {
    @apply tw-text-[color:var(--app-menu-item-title-color)] tw-truncate
      tw-text-sm tw-font-normal tw-leading-normal tw-normal-case
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

.opacity-enter-active,
.opacity-leave-active {
  transition: opacity 0.3s ease;
}

.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}
</style>
