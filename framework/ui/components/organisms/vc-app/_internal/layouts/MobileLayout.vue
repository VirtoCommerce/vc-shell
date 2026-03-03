<template>
  <!-- Top bar -->
  <div
    v-if="showHeader"
    class="mobile-layout"
  >
    <slot
      name="sidebar-header"
      :logo="logo"
      :expanded="false"
      :is-mobile="true"
    >
      <SidebarHeader
        :logo="logo"
        :expanded="false"
        :is-mobile="true"
        :mobile-title="viewTitle"
        :show-mobile-title="blades.length === 1"
        class="mobile-layout__header"
        @logo:click="sidebar.openMenu"
      >
        <template #actions>
          <AppBarMobileActions
            :is-sidebar-mode="sidebar.isMenuOpen.value"
            :expanded="false"
          />
        </template>
      </SidebarHeader>
    </slot>
  </div>

  <!-- Slide-out sidebar overlay (no v-if — VcSidebar manages visibility internally via Transition) -->
  <MenuSidebar
    :is-opened="sidebar.isMenuOpen.value"
    :expanded="true"
    @update:is-opened="!$event && sidebar.closeMenu()"
  >
    <template #navmenu>
      <div
        class="mobile-layout__navmenu"
        :class="{ 'mobile-layout__navmenu--tabs': showTabs }"
      >
        <template v-if="showTabs">
          <div
            class="mobile-layout__tabs"
            role="tablist"
          >
            <button
              type="button"
              class="mobile-layout__tab"
              :class="{ 'mobile-layout__tab--active': activeIndex === MENU_TAB_INDEX }"
              role="tab"
              :aria-selected="activeIndex === MENU_TAB_INDEX"
              aria-controls="mobile-layout-panel-menu"
              @click="setActiveIndex(MENU_TAB_INDEX)"
            >
              <span class="mobile-layout__tab-label">
                {{ $t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.MOBILE_LAYOUT.TAB_MENU") }}
              </span>
            </button>

            <button
              type="button"
              class="mobile-layout__tab"
              :class="{ 'mobile-layout__tab--active': activeIndex === HUB_TAB_INDEX }"
              role="tab"
              :aria-selected="activeIndex === HUB_TAB_INDEX"
              aria-controls="mobile-layout-panel-hub"
              @click="setActiveIndex(HUB_TAB_INDEX)"
            >
              <span class="mobile-layout__tab-label">
                {{ $t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.MOBILE_LAYOUT.TAB_HUB") }}
                <span
                  v-if="hasWidgetBadge"
                  class="mobile-layout__tab-badge"
                />
              </span>
            </button>

            <span
              class="mobile-layout__tab-indicator"
              :style="indicatorStyle"
            />
          </div>

          <div
            ref="sliderViewportRef"
            class="mobile-layout__slider-viewport"
            @touchstart.passive="onTouchStart"
            @touchmove="onTouchMove"
            @touchend.passive="onTouchEnd"
            @touchcancel.passive="onTouchEnd"
          >
            <div
              class="mobile-layout__slider"
              :style="sliderStyle"
            >
              <div
                id="mobile-layout-panel-menu"
                role="tabpanel"
                class="mobile-layout__panel mobile-layout__panel--menu"
              >
                <VcScrollableContainer class="mobile-layout__menu-scroll">
                  <slot
                    name="menu"
                    :expanded="true"
                    :on-item-click="handleMenuItemClick"
                  >
                    <VcAppMenu
                      :expanded="true"
                      @item:click="handleMenuItemClick"
                    />
                  </slot>
                </VcScrollableContainer>
              </div>

              <div
                id="mobile-layout-panel-hub"
                role="tabpanel"
                class="mobile-layout__panel mobile-layout__panel--hub"
              >
                <AppHubContent
                  :apps-list="props.appsList"
                  :show-applications="!props.disableAppSwitcher"
                  mobile
                  @switch-app="handleSwitchApp"
                >
                  <template
                    v-if="$slots['app-switcher'] && !props.disableAppSwitcher"
                    #applications="{ appsList: slotAppsList, switchApp: slotSwitchApp }"
                  >
                    <slot
                      name="app-switcher"
                      :apps-list="slotAppsList"
                      :switch-app="slotSwitchApp"
                    />
                  </template>
                </AppHubContent>
              </div>
            </div>
          </div>
        </template>

        <div
          v-else-if="props.disableMenu"
          class="mobile-layout__panel mobile-layout__panel--single mobile-layout__panel--hub"
        >
          <AppHubContent
            :apps-list="props.appsList"
            :show-applications="!props.disableAppSwitcher"
            mobile
            @switch-app="handleSwitchApp"
          >
            <template
              v-if="$slots['app-switcher'] && !props.disableAppSwitcher"
              #applications="{ appsList: slotAppsList, switchApp: slotSwitchApp }"
            >
              <slot
                name="app-switcher"
                :apps-list="slotAppsList"
                :switch-app="slotSwitchApp"
              />
            </template>
          </AppHubContent>
        </div>

        <div
          v-else
          class="mobile-layout__panel mobile-layout__panel--single mobile-layout__panel--menu"
        >
          <VcScrollableContainer class="mobile-layout__menu-scroll">
            <slot
              name="menu"
              :expanded="true"
              :on-item-click="handleMenuItemClick"
            >
              <VcAppMenu
                :expanded="true"
                @item:click="handleMenuItemClick"
              />
            </slot>
          </VcScrollableContainer>
        </div>
      </div>
    </template>
    <template #user-dropdown>
      <slot
        name="sidebar-footer"
        :avatar="avatar"
        :name="userName"
        :role="userRole"
      >
        <UserDropdownButton
          v-if="!isEmbedded"
          :avatar-url="avatar"
          :name="userName"
          :role="userRole"
        />
      </slot>
    </template>
  </MenuSidebar>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, inject, ref, watch } from "vue";
import type { AppDescriptor } from "@core/api/platform";
import type { MenuItem } from "@core/types";
import { EmbeddedModeKey } from "@framework/injection-keys";
import { useBladeNavigation, UserDropdownButton } from "@shared/components";
import { useSidebarState } from "@core/composables/useSidebarState";
import { useAppBarWidget } from "@core/composables";
import SidebarHeader from "@ui/components/organisms/vc-app/_internal/sidebar/SidebarHeader.vue";
import AppBarMobileActions from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppBarMobileActions.vue";
import MenuSidebar from "@ui/components/organisms/vc-app/_internal/app-bar/components/MenuSidebar.vue";
import AppHubContent from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppHubContent.vue";
import VcAppMenu from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue";
import { VcScrollableContainer } from "@ui/components";

export interface Props {
  logo?: string;
  title?: string;
  avatar?: string;
  userName?: string;
  userRole?: string;
  disableMenu?: boolean;
  disableAppSwitcher?: boolean;
  appsList?: AppDescriptor[];
}

const props = withDefaults(defineProps<Props>(), {
  disableMenu: false,
  disableAppSwitcher: false,
  appsList: () => [],
});

const emit = defineEmits<{
  (event: "item:click", item: MenuItem): void;
  (event: "switch-app", app: AppDescriptor): void;
}>();

defineSlots<{
  "app-switcher"?: (props: { appsList: AppDescriptor[]; switchApp: (app: AppDescriptor) => void }) => unknown;
  menu?: (props: { expanded: boolean; onItemClick: (item: MenuItem) => void }) => unknown;
  "sidebar-header"?: (props: { logo?: string; expanded: boolean; isMobile: boolean }) => unknown;
  "sidebar-footer"?: (props: { avatar?: string; name?: string; role?: string }) => unknown;
}>();

const sidebar = useSidebarState();
const isEmbedded = inject(EmbeddedModeKey, false);
const { blades, currentBladeNavigationData } = useBladeNavigation();
const { items: widgetItems } = useAppBarWidget();

const MENU_TAB_INDEX = 0;
const HUB_TAB_INDEX = 1;
const GESTURE_LOCK_THRESHOLD = 8;
const SWIPE_DISTANCE_RATIO = 0.3;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const MAX_DRAG_RATIO = 1;
const BOUNDARY_RESISTANCE_RATIO = 0.2;
const SLIDER_TRANSITION = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

const hasWidgetBadge = computed(() =>
  widgetItems.value.some((widget) => {
    if (widget.badge === undefined) return false;
    if (typeof widget.badge === "function") return widget.badge();
    return !!widget.badge;
  }),
);

const showHubTab = computed(
  () => widgetItems.value.length > 0 || (!props.disableAppSwitcher && props.appsList.length > 0),
);

const showTabs = computed(() => showHubTab.value && !props.disableMenu);

const activeIndex = ref(MENU_TAB_INDEX);
const isDragging = ref(false);
const dragOffsetX = ref(0);
const sliderViewportRef = ref<HTMLElement | null>(null);
const gestureState = ref<"idle" | "pending" | "horizontal" | "vertical">("idle");

let touchStartX = 0;
let touchStartY = 0;
let lastTouchX = 0;
let touchStartTime = 0;

const sliderStyle = computed(() => {
  const baseTranslate = activeIndex.value * -50;
  const viewportWidth = sliderViewportRef.value?.clientWidth ?? 0;

  if (isDragging.value && viewportWidth > 0) {
    const dragTranslate = (dragOffsetX.value / viewportWidth) * 50;
    return {
      transform: `translateX(${baseTranslate + dragTranslate}%)`,
      transition: "none",
    };
  }

  return {
    transform: `translateX(${baseTranslate}%)`,
    transition: SLIDER_TRANSITION,
  };
});

const indicatorStyle = computed(() => {
  const viewportWidth = sliderViewportRef.value?.clientWidth ?? 0;
  const dragProgress = isDragging.value && viewportWidth > 0 ? -dragOffsetX.value / viewportWidth : 0;
  const progress = Math.max(0, Math.min(1, activeIndex.value + dragProgress));

  return {
    transform: `translateX(${progress * 100}%)`,
    transition: isDragging.value ? "none" : SLIDER_TRANSITION,
  };
});

function setActiveIndex(nextIndex: number) {
  activeIndex.value = Math.max(MENU_TAB_INDEX, Math.min(HUB_TAB_INDEX, nextIndex));
  resetDragState();
}

function resetDragState() {
  dragOffsetX.value = 0;
  isDragging.value = false;
  gestureState.value = "idle";
}

function getRubberBandOffset(offset: number, dimension: number) {
  const absoluteOffset = Math.abs(offset);
  if (!absoluteOffset || !dimension) {
    return 0;
  }

  const resistedOffset = (absoluteOffset * dimension) / (absoluteOffset + dimension);
  return Math.sign(offset) * resistedOffset;
}

function getDragOffset(offset: number) {
  const viewportWidth = sliderViewportRef.value?.clientWidth ?? 0;
  if (!viewportWidth) {
    return offset;
  }

  const isLeadingBoundary = activeIndex.value === MENU_TAB_INDEX && offset > 0;
  const isTrailingBoundary = activeIndex.value === HUB_TAB_INDEX && offset < 0;

  if (isLeadingBoundary || isTrailingBoundary) {
    return getRubberBandOffset(offset, viewportWidth * BOUNDARY_RESISTANCE_RATIO);
  }

  const maxDragDistance = viewportWidth * MAX_DRAG_RATIO;
  return Math.max(-maxDragDistance, Math.min(maxDragDistance, offset));
}

function onTouchStart(event: TouchEvent) {
  if (!showTabs.value || event.touches.length === 0) {
    return;
  }

  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  lastTouchX = touch.clientX;
  touchStartTime = Date.now();
  dragOffsetX.value = 0;
  isDragging.value = false;
  gestureState.value = "pending";
}

function onTouchMove(event: TouchEvent) {
  if (!showTabs.value || event.touches.length === 0 || gestureState.value === "idle") {
    return;
  }

  const touch = event.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  if (gestureState.value === "pending") {
    if (absDeltaX < GESTURE_LOCK_THRESHOLD && absDeltaY < GESTURE_LOCK_THRESHOLD) {
      return;
    }

    if (absDeltaY > absDeltaX) {
      gestureState.value = "vertical";
      return;
    }

    gestureState.value = "horizontal";
    isDragging.value = true;
  }

  if (gestureState.value !== "horizontal") {
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  lastTouchX = touch.clientX;
  dragOffsetX.value = getDragOffset(deltaX);
}

function onTouchEnd(event: TouchEvent) {
  if (!showTabs.value) {
    resetDragState();
    return;
  }

  const touch = event.changedTouches[0];

  if (gestureState.value !== "horizontal") {
    resetDragState();
    return;
  }

  const endX = touch?.clientX ?? lastTouchX;
  const deltaX = endX - touchStartX;
  const duration = Math.max(Date.now() - touchStartTime, 1);
  const velocity = Math.abs(deltaX) / duration;
  const viewportWidth = sliderViewportRef.value?.clientWidth ?? 0;
  const distanceThreshold = viewportWidth * SWIPE_DISTANCE_RATIO;
  const shouldSwitch = velocity > SWIPE_VELOCITY_THRESHOLD || Math.abs(deltaX) > distanceThreshold;

  if (shouldSwitch) {
    if (deltaX < 0) {
      setActiveIndex(activeIndex.value + 1);
      return;
    }

    if (deltaX > 0) {
      setActiveIndex(activeIndex.value - 1);
      return;
    }
  }

  resetDragState();
}

watch(
  () => sidebar.isMenuOpen.value,
  (isOpen) => {
    if (!isOpen) {
      setActiveIndex(MENU_TAB_INDEX);
    }
  },
);

watch(showHubTab, (isVisible) => {
  if (!isVisible) {
    setActiveIndex(MENU_TAB_INDEX);
  }
});

watch(showTabs, (isVisible) => {
  if (!isVisible) {
    setActiveIndex(MENU_TAB_INDEX);
  }
});

const showHeader = computed(() => blades.value.length <= 1);

const viewTitle = computed(() => {
  const currentTitle = currentBladeNavigationData.value?.instance?.title;
  const lastBladeTitle = blades.value[blades.value.length - 1]?.props?.navigation?.instance?.title;
  return currentTitle ?? lastBladeTitle ?? "";
});

watch(showHeader, (nextValue) => {
  if (!nextValue && sidebar.isMenuOpen.value) {
    sidebar.closeMenu();
  }
});

const handleMenuItemClick = (item: MenuItem) => {
  sidebar.closeMenu();
  emit("item:click", item);
};

const handleSwitchApp = (app: AppDescriptor) => {
  sidebar.closeMenu();
  emit("switch-app", app);
};
</script>

<style lang="scss">
.mobile-layout {
  @apply tw-w-full tw-shrink-0;

  &__header {
    @apply tw-h-[var(--app-bar-mobile-height)] tw-px-[var(--app-bar-padding-mobile,28px)];
    background-color: var(--app-bar-background);
  }

  &__navmenu {
    @apply tw-flex tw-flex-col tw-h-full tw-min-h-0;
  }

  &__tabs {
    @apply tw-relative tw-flex tw-shrink-0;
    border-bottom: 1px solid var(--app-bar-border);
  }

  &__tab {
    @apply tw-flex-1 tw-py-3 tw-text-center tw-text-xs tw-font-semibold tw-cursor-pointer tw-relative tw-border-0 tw-bg-transparent tw-z-[1];
    color: var(--app-bar-button);
    transition: color 0.15s ease;

    &:hover {
      color: var(--app-bar-button-hover);
    }

    &--active {
      color: var(--app-bar-burger);
    }
  }

  &__tab-label {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-gap-1;
  }

  &__tab-badge {
    @apply tw-inline-block tw-w-1.5 tw-h-1.5 tw-rounded-full;
    background-color: var(--danger-500, #ef4444);
  }

  &__tab-indicator {
    @apply tw-absolute tw-bottom-0 tw-left-0 tw-h-0.5 tw-w-1/2 tw-pointer-events-none;
    background-color: var(--app-bar-burger);
  }

  &__slider-viewport {
    @apply tw-flex-1 tw-min-h-0 tw-overflow-hidden;
  }

  &__slider {
    @apply tw-flex tw-h-full;
    width: 200%;
    will-change: transform;
  }

  &__menu-scroll {
    @apply tw-h-full tw-min-h-0;

    .vc-scrollable-container__viewport {
      @apply tw-pt-2;
      padding-left: var(--app-bar-padding);
      padding-right: var(--app-bar-padding);
    }

    // Make nested containers transparent — VcScrollableContainer is the sole scroll owner
    .vc-app-menu,
    .vc-container {
      @apply tw-h-auto tw-overflow-visible;
    }

    .vc-container__inner {
      @apply tw-overflow-visible;
    }
  }

  &__panel {
    @apply tw-h-full tw-min-h-0 tw-min-w-0;
    width: 50%;

    &--single {
      @apply tw-w-full;
    }

    &--hub {
      @apply tw-py-2;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
