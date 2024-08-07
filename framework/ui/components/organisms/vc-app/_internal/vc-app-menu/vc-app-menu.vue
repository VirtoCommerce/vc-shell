<template>
  <div
    v-if="isMenuVisible"
    class="vc-app-menu tw-relative tw-w-[var(--app-menu-width)] [transition:width_300ms_cubic-bezier(0.2,0,0,1)_0s] tw-pt-[22px] -tw-mr-[8px]"
    :class="{
      'vc-app-menu_mobile tw-hidden !tw-fixed !tw-left-0 !tw-top-0 !tw-w-full !tw-bottom-0 !tw-z-[9999]':
        $isMobile.value,
      '!tw-block': isMobileVisible,
      '!tw-w-[var(--app-menu-width-collapse)]': $isDesktop.value && !isExpanded,
    }"
    @mouseenter="!isExpanded && expandOverHandler(true)"
    @mouseover="!isExpanded && expandOverHandler(true)"
    @mouseleave="expandOverHandler(false)"
  >
    <!-- Show backdrop overlay on mobile devices -->
    <div
      v-if="$isMobile.value"
      class="tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-z-[9998] tw-bg-[#808c99] tw-opacity-60"
      @click="isMobileVisible = false"
    ></div>
    <div
      class="!tw-absolute vc-app-menu__inner tw-flex tw-flex-col tw-h-full [transition:width_150ms_cubic-bezier(0.2,0,0,1)_0s] tw-z-[1001] tw-top-0 tw-bottom-0 tw-bg-[color:var(--app-background)]"
      :class="{
        'tw-left-0 tw-pt-[22px]': $isDesktop.value,
        '!tw-w-[var(--app-menu-width-collapse)]': $isDesktop.value && !isExpanded && !isExpandedOver,
        'tw-w-[var(--app-menu-width)]': $isDesktop.value && (isExpanded || isExpandedOver),
      }"
    >
      <!-- Show menu close handler on mobile devices -->
      <div
        v-if="$isMobile.value"
        class="tw-text-[#319ed4] tw-flex tw-justify-end tw-items-center tw-p-4 tw-cursor-pointer"
      >
        <button @click="isMobileVisible = false">
          <VcIcon
            icon="fas fa-times"
            size="xl"
          ></VcIcon>
        </button>
      </div>

      <div
        v-if="$isDesktop.value"
        class="tw-pl-[19px] tw-pb-2"
      >
        <button
          class="tw-flex tw-items-center tw-p-[10px] tw-rounded tw-text-[color:var(--app-menu-burger-color)] hover:tw-bg-[color:var(--app-menu-burger-background-color)]"
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
        class="tw-grow tw-basis-0"
      >
        <div class="tw-gap-[5px] tw-flex tw-flex-col tw-h-full">
          <div
            v-if="$slots['mobile']"
            class="tw-px-[19px]"
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
              $hasAccess(item.permissions!) && (item.children?.some((child) => $hasAccess(child.permissions!)) ?? true)
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
        class="tw-text-[color:var(--app-menu-version-color)] tw-text-xs tw-mt-auto tw-self-start tw-py-1 tw-pl-[22px]"
        @click="$emit('version:click')"
      >
        {{ version }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import { VcContainer, VcIcon } from "./../../../../";
import { useMenuService } from "../../../../../../core/composables";
import { MenuItem } from "../../../../../../core/types";
import { useLocalStorage } from "@vueuse/core";

export interface Props {
  version: string;
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
  --app-menu-background-color: #ffffff;
  --app-menu-version-color: #838d9a;

  --app-menu-burger-background-color: rgba(255, 255, 255, 0.5);
  --app-menu-burger-color: #319ed4;
}

.vc-app-menu {
  ::-webkit-scrollbar {
    display: none;
  }
  &_mobile &__inner {
    @apply tw-absolute tw-z-[9999] tw-right-0 tw-top-0 tw-bottom-0 tw-w-[300px] tw-max-w-[60%] tw-bg-[color:var(--app-menu-background-color)];
  }
}
</style>
