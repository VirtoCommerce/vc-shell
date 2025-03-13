\
<template>
  <div
    v-if="isMenuVisible"
    class="vc-app-menu"
    :class="{
      'vc-app-menu--mobile': $isMobile.value,
      'vc-app-menu--collapsed': $isDesktop.value && !isExpanded,
      'vc-app-menu--hover-expanded': isHoverExpanded,
    }"
  >
    <div
      class="vc-app-menu__inner"
      :class="{
        'vc-app-menu__inner--desktop': $isDesktop.value,
        'vc-app-menu__inner--collapsed': $isDesktop.value && !isExpanded,
        'vc-app-menu__inner--hover-expanded': isHoverExpanded,
      }"
    >
      <!-- Show scrollable area with menu items -->
      <VcContainer
        :no-padding="true"
        class="vc-app-menu__container"
      >
        <div class="vc-app-menu__menu-items">
          <VcAppMenuItem
            v-for="item in menuItems"
            :id="item.id"
            :key="item?.id"
            :data-test-id="item?.routeId"
            :is-visible="
              $hasAccess(item.permissions!) && (item.children?.some((child) => $hasAccess(child.permissions!)) ?? true)
            "
            :url="item.url"
            :icon="item.groupIcon || item.icon"
            :title="item.title as string"
            :children="item.children"
            :expand="$isDesktop.value ? isExpanded || isHoverExpanded : true"
            @click="handleMenuItemClick(item, $event)"
          />
        </div>
      </VcContainer>

      <!-- <div
            v-if="version"
            class="vc-app-menu__version"
            @click="$emit('version:click')"
          >
            {{ version }}
          </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, Ref, inject } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import { VcContainer } from "./../../../../";
import { useMenuService } from "../../../../../../core/composables";
import { MenuItem } from "../../../../../../core/types";
import { useMenuExpanded } from "../../../../../../shared/composables/useMenuExpanded";
import { useAppMenuState } from "../composables/useAppMenuState";

export interface Props {
  version: string | undefined;
}

export interface Emits {
  (event: "item:click", item: MenuItem): void;
  (event: "version:click"): void;
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  mobileMenuItems: () => [],
  version: "",
});

const emit = defineEmits<Emits>();

const isMobile = inject("isMobile") as Ref<boolean>;
const { menuItems } = useMenuService();
const { isExpanded, isHoverExpanded } = useMenuExpanded();
const { closeAll } = useAppMenuState();

const handleMenuItemClick = (item: MenuItem, nestedItem?: MenuItem) => {
  if (isMobile.value) {
    closeAll();
  }
  emit("item:click", nestedItem ? nestedItem : item);
};

const isMenuVisible = computed(() => {
  return !!menuItems.value.length;
});
</script>

<style lang="scss">
:root {
  --app-menu-background: var(--app-background, var(--primary-50));
  --app-menu-background-color: var(--app-bar-background, var(--neutrals-50));
  --app-menu-version-color: var(--neutrals-400);

  --app-menu-close-color: var(--app-menu-burger-color, var(--primary-500));
  --app-menu-burger-color: var(--primary-500);

  --app-backdrop-overlay-bg: var(--additional-50);
  --app-backdrop-overlay: rgb(from var(--app-backdrop-overlay-bg) r g b / 75%);

  --app-backdrop-shadow-color: var(--additional-950);
  --app-backdrop-shadow:
    0 -6px 6px var(--additional-50), 1px 1px 22px rgb(from var(--notification-dropdown-shadow-color) r g b / 7%);
}

.vc-app-menu {
  @apply tw-h-full;

  &.vc-app-menu--mobile {
    @apply tw-h-full tw-w-full #{!important};
  }

  &.vc-app-menu--block {
    @apply tw-block #{!important};
  }

  &.vc-app-menu--collapsed {
    width: var(--app-menu-width-collapse) !important;
  }

  &.vc-app-menu--expanded {
    @apply tw-w-[var(--app-menu-width)];
  }

  &__backdrop {
    @apply tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-z-[9998] tw-bg-[color:var(--app-backdrop-overlay)] tw-backdrop-blur-[3px];
  }

  &__inner {
    @apply tw-flex tw-flex-col tw-h-full;

    &--desktop {
      @apply tw-left-0;
    }

    &--collapsed {
      // @apply tw-pt-3;
    }

    &--expanded {
      @apply tw-w-[var(--app-menu-width)];
    }
  }

  &__close-handler {
    @apply tw-text-[color:var(--app-menu-close-color)] tw-flex tw-justify-end tw-items-center tw-p-4 tw-cursor-pointer;
  }

  &__close-button {
  }

  &__burger-container {
    @apply tw-pl-5 tw-pb-2;
  }

  &__burger-button {
    @apply tw-flex tw-items-center tw-p-2.5 tw-rounded tw-text-[color:var(--app-menu-burger-color)];
  }

  &__container {
    @apply tw-grow tw-basis-0;
  }

  &__menu-items {
    @apply tw-gap-1 tw-flex tw-flex-col tw-h-full;
  }

  &__mobile-slot {
    @apply tw-px-5;
  }

  &__version {
    @apply tw-text-[color:var(--app-menu-version-color)] tw-text-xs tw-mt-auto tw-self-start tw-py-1 tw-pl-5;
  }

  &--mobile .vc-app-menu__inner {
    @apply tw-bg-[color:var(--app-menu-background-color)] tw-w-full;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  & .vc-app-menu__blade-title {
    @apply tw-overflow-ellipsis tw-overflow-hidden tw-whitespace-nowrap tw-text-2xl tw-font-semibold tw-ml-2 tw-leading-snug;
  }

  &__backlink {
    @apply tw-ml-3;
  }

  &__backlink-text {
    @apply tw-ml-2 tw-text-lg;
  }

  &__spacer {
    @apply tw-grow tw-basis-0;
  }

  &__toolbar {
    @apply tw-flex tw-h-full tw-box-border;
  }

  &__menu-toggler {
    @apply tw-text-[color:var(--app-bar-burger-color)] tw-w-12 tw-flex tw-items-center tw-justify-center tw-h-full tw-box-border tw-cursor-pointer;
  }

  &--collapsed {
    // @apply tw-w-[50px];

    .vc-app-menu__inner {
      // @apply tw-w-[50px];
    }
  }

  &--collapsed {
    @apply tw-w-[50px];

    .vc-app-menu__collapse-button {
      svg {
        @apply tw-rotate-180;
      }
    }
  }
}
</style>
