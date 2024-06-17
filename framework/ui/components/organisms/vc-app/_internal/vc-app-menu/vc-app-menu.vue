<template>
  <div
    v-if="isMenuVisible"
    class="tw-relative tw-w-[var(--app-menu-width)] [transition:width_300ms_cubic-bezier(0.2,0,0,1)_0s] tw-pt-[22px]"
    :class="{
      'vc-app-menu_mobile tw-hidden !tw-fixed !tw-left-0 !tw-top-0 !tw-w-full !tw-bottom-0 !tw-z-[9999]':
        $isMobile.value,
      '!tw-block': isMobileVisible,
      '!tw-w-[63px]': $isDesktop.value && !isExpanded,
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
      class="!tw-absolute vc-app-menu__inner tw-flex tw-flex-col tw-h-full [transition:width_300ms_cubic-bezier(0.2,0,0,1)_0s] tw-z-[9999] tw-top-0 tw-bottom-0 tw-bg-[color:var(--app-background)] tw-shadow-[inset_0px_2px_5px_0px_#3654751A]"
      :class="{
        'tw-left-0 tw-pt-[22px]': $isDesktop.value,
        '!tw-w-[63px] !tw-shadow-[inset_4px_2px_5px_0px_#3654751A]': $isDesktop.value && !isExpanded && !isExpandedOver,
        'tw-w-[var(--app-menu-width)]': $isDesktop.value && (isExpanded || isExpandedOver),
        'tw-shadow-none': $isDesktop.value && isExpanded,
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
        class="tw-pl-[21px] tw-pb-2"
      >
        <button
          class="tw-p-[10px] tw-h-[var(--app-menu-item-height)] tw-rounded tw-text-[color:var(--app-menu-burger-color)] hover:tw-bg-[color:var(--app-menu-burger-background-color)]"
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
        <div
          class="tw-gap-[5px] tw-flex tw-flex-col tw-h-full"
          :class="{
            'tw-px-[21px]': ($isDesktop.value && (isExpanded || isExpandedOver)) || $isMobile.value,
            'tw-pl-[21px] tw-pr-[2px]': $isDesktop.value && !isExpanded && !isExpandedOver,
          }"
        >
          <slot
            v-if="!$isDesktop.value"
            name="mobile"
          ></slot>

          <VcAppMenuItem
            v-for="item in menuItems"
            :key="item?.id"
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

function expandOverHandler(state: boolean) {
  if (isExpandedOver.value !== state) {
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
  --app-menu-background-color: #ffffff;
  --app-menu-version-color: #838d9a;

  --app-menu-burger-background-color: rgba(255, 255, 255, 0.5);
  --app-menu-burger-color: #319ed4;
}

.vc-app-menu {
  &_mobile &__inner {
    @apply tw-absolute tw-z-[9999] tw-right-0 tw-top-0 tw-bottom-0 tw-w-[300px] tw-max-w-[60%] tw-bg-[color:var(--app-menu-background-color)];
  }
}
</style>
