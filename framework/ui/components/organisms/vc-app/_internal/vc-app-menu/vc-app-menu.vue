<template>
  <Sidebar
    :is-expanded="$isMobile.value ? isMobileVisible : false"
    render="mobile"
    @close="() => (isMobileVisible = false)"
  >
    <template #content>
      <div
        v-if="isMenuVisible"
        class="vc-app-menu"
        :class="{
          'vc-app-menu--mobile': $isMobile.value,
          'vc-app-menu--block': isMobileVisible,
          'vc-app-menu--collapsed': $isDesktop.value && !isExpanded,
        }"
        @mouseenter="!isExpanded && expandOverHandler(true)"
        @mouseover="!isExpanded && expandOverHandler(true)"
        @mouseleave="expandOverHandler(false)"
      >
        <div
          class="vc-app-menu__inner"
          :class="{
            'vc-app-menu__inner--desktop': $isDesktop.value,
            'vc-app-menu__inner--collapsed': $isDesktop.value && !isExpanded && !isExpandedOver,
            'vc-app-menu__inner--expanded': $isDesktop.value && (isExpanded || isExpandedOver),
          }"
        >
          <div
            v-if="$isDesktop.value"
            class="vc-app-menu__burger-container"
          >
            <button
              class="vc-app-menu__burger-button"
              @click="toggleMenu"
            >
              <VcIcon
                icon="fas fa-bars"
                size="xl"
              ></VcIcon>
            </button>
          </div>

          <!-- Show scrollable area with menu items -->
          <VcContainer
            :no-padding="true"
            class="vc-app-menu__container"
          >
            <div class="vc-app-menu__menu-items">
              <div
                v-if="$slots['mobile']"
                class="vc-app-menu__mobile-slot"
              >
                <slot
                  v-if="!$isDesktop.value"
                  name="mobile"
                ></slot>
              </div>

              <VcAppMenuItem
                v-for="item in menuItems"
                :id="item.id"
                :key="item?.id"
                :data-test-id="item?.routeId"
                :is-visible="
                  $hasAccess(item.permissions!) &&
                  (item.children?.some((child) => $hasAccess(child.permissions!)) ?? true)
                "
                :url="item.url"
                :icon="item.groupIcon || item.icon"
                :title="item.title as string"
                :children="item.children"
                :expand="$isDesktop.value ? isExpanded || isExpandedOver : true"
                @click="
                  (event) => {
                    $emit('item:click', event ? event : item);
                    isMobileVisible = false;
                  }
                "
              />
            </div>
          </VcContainer>

          <div
            v-if="version"
            class="vc-app-menu__version"
            @click="$emit('version:click')"
          >
            {{ version }}
          </div>
        </div>
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import { VcContainer, VcIcon } from "./../../../../";
import { useMenuService } from "../../../../../../core/composables";
import { MenuItem } from "../../../../../../core/types";
import { useLocalStorage } from "@vueuse/core";
import { Sidebar } from "../../../../../../shared/components";

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

defineEmits<Emits>();
const { menuItems } = useMenuService();
const isExpanded = useLocalStorage("VC_APP_MENU_EXPANDED", true);
const isExpandedOver = ref(false);

const isMobileVisible = ref(false);

const isMenuVisible = computed(() => {
  return !!menuItems.value.length;
});

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

let expandTimeout: ReturnType<typeof setTimeout> | null = null;

function expandOverHandler(state: boolean) {
  if (expandTimeout) {
    clearTimeout(expandTimeout);
  }

  if (state) {
    expandTimeout = setTimeout(() => {
      if (isExpandedOver.value !== state) {
        isExpandedOver.value = state;
      }
    }, 50);
  } else {
    isExpandedOver.value = state;
  }
}

defineExpose({
  isMobileVisible,
});
</script>

<style lang="scss">
:root {
  --app-menu-width: 230px;
  --app-menu-width-collapse: 70px;
  --app-menu-background: var(--app-background, var(--primary-50));
  --app-menu-background-color: var(--additional-50);
  --app-menu-version-color: var(--neutrals-400);

  --app-menu-close-color: var(--app-menu-burger-color, var(--primary-500));
  --app-menu-burger-color: var(--primary-500);

  --app-backdrop-overlay-bg: var(--additional-50);
  --app-backdrop-overlay: rgb(from var(--app-backdrop-overlay-bg) r g b / 75%);

  --app-backdrop-shadow-color: var(--additional-950);
  --app-backdrop-shadow: 0 -6px 6px var(--additional-50),
    1px 1px 22px rgb(from var(--notification-dropdown-shadow-color) r g b / 7%);
}

.vc-app-menu {
  @apply tw-relative tw-w-[var(--app-menu-width)] tw-pt-6 -tw-mr-2 [transition:width_300ms_cubic-bezier(0.2,0,0,1)_0s] tw-z-[1001];

  &.vc-app-menu--mobile {
    @apply tw-hidden tw-h-full tw-w-full #{!important};
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
    @apply tw-flex tw-flex-col tw-h-full tw-z-[1001] tw-top-0 tw-bottom-0 tw-bg-[color:var(--app-menu-background)] [transition:width_150ms_cubic-bezier(0.2,0,0,1)_0s];
    @apply tw-absolute #{!important};

    &--desktop {
      @apply tw-left-0 tw-pt-6;
    }

    &--collapsed {
      @apply tw-w-[var(--app-menu-width-collapse)] #{!important};
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
}
</style>
